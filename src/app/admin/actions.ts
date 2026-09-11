"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createAdminSession,
  destroyAdminSession,
} from "@/lib/session";
import { requireAdmin } from "@/lib/require-admin";
import type { EstatusLote } from "@prisma/client";

export type LoginState = { ok: boolean; message: string };

export async function loginAdmin(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Ingresa correo y contraseña." };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, message: "Credenciales inválidas." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { ok: false, message: "Credenciales inválidas." };
  }

  await createAdminSession({
    sub: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol,
  });

  redirect("/admin/dashboard");
}

export async function logoutAdmin() {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function actualizarLote(formData: FormData) {
  await requireAdmin();

  const loteId = String(formData.get("loteId") ?? "");
  const estatus = String(formData.get("estatus") ?? "") as EstatusLote;
  const precio = Number(formData.get("precio") ?? 0);
  const compradorNombre = String(formData.get("compradorNombre") ?? "").trim();
  const compradorTelefono = String(
    formData.get("compradorTelefono") ?? ""
  ).trim();
  const compradorCorreo = String(formData.get("compradorCorreo") ?? "").trim();

  if (!loteId) return;

  await prisma.lote.update({
    where: { id: loteId },
    data: {
      estatus: ["DISPONIBLE", "APARTADO", "VENDIDO"].includes(estatus)
        ? estatus
        : undefined,
      precio: Number.isFinite(precio) && precio > 0 ? precio : undefined,
      compradorNombre: compradorNombre || null,
      compradorTelefono: compradorTelefono || null,
      compradorCorreo: compradorCorreo || null,
      ...(estatus === "DISPONIBLE"
        ? { anticipo: 0, saldo: 0, apartadoMonto: 0 }
        : {}),
    },
  });

  revalidatePath("/admin/lotes");
  revalidatePath("/admin/dashboard");
  revalidatePath("/lotes");
}

export async function confirmarReserva(formData: FormData) {
  await requireAdmin();
  const reservaId = String(formData.get("reservaId") ?? "");
  if (!reservaId) return;

  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
    include: { lote: true },
  });
  if (!reserva) return;

  await prisma.$transaction([
    prisma.reserva.update({
      where: { id: reservaId },
      data: { estatus: "CONFIRMADA" },
    }),
    prisma.lote.update({
      where: { id: reserva.loteId },
      data: {
        estatus: "APARTADO",
        compradorNombre: reserva.nombre,
        compradorTelefono: reserva.telefono,
        compradorCorreo: reserva.correo ?? undefined,
        tipoPago: reserva.planTipoPago,
      },
    }),
  ]);

  revalidatePath("/admin/reservas");
  revalidatePath("/admin/lotes");
  revalidatePath("/admin/dashboard");
  revalidatePath("/lotes");
}

export async function cancelarReserva(formData: FormData) {
  await requireAdmin();
  const reservaId = String(formData.get("reservaId") ?? "");
  if (!reservaId) return;

  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
  });
  if (!reserva) return;

  await prisma.$transaction([
    prisma.reserva.update({
      where: { id: reservaId },
      data: { estatus: "CANCELADA" },
    }),
    prisma.lote.update({
      where: { id: reserva.loteId },
      data: { estatus: "DISPONIBLE", apartadoMonto: 0 },
    }),
  ]);

  revalidatePath("/admin/reservas");
  revalidatePath("/admin/lotes");
  revalidatePath("/admin/dashboard");
  revalidatePath("/lotes");
}
