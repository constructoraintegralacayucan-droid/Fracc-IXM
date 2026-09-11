import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import lotesSeed from "@/lib/lotes-seed.json";
import type { EstatusLote, TipoPago } from "@prisma/client";

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

function mapTipoPago(v: string | null): TipoPago | undefined {
  if (!v) return undefined;
  const norm = v.trim().toLowerCase();
  if (norm === "contado") return "CONTADO";
  if (norm === "crédito" || norm === "credito") return "CREDITO";
  return undefined;
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key || key !== process.env.AUTH_SECRET) {
    return NextResponse.json(
      { ok: false, message: "No autorizado." },
      { status: 401 }
    );
  }

  const existing = await prisma.proyectoConfig.count();
  if (existing > 0) {
    return NextResponse.json({
      ok: true,
      message:
        "La base de datos ya estaba configurada. No se hizo ningún cambio.",
    });
  }

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

  const data = lotesSeed as SeedLote[];
  const manzanaNumeros = Array.from(new Set(data.map((l) => l.manzana))).sort(
    (a, b) => a - b
  );

  const manzanaIdByNumero = new Map<number, string>();
  for (const numero of manzanaNumeros) {
    const m = await prisma.manzana.create({ data: { numero } });
    manzanaIdByNumero.set(numero, m.id);
  }

  for (const l of data) {
    await prisma.lote.create({
      data: {
        manzanaId: manzanaIdByNumero.get(l.manzana)!,
        numero: l.lote,
        clave: l.clave,
        precio: l.precio,
        estatus: l.estatus as EstatusLote,
        tipoPago: mapTipoPago(l.tipoPago),
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

  return NextResponse.json({
    ok: true,
    message: `Listo: se crearon ${manzanaNumeros.length} manzanas y ${data.length} lotes.`,
  });
}
