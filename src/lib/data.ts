import "server-only";
import { prisma } from "./prisma";

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
  const [total, disponibles, apartados, vendidos, montos] =
    await Promise.all([
      prisma.lote.count({ where: { desarrolloId } }),
      prisma.lote.count({ where: { desarrolloId, estatus: "DISPONIBLE" } }),
      prisma.lote.count({ where: { desarrolloId, estatus: "APARTADO" } }),
      prisma.lote.count({ where: { desarrolloId, estatus: "VENDIDO" } }),
      prisma.lote.aggregate({
        where: { desarrolloId },
        _sum: { precio: true, anticipo: true, saldo: true },
      }),
    ]);

  return {
    total,
    disponibles,
    apartados,
    vendidos,
    montoTotal: Number(montos._sum.precio ?? 0),
    anticipoTotal: Number(montos._sum.anticipo ?? 0),
    saldoTotal: Number(montos._sum.saldo ?? 0),
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

export async function getPrecioDesde(desarrolloId: string) {
  const min = await prisma.lote.aggregate({
    where: { desarrolloId, estatus: "DISPONIBLE" },
    _min: { precio: true },
  });
  return Number(min._min.precio ?? 0);
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
    include: { lote: { include: { manzana: true } } },
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
