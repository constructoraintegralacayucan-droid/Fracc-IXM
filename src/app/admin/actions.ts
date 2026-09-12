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
import type { EstatusLote, MetodoPago, TipoPago } from "@prisma/client";

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
  const tipoPagoRaw = String(formData.get("tipoPago") ?? "");
  const tipoPago = ["CONTADO", "CREDITO"].includes(tipoPagoRaw)
    ? (tipoPagoRaw as TipoPago)
    : null;
  const precioRaw = Number(formData.get("precio") ?? 0);
  const precio =
    Number.isFinite(precioRaw) && precioRaw > 0 ? precioRaw : undefined;
  const compradorNombre = String(formData.get("compradorNombre") ?? "").trim();
  const compradorTelefono = String(
    formData.get("compradorTelefono") ?? ""
  ).trim();
  const compradorCorreo = String(formData.get("compradorCorreo") ?? "").trim();

  if (!loteId) return;

  const lote = await prisma.lote.findUnique({
    where: { id: loteId },
    include: { desarrollo: true },
  });
  if (!lote) return;

  // "Contado" es la vía rápida para lotes pagados de una sola vez: no
  // requiere crear cuenta de cliente ni plan de pagos, se marca como
  // saldado con el precio público de contado (el mismo que vio el
  // comprador), no con el precio interno heredado del Excel.
  const precioContadoFinal = Number(
    lote.precioContado ?? lote.desarrollo.precioContadoDefault
  );

  await prisma.lote.update({
    where: { id: loteId },
    data: {
      estatus: ["DISPONIBLE", "APARTADO", "VENDIDO"].includes(estatus)
        ? estatus
        : undefined,
      tipoPago,
      precio,
      compradorNombre: compradorNombre || null,
      compradorTelefono: compradorTelefono || null,
      compradorCorreo: compradorCorreo || null,
      ...(estatus === "DISPONIBLE"
        ? { anticipo: 0, saldo: 0, apartadoMonto: 0 }
        : {}),
      ...(tipoPago === "CONTADO" && estatus !== "DISPONIBLE"
        ? { anticipo: precioContadoFinal, saldo: 0 }
        : {}),
    },
  });

  revalidatePath("/admin/lotes");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/${lote.desarrollo.slug}/lotes`);
}

export async function confirmarReserva(formData: FormData) {
  await requireAdmin();
  const reservaId = String(formData.get("reservaId") ?? "");
  if (!reservaId) return;

  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
    include: { lote: { include: { desarrollo: true } } },
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
  revalidatePath(`/${reserva.lote.desarrollo.slug}/lotes`);
}

export type AsignarClienteState = { ok: boolean; message: string };

export async function asignarCliente(
  _prevState: AsignarClienteState,
  formData: FormData
): Promise<AsignarClienteState> {
  await requireAdmin();

  const loteId = String(formData.get("loteId") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!loteId || !email || !nombre || !password) {
    return { ok: false, message: "Completa correo, nombre y contraseña." };
  }
  if (password.length < 6) {
    return {
      ok: false,
      message: "La contraseña debe tener al menos 6 caracteres.",
    };
  }

  const existente = await prisma.cliente.findUnique({ where: { email } });
  if (existente) {
    await prisma.lote.update({
      where: { id: loteId },
      data: { clienteId: existente.id },
    });
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    const cliente = await prisma.cliente.create({
      data: { email, nombre, telefono: telefono || null, passwordHash },
    });
    await prisma.lote.update({
      where: { id: loteId },
      data: { clienteId: cliente.id },
    });
  }

  revalidatePath(`/admin/lotes/${loteId}`);
  revalidatePath("/admin/lotes");
  return { ok: true, message: "Cliente asignado correctamente." };
}

export async function desasignarCliente(formData: FormData) {
  await requireAdmin();
  const loteId = String(formData.get("loteId") ?? "");
  if (!loteId) return;

  await prisma.lote.update({
    where: { id: loteId },
    data: { clienteId: null },
  });

  revalidatePath(`/admin/lotes/${loteId}`);
  revalidatePath("/admin/lotes");
}

export async function actualizarPlanPago(formData: FormData) {
  await requireAdmin();

  const loteId = String(formData.get("loteId") ?? "");
  const numPagosTotal = Number(formData.get("numPagosTotal") ?? 0);
  const montoPagoMensual = Number(formData.get("montoPagoMensual") ?? 0);
  const fechaInicioPagos = String(formData.get("fechaInicioPagos") ?? "");

  if (!loteId) return;

  await prisma.lote.update({
    where: { id: loteId },
    data: {
      numPagosTotal: numPagosTotal > 0 ? Math.round(numPagosTotal) : null,
      montoPagoMensual: montoPagoMensual > 0 ? montoPagoMensual : null,
      fechaInicioPagos: fechaInicioPagos ? new Date(fechaInicioPagos) : null,
    },
  });

  revalidatePath(`/admin/lotes/${loteId}`);
}

export async function actualizarPreciosLote(formData: FormData) {
  await requireAdmin();

  const loteId = String(formData.get("loteId") ?? "");
  if (!loteId) return;

  const precioContadoRaw = String(formData.get("precioContado") ?? "").trim();
  const precioCreditoRaw = String(formData.get("precioCredito") ?? "").trim();
  const precioContado = precioContadoRaw ? Number(precioContadoRaw) : null;
  const precioCredito = precioCreditoRaw ? Number(precioCreditoRaw) : null;

  const lote = await prisma.lote.update({
    where: { id: loteId },
    data: {
      precioContado:
        precioContado !== null && precioContado > 0 ? precioContado : null,
      precioCredito:
        precioCredito !== null && precioCredito > 0 ? precioCredito : null,
    },
    include: { desarrollo: true },
  });

  revalidatePath(`/admin/lotes/${loteId}`);
  revalidatePath(`/${lote.desarrollo.slug}/lotes`);
}

export async function registrarPago(formData: FormData) {
  const admin = await requireAdmin();

  const loteId = String(formData.get("loteId") ?? "");
  const monto = Number(formData.get("monto") ?? 0);
  const fecha = String(formData.get("fecha") ?? "");
  const metodo = String(formData.get("metodo") ?? "EFECTIVO") as MetodoPago;
  const notas = String(formData.get("notas") ?? "").trim();
  const numeroCuotaRaw = formData.get("numeroCuota");
  const numeroCuota = numeroCuotaRaw ? Number(numeroCuotaRaw) : null;

  if (!loteId || !monto || monto <= 0) return;

  await prisma.pago.create({
    data: {
      loteId,
      monto,
      fecha: fecha ? new Date(fecha) : new Date(),
      metodo: [
        "EFECTIVO",
        "TRANSFERENCIA",
        "DEPOSITO",
        "TARJETA",
        "OTRO",
      ].includes(metodo)
        ? metodo
        : "EFECTIVO",
      notas: notas || null,
      numeroCuota: numeroCuota && numeroCuota > 0 ? numeroCuota : null,
      registradoPor: admin.email,
    },
  });

  revalidatePath(`/admin/lotes/${loteId}`);
  revalidatePath("/cliente/dashboard");
}

export async function eliminarPago(formData: FormData) {
  await requireAdmin();
  const pagoId = String(formData.get("pagoId") ?? "");
  const loteId = String(formData.get("loteId") ?? "");
  if (!pagoId) return;

  await prisma.pago.delete({ where: { id: pagoId } });

  revalidatePath(`/admin/lotes/${loteId}`);
  revalidatePath("/cliente/dashboard");
}

export type ActualizarConfigState = { ok: boolean; message: string };

export async function actualizarConfig(
  _prevState: ActualizarConfigState,
  formData: FormData
): Promise<ActualizarConfigState> {
  await requireAdmin();

  const desarrolloId = String(formData.get("desarrolloId") ?? "");
  const config = desarrolloId
    ? await prisma.desarrollo.findUnique({ where: { id: desarrolloId } })
    : null;
  if (!config) {
    return { ok: false, message: "No hay configuración para actualizar." };
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const ubicacion = String(formData.get("ubicacion") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const precioContadoDefault = Number(
    formData.get("precioContadoDefault") ?? 0
  );
  const precioCreditoDefault = Number(
    formData.get("precioCreditoDefault") ?? 0
  );
  const inicialMinimoPct = Number(formData.get("inicialMinimoPct") ?? 20);
  const plazoMaxPublico = Number(formData.get("plazoMaxPublico") ?? 24);
  const plazoRecomendado = Number(formData.get("plazoRecomendado") ?? 12);
  const tasaInteres = Number(formData.get("tasaInteres") ?? 0);
  const reservaMinima = Number(formData.get("reservaMinima") ?? 0);
  const plazoReservaDias = Number(formData.get("plazoReservaDias") ?? 3);

  const ofertaActiva = formData.get("ofertaActiva") === "on";
  const ofertaTitulo = String(formData.get("ofertaTitulo") ?? "").trim();
  const ofertaFinRaw = String(formData.get("ofertaFin") ?? "");
  const disclaimer = String(formData.get("disclaimer") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const terminosCondiciones = String(
    formData.get("terminosCondiciones") ?? ""
  );
  const avisoPrivacidad = String(formData.get("avisoPrivacidad") ?? "");

  if (!nombre || !ubicacion) {
    return { ok: false, message: "Nombre y ubicación son obligatorios." };
  }
  if (precioContadoDefault <= 0 || precioCreditoDefault <= 0) {
    return {
      ok: false,
      message: "Los precios de contado y crédito deben ser mayores a cero.",
    };
  }

  await prisma.desarrollo.update({
    where: { id: config.id },
    data: {
      nombre,
      ubicacion,
      descripcion,
      precioContadoDefault,
      precioCreditoDefault,
      inicialMinimoPct,
      plazoMaxPublico,
      plazoRecomendado,
      tasaInteres,
      reservaMinima,
      plazoReservaDias,
      ofertaActiva,
      ofertaTitulo: ofertaTitulo || null,
      ofertaFin: ofertaFinRaw ? new Date(ofertaFinRaw) : null,
      disclaimer,
      whatsapp: whatsapp || null,
      terminosCondiciones,
      avisoPrivacidad,
    },
  });

  revalidatePath(`/${config.slug}`);
  revalidatePath(`/${config.slug}/lotes`);
  revalidatePath(`/${config.slug}/terminos`);
  revalidatePath(`/${config.slug}/privacidad`);
  revalidatePath("/admin/configuracion");

  return { ok: true, message: "Configuración actualizada." };
}

export type CrearDesarrolloState = { ok: boolean; message: string };

export async function crearDesarrollo(
  _prevState: CrearDesarrolloState,
  formData: FormData
): Promise<CrearDesarrolloState> {
  await requireAdmin();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const ubicacion = String(formData.get("ubicacion") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugRaw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!nombre || !ubicacion || !slug) {
    return {
      ok: false,
      message: "Nombre, ubicación y slug son obligatorios.",
    };
  }

  const existente = await prisma.desarrollo.findUnique({ where: { slug } });
  if (existente) {
    return {
      ok: false,
      message: `Ya existe un desarrollo con la dirección "${slug}". Usa otro nombre.`,
    };
  }

  const ultimo = await prisma.desarrollo.findFirst({
    orderBy: { orden: "desc" },
  });

  await prisma.desarrollo.create({
    data: {
      slug,
      nombre,
      ubicacion,
      activo: false,
      orden: (ultimo?.orden ?? -1) + 1,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/desarrollos");

  return {
    ok: true,
    message: `Desarrollo "${nombre}" creado. Complétalo y actívalo cuando esté listo para publicarse.`,
  };
}

export async function actualizarEstadoDesarrollo(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const activo = formData.get("activo") === "on";
  if (!id) return;

  const desarrollo = await prisma.desarrollo.update({
    where: { id },
    data: { activo },
  });

  revalidatePath("/");
  revalidatePath(`/${desarrollo.slug}`);
  revalidatePath("/admin/desarrollos");
}

const TIPOS_IMAGEN_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES_IMAGEN_PORTADA = 4 * 1024 * 1024;

export async function subirImagenPortada(
  _prevState: SubirImagenState,
  formData: FormData
): Promise<SubirImagenState> {
  await requireAdmin();

  const desarrolloId = String(formData.get("desarrolloId") ?? "");
  const file = formData.get("imagen");
  if (!desarrolloId) {
    return { ok: false, message: "Falta el desarrollo." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecciona una imagen." };
  }
  if (!TIPOS_IMAGEN_PERMITIDOS.includes(file.type)) {
    return {
      ok: false,
      message: "Formato no permitido. Usa JPG, PNG o WEBP.",
    };
  }
  if (file.size > MAX_BYTES_IMAGEN_PORTADA) {
    return {
      ok: false,
      message: "La imagen pesa más de 4MB. Comprímela e intenta de nuevo.",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

  const desarrollo = await prisma.desarrollo.update({
    where: { id: desarrolloId },
    data: { imagenPortada: dataUrl },
  });

  revalidatePath("/");
  revalidatePath(`/${desarrollo.slug}`);
  revalidatePath("/admin/desarrollos");

  return { ok: true, message: "Foto de portada actualizada." };
}

export async function quitarImagenPortada(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("desarrolloId") ?? "");
  if (!id) return;

  const desarrollo = await prisma.desarrollo.update({
    where: { id },
    data: { imagenPortada: null },
  });

  revalidatePath("/");
  revalidatePath(`/${desarrollo.slug}`);
  revalidatePath("/admin/desarrollos");
}
const MAX_BYTES_IMAGEN = 4 * 1024 * 1024;

export type SubirImagenState = { ok: boolean; message: string };

export async function subirImagenGaleria(
  _prevState: SubirImagenState,
  formData: FormData
): Promise<SubirImagenState> {
  await requireAdmin();

  const desarrolloId = String(formData.get("desarrolloId") ?? "");
  const file = formData.get("imagen");
  if (!desarrolloId) {
    return { ok: false, message: "Falta el desarrollo." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecciona una imagen." };
  }
  if (!TIPOS_IMAGEN_PERMITIDOS.includes(file.type)) {
    return {
      ok: false,
      message: "Formato no permitido. Usa JPG, PNG o WEBP.",
    };
  }
  if (file.size > MAX_BYTES_IMAGEN) {
    return {
      ok: false,
      message: "La imagen pesa más de 4MB. Comprímela e intenta de nuevo.",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

  const [count, desarrollo] = await Promise.all([
    prisma.imagenGaleria.count({ where: { desarrolloId } }),
    prisma.desarrollo.findUnique({ where: { id: desarrolloId } }),
  ]);
  await prisma.imagenGaleria.create({
    data: { dataUrl, orden: count, desarrolloId },
  });

  if (desarrollo) revalidatePath(`/${desarrollo.slug}`);
  revalidatePath("/admin/configuracion");

  return { ok: true, message: "Imagen agregada." };
}

export async function eliminarImagenGaleria(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const imagen = await prisma.imagenGaleria.delete({
    where: { id },
    include: { desarrollo: true },
  });

  revalidatePath(`/${imagen.desarrollo.slug}`);
  revalidatePath("/admin/configuracion");
}

export async function aprobarTestimonio(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const testimonio = await prisma.testimonio.update({
    where: { id },
    data: { estatus: "APROBADO" },
    include: { desarrollo: true },
  });

  revalidatePath(`/${testimonio.desarrollo.slug}`);
  revalidatePath("/admin/testimonios");
}

export async function rechazarTestimonio(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const testimonio = await prisma.testimonio.update({
    where: { id },
    data: { estatus: "RECHAZADO" },
    include: { desarrollo: true },
  });

  revalidatePath(`/${testimonio.desarrollo.slug}`);
  revalidatePath("/admin/testimonios");
}

export async function cancelarReserva(formData: FormData) {
  await requireAdmin();
  const reservaId = String(formData.get("reservaId") ?? "");
  if (!reservaId) return;

  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
    include: { lote: { include: { desarrollo: true } } },
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
  revalidatePath(`/${reserva.lote.desarrollo.slug}/lotes`);
}
