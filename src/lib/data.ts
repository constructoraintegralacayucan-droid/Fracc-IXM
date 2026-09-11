import "server-only";
import { prisma } from "./prisma";

export async function getProyectoConfig() {
  const config = await prisma.proyectoConfig.findFirst();
  if (!config) {
    throw new Error("No hay configuración de proyecto. Corre el seed.");
  }
  return config;
}

export async function getManzanasConLotes() {
  return prisma.manzana.findMany({
    orderBy: { numero: "asc" },
    include: {
      lotes: {
        orderBy: { numero: "asc" },
      },
    },
  });
}

export async function getLotePorClave(clave: string) {
  return prisma.lote.findUnique({ where: { clave } });
}

export async function getStats() {
  const [total, disponibles, apartados, vendidos, montos] =
    await Promise.all([
      prisma.lote.count(),
      prisma.lote.count({ where: { estatus: "DISPONIBLE" } }),
      prisma.lote.count({ where: { estatus: "APARTADO" } }),
      prisma.lote.count({ where: { estatus: "VENDIDO" } }),
      prisma.lote.aggregate({
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

export async function getPrecioDesde() {
  const min = await prisma.lote.aggregate({
    where: { estatus: "DISPONIBLE" },
    _min: { precio: true },
  });
  return Number(min._min.precio ?? 0);
}

export async function getResumenPorManzana() {
  const manzanas = await prisma.manzana.findMany({
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

export async function getReservasPendientes() {
  return prisma.reserva.findMany({
    where: { estatus: "PENDIENTE" },
    orderBy: { createdAt: "desc" },
    include: { lote: { include: { manzana: true } } },
  });
}

export async function getReservasTodas() {
  return prisma.reserva.findMany({
    orderBy: { createdAt: "desc" },
    include: { lote: { include: { manzana: true } } },
  });
}

export async function getLotesConManzana() {
  return prisma.lote.findMany({
    orderBy: [{ manzana: { numero: "asc" } }, { numero: "asc" }],
    include: { manzana: true },
  });
}

export async function getLotePorId(id: string) {
  return prisma.lote.findUnique({
    where: { id },
    include: {
      manzana: true,
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
