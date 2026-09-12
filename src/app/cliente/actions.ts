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
import { crearCheckoutHospedado } from "@/lib/conekta";
import { getSiteOrigin } from "@/lib/site";

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

  const lote = await prisma.lote.findFirst({
    where: { clienteId: session.sub },
    select: { desarrolloId: true },
  });
  if (!lote) {
    return { ok: false, message: "No tienes ningún lote asignado." };
  }

  await prisma.testimonio.create({
    data: {
      desarrolloId: lote.desarrolloId,
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

export type IniciarPagoCuotaState = {
  ok: boolean;
  message: string;
  checkoutUrl?: string;
};

export async function iniciarPagoCuota(
  _prevState: IniciarPagoCuotaState,
  formData: FormData
): Promise<IniciarPagoCuotaState> {
  const session = await getClienteSession();
  if (!session) {
    return { ok: false, message: "Tu sesión expiró, vuelve a iniciar sesión." };
  }

  const loteId = String(formData.get("loteId") ?? "");
  const monto = Number(formData.get("monto") ?? 0);
  const numeroCuota = Number(formData.get("numeroCuota") ?? 0) || null;

  if (!loteId || !monto || monto <= 0) {
    return { ok: false, message: "Monto inválido." };
  }

  const [lote, cliente] = await Promise.all([
    prisma.lote.findUnique({ where: { id: loteId } }),
    prisma.cliente.findUnique({ where: { id: session.sub } }),
  ]);

  if (!lote || lote.clienteId !== session.sub) {
    return { ok: false, message: "Este lote no pertenece a tu cuenta." };
  }
  if (!cliente) {
    return { ok: false, message: "No se encontró tu cuenta." };
  }

  try {
    const origin = await getSiteOrigin();
    const checkout = await crearCheckoutHospedado({
      monto,
      descripcion: `Mensualidad lote ${lote.clave} - Fraccionamiento Ixmegallo`,
      nombre: cliente.nombre,
      correo: cliente.email,
      telefono: cliente.telefono || undefined,
      successUrl: `${origin}/pago-exitoso?tipo=cuota`,
      failureUrl: `${origin}/pago-fallido?tipo=cuota`,
      metadata: { loteId: lote.id, clienteId: cliente.id, tipo: "CUOTA" },
    });

    await prisma.ordenPago.create({
      data: {
        conektaOrderId: checkout.orderId,
        checkoutUrl: checkout.checkoutUrl,
        tipo: "CUOTA",
        monto,
        loteId: lote.id,
        clienteId: cliente.id,
        numeroCuota,
      },
    });

    return {
      ok: true,
      message: "Redirigiendo al pago...",
      checkoutUrl: checkout.checkoutUrl,
    };
  } catch (err) {
    console.error("Error creando checkout de Conekta:", err);
    return {
      ok: false,
      message:
        "No pudimos iniciar el pago en línea. Intenta más tarde o contacta a administración.",
    };
  }
}
