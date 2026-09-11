import { PrismaClient, EstatusLote, TipoPago } from "@prisma/client";
import bcrypt from "bcryptjs";
import lotesSeed from "./lotes-seed.json";

const prisma = new PrismaClient();

type SeedLote = {
  manzana: number;
  lote: number;
  clave: string;
  precio: number;
  comprador: string | null;
  telefono: string | number | null;
  correo: string | null;
  tipoPago: string | null;
  anticipo: number;
  saldo: number;
  apartado: number;
  estatus: "DISPONIBLE" | "APARTADO" | "VENDIDO";
};

function mapTipoPago(v: string | null): TipoPago | null {
  if (!v) return null;
  const norm = v.trim().toLowerCase();
  if (norm === "contado") return TipoPago.CONTADO;
  if (norm === "crédito" || norm === "credito") return TipoPago.CREDITO;
  return null;
}

async function main() {
  console.log("Seeding proyecto config...");
  await prisma.proyectoConfig.deleteMany();
  await prisma.proyectoConfig.create({
    data: {
      nombre: "Fraccionamiento Ixmegallo",
      ubicacion: "Acayucan, Veracruz, México",
      moneda: "MXN",
      descripcion:
        "Fraccionamiento residencial en Acayucan, Veracruz, distribuido en 8 manzanas con 182 lotes, áreas comunes y financiamiento directo sin intereses.",
      inicialMinimoPct: 10,
      plazosMeses: [6, 12, 18, 24, 36, 48, 60, 72, 84, 96],
      tasaInteres: 0,
      reservaMinima: 5000,
      plazoReservaDias: 3,
    },
  });

  console.log("Seeding admin user...");
  const passwordHash = await bcrypt.hash("Ixmegallo2026!", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@ixmegallo.mx" },
    update: {},
    create: {
      email: "admin@ixmegallo.mx",
      passwordHash,
      nombre: "Administrador Ixmegallo",
      rol: "ADMIN",
    },
  });

  console.log("Clearing existing lots/manzanas...");
  await prisma.reserva.deleteMany();
  await prisma.lote.deleteMany();
  await prisma.manzana.deleteMany();

  const data = lotesSeed as SeedLote[];
  const manzanaNumeros = Array.from(new Set(data.map((l) => l.manzana))).sort(
    (a, b) => a - b
  );

  console.log(`Seeding ${manzanaNumeros.length} manzanas...`);
  const manzanaIdByNumero = new Map<number, string>();
  for (const numero of manzanaNumeros) {
    const m = await prisma.manzana.create({ data: { numero } });
    manzanaIdByNumero.set(numero, m.id);
  }

  console.log(`Seeding ${data.length} lotes...`);
  for (const l of data) {
    await prisma.lote.create({
      data: {
        manzanaId: manzanaIdByNumero.get(l.manzana)!,
        numero: l.lote,
        clave: l.clave,
        precio: l.precio,
        estatus: l.estatus as EstatusLote,
        tipoPago: mapTipoPago(l.tipoPago) ?? undefined,
        anticipo: l.anticipo,
        saldo: l.saldo,
        apartadoMonto: l.apartado,
        compradorNombre: l.comprador ?? undefined,
        compradorTelefono:
          l.telefono !== null && l.telefono !== undefined
            ? String(l.telefono)
            : undefined,
        compradorCorreo: l.correo ?? undefined,
      },
    });
  }

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
