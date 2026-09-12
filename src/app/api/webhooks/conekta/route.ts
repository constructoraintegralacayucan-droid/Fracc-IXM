import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verificarWebhookAutorizado } from "@/lib/conekta";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!verificarWebhookAutorizado(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let payload: {
    data?: { object?: { id?: string; payment_status?: string } };
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const order = payload?.data?.object;
  const orderId = order?.id;
  const paymentStatus = order?.payment_status;

  if (!orderId) {
    return NextResponse.json({ ok: true });
  }

  const ordenPago = await prisma.ordenPago.findUnique({
    where: { conektaOrderId: orderId },
  });
  if (!ordenPago || ordenPago.estatus === "PAGADA") {
    return NextResponse.json({ ok: true });
  }

  if (paymentStatus === "paid") {
    await prisma.$transaction(async (tx) => {
      const pago = await tx.pago.create({
        data: {
          loteId: ordenPago.loteId!,
          numeroCuota: ordenPago.numeroCuota,
          monto: ordenPago.monto,
          metodo: "TARJETA",
          notas:
            ordenPago.tipo === "RESERVA"
              ? "Pago de apartado vía Conekta (tarjeta en línea)"
              : "Pago de mensualidad vía Conekta (tarjeta en línea)",
          registradoPor: "Conekta (pago en línea)",
        },
      });

      await tx.ordenPago.update({
        where: { id: ordenPago.id },
        data: { estatus: "PAGADA", pagoId: pago.id },
      });

      if (ordenPago.tipo === "RESERVA" && ordenPago.reservaId) {
        await tx.reserva.update({
          where: { id: ordenPago.reservaId },
          data: { estatus: "CONFIRMADA" },
        });
      }
    });

    revalidatePath("/cliente/dashboard");
    revalidatePath("/admin/lotes");
    revalidatePath("/admin/reservas");
    revalidatePath("/admin/dashboard");
  } else if (paymentStatus === "expired" || paymentStatus === "declined") {
    await prisma.ordenPago.update({
      where: { id: ordenPago.id },
      data: { estatus: paymentStatus === "expired" ? "EXPIRADA" : "FALLIDA" },
    });
  }

  return NextResponse.json({ ok: true });
}
