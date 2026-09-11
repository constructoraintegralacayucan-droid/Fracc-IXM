"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClienteSession, destroyClienteSession } from "@/lib/cliente-session";

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
