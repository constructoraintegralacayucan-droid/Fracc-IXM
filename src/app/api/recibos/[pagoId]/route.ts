import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/session";
import { getClienteSession } from "@/lib/cliente-session";
import { calcularEstadoCuenta, precioVentaEfectivo } from "@/lib/pagos";
import { generarReciboPago } from "@/lib/recibo";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pagoId: string }> }
) {
  const { pagoId } = await params;

  const pago = await prisma.pago.findUnique({
    where: { id: pagoId },
    include: {
      lote: {
        include: {
          desarrollo: true,
          manzana: true,
          cliente: true,
          pagos: { orderBy: { fecha: "asc" } },
        },
      },
    },
  });

  if (!pago) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const admin = await getAdminSession();
  if (!admin) {
    const cliente = await getClienteSession();
    if (!cliente || cliente.sub !== pago.lote.clienteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const lote = pago.lote;
  const tipoPagoEfectivo = lote.numPagosTotal ? "CREDITO" : lote.tipoPago;
  const precioVenta = precioVentaEfectivo(
    {
      tipoPago: tipoPagoEfectivo,
      precioContado: lote.precioContado ? Number(lote.precioContado) : null,
      precioCredito: lote.precioCredito ? Number(lote.precioCredito) : null,
      precio: Number(lote.precio),
    },
    {
      precioContadoDefault: Number(lote.desarrollo.precioContadoDefault),
      precioCreditoDefault: Number(lote.desarrollo.precioCreditoDefault),
    }
  );

  const estado = calcularEstadoCuenta(
    {
      precio: precioVenta,
      anticipo: Number(lote.anticipo),
      numPagosTotal: lote.numPagosTotal,
      montoPagoMensual: lote.montoPagoMensual
        ? Number(lote.montoPagoMensual)
        : null,
      fechaInicioPagos: lote.fechaInicioPagos,
    },
    lote.pagos.map((p) => ({
      monto: Number(p.monto),
      fecha: p.fecha,
      numeroCuota: p.numeroCuota,
    }))
  );

  const pdfBytes = await generarReciboPago({
    folio: pago.id.slice(-10).toUpperCase(),
    desarrolloNombre: lote.desarrollo.nombre,
    loteClave: lote.clave,
    manzanaNumero: lote.manzana.numero,
    clienteNombre: lote.cliente?.nombre ?? lote.compradorNombre ?? "—",
    clienteEmail: lote.cliente?.email ?? "—",
    numeroCuota: pago.numeroCuota,
    monto: Number(pago.monto),
    metodo: pago.metodo,
    fecha: pago.fecha,
    notas: pago.notas,
    registradoPor: pago.registradoPor,
    moneda: lote.desarrollo.moneda,
    totalPagado: estado.totalPagado,
    saldoPendiente: estado.saldoPendiente,
    porcentajePagado: estado.porcentajePagado,
    emitido: new Date(),
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="recibo-${lote.clave}-${pago.id.slice(-6)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
