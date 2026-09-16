import "server-only";
import { prisma } from "./prisma";
import { calcularEstadoCuenta, precioVentaEfectivo } from "./pagos";

/** Desarrollos activos, para la pantalla de selección "Terranova". */
export async function getDesarrollos() {
  return prisma.desarrollo.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
  });
}

/** Todos los desarrollos (activos e inactivos), para administración. */
export async function getDesarrollosTodos() {
  return prisma.desarrollo.findMany({
    orderBy: { orden: "asc" },
  });
}

export async function getDesarrolloBySlug(slug: string) {
  return prisma.desarrollo.findUnique({ where: { slug } });
}

export async function getDesarrolloPorId(id: string) {
  return prisma.desarrollo.findUnique({ where: { id } });
}

/**
 * Para las páginas de administración: resuelve qué desarrollo se está
 * viendo/editando a partir del ?desarrollo=slug de la URL, cayendo al
 * primero por orden si no se especifica o no existe.
 */
export async function resolverDesarrolloAdmin(slugParam?: string) {
  const desarrollos = await getDesarrollosTodos();
  const actual =
    desarrollos.find((d) => d.slug === slugParam) ?? desarrollos[0] ?? null;
  // Solo los campos planos que necesita el <select> de cambio de
  // desarrollo (un Client Component no puede recibir los Decimal de Prisma).
  const desarrollosPlano = desarrollos.map((d) => ({
    slug: d.slug,
    nombre: d.nombre,
    activo: d.activo,
  }));
  return { desarrollos: desarrollosPlano, actual };
}

export async function getManzanasConLotes(desarrolloId: string) {
  return prisma.manzana.findMany({
    where: { desarrolloId },
    orderBy: { numero: "asc" },
    include: {
      lotes: {
        orderBy: { numero: "asc" },
      },
    },
  });
}

export async function getStats(desarrolloId: string) {
  const [total, disponibles, apartados, vendidos, montos, desarrollo, lotesVendidos] =
    await Promise.all([
      prisma.lote.count({ where: { desarrolloId } }),
      prisma.lote.count({ where: { desarrolloId, estatus: "DISPONIBLE" } }),
      prisma.lote.count({ where: { desarrolloId, estatus: "APARTADO" } }),
      prisma.lote.count({ where: { desarrolloId, estatus: "VENDIDO" } }),
      prisma.lote.aggregate({
        where: { desarrolloId },
        _sum: { precio: true, anticipo: true },
      }),
      prisma.desarrollo.findUniqueOrThrow({ where: { id: desarrolloId } }),
      prisma.lote.findMany({
        where: { desarrolloId, estatus: { not: "DISPONIBLE" } },
        include: { pagos: true },
      }),
    ]);

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const en7Dias = new Date();
  en7Dias.setDate(en7Dias.getDate() + 7);

  let saldoTotal = 0;
  let pagosProximos = 0;
  let pagosAtrasados = 0;

  for (const lote of lotesVendidos) {
    const tipoPagoEfectivo = lote.numPagosTotal ? "CREDITO" : lote.tipoPago;
    const precioVenta = precioVentaEfectivo(
      {
        tipoPago: tipoPagoEfectivo,
        precioContado: lote.precioContado ? Number(lote.precioContado) : null,
        precioCredito: lote.precioCredito ? Number(lote.precioCredito) : null,
        precio: Number(lote.precio),
      },
      {
        precioContadoDefault: Number(desarrollo.precioContadoDefault),
        precioCreditoDefault: Number(desarrollo.precioCreditoDefault),
      }
    );
    const estado = calcularEstadoCuenta(
      {
        precio: precioVenta,
        anticipo: Number(lote.anticipo),
        numPagosTotal: lote.numPagosTotal,
        montoPagoMensual: lote.montoPagoMensual
          ? Number(lote.montoPagoMensual)
          : null,
        fechaInicioPagos: lote.fechaInicioPagos,
      },
      lote.pagos.map((p) => ({
        monto: Number(p.monto),
        fecha: p.fecha,
        numeroCuota: p.numeroCuota,
      }))
    );
    saldoTotal += estado.saldoPendiente;
    if (estado.enAtraso) {
      pagosAtrasados += 1;
    } else if (
      estado.proximaFechaVencimiento &&
      estado.proximaFechaVencimiento <= en7Dias
    ) {
      pagosProximos += 1;
    }
  }

  const cobradoEsteMes = await prisma.pago.aggregate({
    where: { lote: { desarrolloId }, fecha: { gte: inicioMes } },
    _sum: { monto: true },
  });

  return {
    total,
    disponibles,
    apartados,
    vendidos,
    montoTotal: Number(montos._sum.precio ?? 0),
    anticipoTotal: Number(montos._sum.anticipo ?? 0),
    saldoTotal,
    cobradoEsteMes: Number(cobradoEsteMes._sum.monto ?? 0),
    pagosProximos,
    pagosAtrasados,
  };
}

export async function getGaleriaImagenes(desarrolloId: string) {
  return prisma.imagenGaleria.findMany({
    where: { desarrolloId },
    orderBy: { orden: "asc" },
  });
}

