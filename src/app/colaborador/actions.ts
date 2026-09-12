"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  createColaboradorSession,
  destroyColaboradorSession,
  getColaboradorSession,
} from "@/lib/colaborador-session";
import { getDesarrolloBySlug } from "@/lib/data";

export type LoginColaboradorState = { ok: boolean; message: string };

export async function loginColaborador(
  _prevState: LoginColaboradorState,
  formData: FormData
): Promise<LoginColaboradorState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Ingresa correo y contraseña." };
  }

  const colaborador = await prisma.colaborador.findUnique({
    where: { email },
  });
  if (!colaborador || !colaborador.activo) {
    return { ok: false, message: "Credenciales inválidas." };
  }

  const valid = await bcrypt.compare(password, colaborador.passwordHash);
  if (!valid) {
    return { ok: false, message: "Credenciales inválidas." };
  }

  await createColaboradorSession({
    sub: colaborador.id,
    email: colaborador.email,
    nombre: colaborador.nombre,
  });

  redirect("/colaborador/dashboard");
}

export async function logoutColaborador() {
  await destroyColaboradorSession();
  redirect("/colaborador/login");
}

export type CrearSolicitudState = {
  ok: boolean;
  message: string;
};

export async function crearSolicitudColaborador(
  _prevState: CrearSolicitudState,
  formData: FormData
): Promise<CrearSolicitudState> {
  const session = await getColaboradorSession();
  if (!session) {
    return { ok: false, message: "Tu sesión expiró, vuelve a iniciar sesión." };
  }

  const desarrolloSlug = String(formData.get("desarrolloSlug") ?? "");
  const clave = String(formData.get("clave") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const correo = String(formData.get("correo") ?? "").trim();
  const montoReserva = Number(formData.get("montoReserva") ?? 0);
  const planTipoPago = String(formData.get("planTipoPago") ?? "CONTADO");
  const plazoMeses = Number(formData.get("plazoMeses") ?? 0) || null;
  const mensajeCliente = String(formData.get("mensajeCliente") ?? "").trim();

  if (!clave || !nombre || !telefono) {
    return { ok: false, message: "Faltan datos obligatorios." };
  }
  if (!montoReserva || montoReserva <= 0) {
    return { ok: false, message: "El monto de apartado no es válido." };
  }

  const desarrollo = await getDesarrolloBySlug(desarrolloSlug);
  if (!desarrollo) {
    return { ok: false, message: "El desarrollo no existe." };
  }

  const lote = await prisma.lote.findUnique({
    where: { desarrolloId_clave: { desarrolloId: desarrollo.id, clave } },
  });
  if (!lote) {
    return { ok: false, message: "El lote no existe." };
  }
  if (lote.estatus !== "DISPONIBLE") {
    return {
      ok: false,
      message: "Este lote ya no está disponible.",
    };
  }

  const expiraEn = new Date();
  expiraEn.setDate(expiraEn.getDate() + desarrollo.plazoReservaDias);

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
        mensajeCliente: mensajeCliente || null,
        colaboradorId: session.sub,
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

  revalidatePath("/colaborador/dashboard");
  revalidatePath("/admin/reservas");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/lotes");
  revalidatePath(`/${desarrolloSlug}/lotes`);

  return {
    ok: true,
    message:
      "¡Solicitud enviada! El administrador la revisará y confirmará el apartado.",
  };
}
