"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createClienteSession,
  destroyClienteSession,
  getClienteSession,
} from "@/lib/cliente-session";

export type LoginClienteState = { ok: boolean; message: string };

export async function loginCliente(
  _prevState: LoginClienteState,
  formData: FormData
): Promise<LoginClienteState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Ingresa correo y contraseña." };
  }

  const cliente = await prisma.cliente.findUnique({ where: { email } });
  if (!cliente) {
    return { ok: false, message: "Credenciales inválidas." };
  }

  const valid = await bcrypt.compare(password, cliente.passwordHash);
  if (!valid) {
    return { ok: false, message: "Credenciales inválidas." };
  }

  await createClienteSession({
    sub: cliente.id,
    email: cliente.email,
    nombre: cliente.nombre,
  });

  redirect("/cliente/dashboard");
}

export async function logoutCliente() {
  await destroyClienteSession();
  redirect("/cliente/login");
}

export type EnviarTestimonioState = { ok: boolean; message: string };

export async function enviarTestimonio(
  _prevState: EnviarTestimonioState,
  formData: FormData
): Promise<EnviarTestimonioState> {
  const session = await getClienteSession();
  if (!session) {
    return { ok: false, message: "Tu sesión expiró, vuelve a iniciar sesión." };
  }

  const mensaje = String(formData.get("mensaje") ?? "").trim();
  const calificacion = Number(formData.get("calificacion") ?? 5);

  if (!mensaje || mensaje.length < 10) {
    return {
      ok: false,
      message: "Cuéntanos un poco más (al menos 10 caracteres).",
    };
  }

  await prisma.testimonio.create({
    data: {
      clienteId: session.sub,
      nombre: session.nombre,
      mensaje,
      calificacion: Math.min(5, Math.max(1, Math.round(calificacion))),
    },
  });

  revalidatePath("/cliente/dashboard");
  revalidatePath("/admin/testimonios");

  return {
    ok: true,
    message:
      "¡Gracias! Tu testimonio quedó pendiente de aprobación antes de publicarse.",
  };
}