export async function getTestimoniosAprobados(desarrolloId: string) {
  return prisma.testimonio.findMany({
    where: { desarrolloId, estatus: "APROBADO" },
    orderBy: { createdAt: "desc" },
    take: 9,
  });
}

export async function getTestimonioDeCliente(clienteId: string) {
  return prisma.testimonio.findFirst({
    where: { clienteId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTestimoniosTodos(desarrolloId: string) {
  return prisma.testimonio.findMany({
    where: { desarrolloId },
    orderBy: { createdAt: "desc" },
    include: { cliente: true },
  });
}

/**
 * Precio "desde" que se muestra en la portada: el menor precio de
 * contado real entre los lotes disponibles (su propio precioContado, o
 * el valor por defecto del desarrollo si no tienen uno propio).
 */
export async function getPrecioDesde(desarrolloId: string) {
  const [desarrollo, lotes] = await Promise.all([
    prisma.desarrollo.findUnique({
      where: { id: desarrolloId },
      select: { precioContadoDefault: true },
    }),
    prisma.lote.findMany({
      where: { desarrolloId, estatus: "DISPONIBLE" },
      select: { precioContado: true },
    }),
  ]);

  const defaultPrecio = Number(desarrollo?.precioContadoDefault ?? 0);
  const precios = lotes.map((l) =>
    l.precioContado != null ? Number(l.precioContado) : defaultPrecio
  );

  return precios.length > 0 ? Math.min(...precios) : defaultPrecio;
}

/** Resumen para el hero de la portada: precio desde, precio por m², medidas
 * y cuántos lotes hay disponibles ahora mismo (para no inventar cifras). */
export async function getResumenHero(desarrolloId: string) {
  const [desarrollo, disponibles] = await Promise.all([
    prisma.desarrollo.findUnique({ where: { id: desarrolloId } }),
    prisma.lote.count({ where: { desarrolloId, estatus: "DISPONIBLE" } }),
  ]);
  if (!desarrollo) {
    return null;
  }

  const precioDesde = await getPrecioDesde(desarrolloId);
  const areaM2 = desarrollo.areaM2Default;
  const precioPorM2 = areaM2 > 0 ? precioDesde / areaM2 : 0;

  return {
    precioDesde,
    precioPorM2,
    areaM2,
    frenteM: desarrollo.frenteMDefault,
    fondoM: desarrollo.fondoMDefault,
    disponibles,
    moneda: desarrollo.moneda,
    ciudad: desarrollo.ciudad,
  };
}

export async function getResumenPorManzana(desarrolloId: string) {
  const manzanas = await prisma.manzana.findMany({
    where: { desarrolloId },
    orderBy: { numero: "asc" },
    include: { lotes: true },
  });

  return manzanas.map((m) => {
    const totalLotes = m.lotes.length;
    const disponibles = m.lotes.filter(
      (l) => l.estatus === "DISPONIBLE"
    ).length;
    const apartados = m.lotes.filter((l) => l.estatus === "APARTADO").length;
    const vendidos = m.lotes.filter((l) => l.estatus === "VENDIDO").length;
    const montoTotal = m.lotes.reduce((acc, l) => acc + Number(l.precio), 0);
    return {
      manzana: m.numero,
      totalLotes,
      disponibles,
      apartados,
      vendidos,
      montoTotal,
    };
  });
}

export async function getReservasPendientes(desarrolloId: string) {
  return prisma.reserva.findMany({
    where: { estatus: "PENDIENTE", lote: { desarrolloId } },
    orderBy: { createdAt: "desc" },
    include: { lote: { include: { manzana: true } } },
  });
}

export async function getReservasTodas(desarrolloId: string) {
  return prisma.reserva.findMany({
    where: { lote: { desarrolloId } },
    orderBy: { createdAt: "desc" },
    include: {
      lote: { include: { manzana: true } },
      pagos: true,
      colaborador: true,
    },
  });
}

export async function getLotesConManzana(desarrolloId: string) {
  return prisma.lote.findMany({
    where: { desarrolloId },
    orderBy: [{ manzana: { numero: "asc" } }, { numero: "asc" }],
    include: { manzana: true },
  });
}

export async function getLotePorId(id: string) {
  return prisma.lote.findUnique({
    where: { id },
    include: {
      manzana: true,
      desarrollo: true,
      cliente: true,
      pagos: { orderBy: { fecha: "asc" } },
    },
  });
}

export async function getLotesDeCliente(clienteId: string) {
  return prisma.lote.findMany({
    where: { clienteId },
    orderBy: [{ manzana: { numero: "asc" } }, { numero: "asc" }],
    include: {
      manzana: true,
      desarrollo: true,
      pagos: { orderBy: { fecha: "asc" } },
    },
  });
}

/** Solo números de lote de una manzana, sin datos sensibles — para dar contexto visual al cliente sin exponer info de otros compradores. */
export async function getNumerosLotesDeManzana(manzanaId: string) {
  const lotes = await prisma.lote.findMany({
    where: { manzanaId },
    select: { numero: true, clave: true },
    orderBy: { numero: "asc" },
  });
  return lotes;
}
