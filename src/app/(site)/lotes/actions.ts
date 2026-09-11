"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getProyectoConfig } from "@/lib/data";

export type CrearReservaState = {
  ok: boolean;
  message: string;
};

export async function crearReserva(
  _prevState: CrearReservaState,
  formData: FormData
): Promise<CrearReservaState> {
  const clave = String(formData.get("clave") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const correo = String(formData.get("correo") ?? "").trim();
  const montoReserva = Number(formData.get("montoReserva") ?? 0);
  const planTipoPago = String(formData.get("planTipoPago") ?? "CONTADO");
  const plazoMeses = Number(formData.get("plazoMeses") ?? 0) || null;
  const inicialMonto = Number(formData.get("inicialMonto") ?? 0) || null;

  if (!clave || !nombre || !telefono) {
    return { ok: false, message: "Faltan datos obligatorios." };
  }
  if (!montoReserva || montoReserva <= 0) {
    return { ok: false, message: "El monto de reserva no es válido." };
  }

  const lote = await prisma.lote.findUnique({ where: { clave } });
  if (!lote) {
    return { ok: false, message: "El lote no existe." };
  }
  if (lote.estatus !== "DISPONIBLE") {
    return {
      ok: false,
      message: "Este lote ya no está disponible para reserva.",
    };
  }

  const config = await getProyectoConfig();
  const expiraEn = new Date();
  expiraEn.setDate(expiraEn.getDate() + config.plazoReservaDias);

  await prisma.$transaction([
    prisma.reserva.create({
      data: {
        loteId: lote.id,
        nombre,
        telefono,
        correo: correo || null,
        montoReserva,
        planTipoPago: planTipoPago === "CREDITO" ? "CREDITO" : "CONTADO",
        plazoMeses,
        inicialMonto,
        expiraEn,
      },
    }),
    prisma.lote.update({
      where: { id: lote.id },
      data: {
        estatus: "APARTADO",
        apartadoMonto: montoReserva,
      },
    }),
  ]);

  revalidatePath("/lotes");
  revalidatePath("/admin/reservas");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/lotes");

  return {
    ok: true,
    message:
      "¡Solicitud enviada! Nuestro equipo se pondrá en contacto contigo para confirmar tu apartado.",
  };
}
