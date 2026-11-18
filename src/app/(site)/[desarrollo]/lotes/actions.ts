"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getDesarrolloBySlug } from "@/lib/data";
import { crearCheckoutHospedado } from "@/lib/conekta";
import { getSiteOrigin } from "@/lib/site";
import { validarCupon, calcularDescuentoCupon } from "@/lib/cupones";

export type CrearReservaState = {
  ok: boolean;
  message: string;
  checkoutUrl?: string;
  reservaId?: string;
};

export type ValidarCuponState = {
  ok: boolean;
  message: string;
  codigo?: string;
  descuentoContado?: number;
  descuentoCredito?: number;
};

export async function validarCuponAction(
  _prevState: ValidarCuponState,
  formData: FormData
): Promise<ValidarCuponState> {
  const desarrolloSlug = String(formData.get("desarrolloSlug") ?? "");
  const codigo = String(formData.get("cuponCodigo") ?? "");
  const precioContado = Number(formData.get("precioContado") ?? 0);
  const precioCredito = Number(formData.get("precioCredito") ?? 0);

  const desarrollo = await getDesarrolloBySlug(desarrolloSlug);
  if (!desarrollo) {
    return { ok: false, message: "El desarrollo no existe." };
  }

  const resultado = await validarCupon(desarrollo.id, codigo);
  if (!resultado.ok) {
    return { ok: false, message: resultado.message };
  }

  return {
    ok: true,
    message: resultado.cupon.descripcion
      ? `¡Cupón aplicado! ${resultado.cupon.descripcion}`
      : "¡Cupón aplicado!",
    codigo: resultado.cupon.codigo,
    descuentoContado: calcularDescuentoCupon(resultado.cupon, precioContado),
    descuentoCredito: calcularDescuentoCupon(resultado.cupon, precioCredito),
  };
}

export async function crearReserva(
  _prevState: CrearReservaState,
  formData: FormData
): Promise<CrearReservaState> {
  const desarrolloSlug = String(formData.get("desarrolloSlug") ?? "");
  const clave = String(formData.get("clave") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const correo = String(formData.get("correo") ?? "").trim();
  const montoReserva = Number(formData.get("montoReserva") ?? 0);
  const planTipoPago = String(formData.get("planTipoPago") ?? "CONTADO");
  const plazoMeses = Number(formData.get("plazoMeses") ?? 0) || null;
  const inicialMonto = Number(formData.get("inicialMonto") ?? 0) || null;
  const cuponCodigo = String(formData.get("cuponCodigo") ?? "").trim();

  if (!clave || !nombre || !telefono) {
    return { ok: false, message: "Faltan datos obligatorios." };
  }
  if (!montoReserva || montoReserva <= 0) {
    return { ok: false, message: "El monto de reserva no es válido." };
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
      message: "Este lote ya no está disponible para reserva.",
    };
  }

  const expiraEn = new Date();
  expiraEn.setDate(expiraEn.getDate() + desarrollo.plazoReservaDias);

  let cuponId: string | null = null;
  let descuentoAplicado: number | null = null;
  if (cuponCodigo) {
    const resultadoCupon = await validarCupon(desarrollo.id, cuponCodigo);
    if (resultadoCupon.ok) {
      const esCredito = planTipoPago === "CREDITO";
      const precioBase = esCredito
        ? Number(lote.precioCredito ?? desarrollo.precioCreditoDefault)
        : Number(lote.precioContado ?? desarrollo.precioContadoDefault);
      cuponId = resultadoCupon.cupon.id;
      descuentoAplicado = calcularDescuentoCupon(resultadoCupon.cupon, precioBase);
    }
  }

  const [reserva] = await prisma.$transaction([
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
        cuponId,
        descuentoAplicado,
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

  if (cuponId) {
    await prisma.cupon.update({
      where: { id: cuponId },
      data: { usosActuales: { increment: 1 } },
    });
  }

  revalidatePath(`/${desarrolloSlug}/lotes`);
  revalidatePath("/admin/reservas");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/lotes");

  let checkoutUrl: string | undefined;
  try {
    const origin = await getSiteOrigin();
    const checkout = await crearCheckoutHospedado({
      monto: montoReserva,
      descripcion: `Apartado lote ${lote.clave} - ${desarrollo.nombre}`,
      nombre,
      correo: correo || undefined,
      telefono,
      successUrl: `${origin}/${desarrolloSlug}/pago-exitoso?tipo=reserva`,
      failureUrl: `${origin}/${desarrolloSlug}/pago-fallido?tipo=reserva`,
      metadata: { reservaId: reserva.id, loteClave: lote.clave, tipo: "RESERVA" },
    });

    await prisma.ordenPago.create({
      data: {
        conektaOrderId: checkout.orderId,
        checkoutUrl: checkout.checkoutUrl,
        tipo: "RESERVA",
        monto: montoReserva,
        loteId: lote.id,
        reservaId: reserva.id,
      },
    });

    checkoutUrl = checkout.checkoutUrl;
  } catch (err) {
    console.error("No se pudo crear el checkout de Conekta:", err);
  }

  return {
    ok: true,
    message: checkoutUrl
      ? "¡Solicitud registrada! Puedes pagar tu apartado en línea con tarjeta ahora, o esperar a que nuestro equipo te contacte."
      : "¡Solicitud enviada! Nuestro equipo se pondrá en contacto contigo para confirmar tu apartado.",
    checkoutUrl,
    reservaId: reserva.id,
  };
}

const TIPOS_COMPROBANTE_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_BYTES_COMPROBANTE = 4 * 1024 * 1024;

export type SubirComprobanteState = { ok: boolean; message: string };

export async function subirComprobanteReserva(
  _prevState: SubirComprobanteState,
  formData: FormData
): Promise<SubirComprobanteState> {
  const reservaId = String(formData.get("reservaId") ?? "");
  const file = formData.get("comprobante");

  if (!reservaId) {
    return { ok: false, message: "Falta la solicitud de apartado." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecciona un archivo." };
  }
  if (!TIPOS_COMPROBANTE_PERMITIDOS.includes(file.type)) {
    return {
      ok: false,
      message: "Formato no permitido. Usa JPG, PNG, WEBP o PDF.",
    };
  }
  if (file.size > MAX_BYTES_COMPROBANTE) {
    return {
      ok: false,
      message: "El archivo pesa más de 4MB. Comprímelo e intenta de nuevo.",
    };
  }

  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
  });
  if (!reserva || reserva.estatus !== "PENDIENTE") {
    return {
      ok: false,
      message: "Esta solicitud ya no acepta comprobantes.",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

  await prisma.reserva.update({
    where: { id: reservaId },
    data: { comprobantePago: dataUrl },
  });

  revalidatePath("/admin/reservas");

  return { ok: true, message: "¡Comprobante recibido! Gracias." };
}
