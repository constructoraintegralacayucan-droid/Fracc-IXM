import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatoFecha, formatoMoneda } from "./financiamiento";

export type DatosRecibo = {
  folio: string;
  desarrolloNombre: string;
  loteClave: string;
  manzanaNumero: number;
  clienteNombre: string;
  clienteEmail: string;
  numeroCuota: number | null;
  monto: number;
  metodo: string;
  fecha: Date;
  notas: string | null;
  registradoPor: string | null;
  moneda: string;
  totalPagado: number;
  saldoPendiente: number;
  porcentajePagado: number;
  emitido: Date;
};

const METODO_LABEL: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  DEPOSITO: "Depósito",
  TARJETA: "Tarjeta",
  OTRO: "Otro",
};

export async function generarReciboPago(
  datos: DatosRecibo
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const forestDark = rgb(0x1b / 255, 0x3a / 255, 0x2f / 255);
  const gold = rgb(0xc9 / 255, 0xa9 / 255, 0x6b / 255);
  const ink = rgb(0.15, 0.15, 0.15);
  const gray = rgb(0.45, 0.45, 0.45);

  let y = height - 60;

  // Encabezado
  page.drawRectangle({
    x: 0,
    y: height - 110,
    width,
    height: 110,
    color: forestDark,
  });
  page.drawText("TERRANOVA", {
    x: 50,
    y: height - 55,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("by Constructora Integral Acayucan", {
    x: 50,
    y: height - 72,
    size: 9,
    font,
    color: rgb(0.85, 0.85, 0.85),
  });
  page.drawText("RECIBO DE PAGO", {
    x: 50,
    y: height - 95,
    size: 12,
    font: fontBold,
    color: gold,
  });
  page.drawText(`Folio: ${datos.folio}`, {
    x: width - 200,
    y: height - 95,
    size: 10,
    font,
    color: rgb(0.85, 0.85, 0.85),
  });

  y = height - 150;

  function row(label: string, value: string, size = 11) {
    page.drawText(label, { x: 50, y, size: 9, font, color: gray });
    page.drawText(value, {
      x: 50,
      y: y - 16,
      size,
      font: fontBold,
      color: ink,
    });
    y -= 44;
  }

  row("Desarrollo", datos.desarrolloNombre);
  row(
    "Lote",
    `Manzana ${datos.manzanaNumero} · Clave ${datos.loteClave}`
  );
  row("Cliente", `${datos.clienteNombre} (${datos.clienteEmail})`);

  page.drawLine({
    start: { x: 50, y: y + 14 },
    end: { x: width - 50, y: y + 14 },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 10;

  const colWidth = (width - 100) / 2;
  const yBeforeCols = y;

  page.drawText("Monto pagado", { x: 50, y, size: 9, font, color: gray });
  page.drawText(formatoMoneda(datos.monto, datos.moneda), {
    x: 50,
    y: y - 20,
    size: 20,
    font: fontBold,
    color: forestDark,
  });

  page.drawText("Fecha de pago", {
    x: 50 + colWidth,
    y,
    size: 9,
    font,
    color: gray,
  });
  page.drawText(formatoFecha(datos.fecha), {
    x: 50 + colWidth,
    y: y - 20,
    size: 14,
    font: fontBold,
    color: ink,
  });
  y = yBeforeCols - 50;

  page.drawText("Método de pago", { x: 50, y, size: 9, font, color: gray });
  page.drawText(METODO_LABEL[datos.metodo] ?? datos.metodo, {
    x: 50,
    y: y - 16,
    size: 12,
    font: fontBold,
    color: ink,
  });

  page.drawText("Cuota #", {
    x: 50 + colWidth,
    y,
    size: 9,
    font,
    color: gray,
  });
  page.drawText(
    datos.numeroCuota ? String(datos.numeroCuota) : "—",
    { x: 50 + colWidth, y: y - 16, size: 12, font: fontBold, color: ink }
  );
  y -= 50;

  if (datos.notas) {
    page.drawText("Notas", { x: 50, y, size: 9, font, color: gray });
    page.drawText(datos.notas, {
      x: 50,
      y: y - 16,
      size: 11,
      font,
      color: ink,
      maxWidth: width - 100,
    });
    y -= 50;
  }

  // Resumen de cuenta
  y -= 10;
  page.drawRectangle({
    x: 50,
    y: y - 90,
    width: width - 100,
    height: 90,
    color: rgb(0.96, 0.95, 0.92),
  });
  page.drawText("RESUMEN DE CUENTA A LA FECHA", {
    x: 65,
    y: y - 22,
    size: 9,
    font: fontBold,
    color: forestDark,
  });

  const summaryColWidth = (width - 130) / 3;
  const items: [string, string][] = [
    ["Total pagado", formatoMoneda(datos.totalPagado, datos.moneda)],
    ["Saldo pendiente", formatoMoneda(datos.saldoPendiente, datos.moneda)],
    ["Avance", `${datos.porcentajePagado}%`],
  ];
  items.forEach(([label, value], i) => {
    const x = 65 + i * summaryColWidth;
    page.drawText(label, { x, y: y - 42, size: 8, font, color: gray });
    page.drawText(value, {
      x,
      y: y - 62,
      size: 14,
      font: fontBold,
      color: ink,
    });
  });

  // Pie de página
  page.drawText(
    `Emitido el ${formatoFecha(datos.emitido)} · Registrado por: ${
      datos.registradoPor ?? "—"
    }`,
    { x: 50, y: 60, size: 8, font, color: gray }
  );
  page.drawText(
    "Este recibo es un comprobante interno de pago. Conserve su comprobante bancario o de depósito.",
    { x: 50, y: 46, size: 8, font, color: gray }
  );
  page.drawText("constructoraintegral_acayucan@hotmail.com · Tel. 9241122354", {
    x: 50,
    y: 32,
    size: 8,
    font,
    color: gray,
  });

  return doc.save();
}
