export type PlanPagoLote = {
  precio: number;
  anticipo: number;
  numPagosTotal: number | null;
  montoPagoMensual: number | null;
  fechaInicioPagos: Date | null;
};

/**
 * El precio de venta real de un lote es el público (contado o crédito,
 * según cómo se esté vendiendo), no el precio interno heredado del Excel
 * — así el estado de cuenta siempre corre contra el mismo número que vio
 * el comprador.
 */
export function precioVentaEfectivo(
  lote: {
    tipoPago: "CONTADO" | "CREDITO" | null;
    precioContado: number | null;
    precioCredito: number | null;
  },
  desarrollo: { precioContadoDefault: number; precioCreditoDefault: number }
): number {
  if (lote.tipoPago === "CONTADO") {
    return lote.precioContado ?? desarrollo.precioContadoDefault;
  }
  return lote.precioCredito ?? desarrollo.precioCreditoDefault;
}

export type PagoRegistrado = {
  monto: number;
  fecha: Date;
  numeroCuota: number | null;
};

export type CuotaCalendario = {
  numero: number;
  fechaVencimiento: Date;
  monto: number;
  pagada: boolean;
  vencida: boolean;
};

export type EstadoCuenta = {
  totalPagado: number;
  saldoPendiente: number;
  porcentajePagado: number;
  cuotasPagadas: number;
  cuotasEsperadasHoy: number;
  cuotasAtrasadas: number;
  enAtraso: boolean;
  diasAtraso: number;
  proximaFechaVencimiento: Date | null;
  proximoMontoVencimiento: number | null;
  calendario: CuotaCalendario[];
};

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function calcularEstadoCuenta(
  lote: PlanPagoLote,
  pagos: PagoRegistrado[],
  hoy: Date = new Date()
): EstadoCuenta {
  const today = startOfDay(hoy);
  const totalPagosCuotas = pagos.reduce((acc, p) => acc + p.monto, 0);
  const totalPagado = lote.anticipo + totalPagosCuotas;
  const saldoPendiente = Math.max(lote.precio - totalPagado, 0);
  const porcentajePagado =
    lote.precio > 0
      ? Math.min(100, Math.round((totalPagado / lote.precio) * 100))
      : 0;

  const tienePlan = Boolean(
    lote.fechaInicioPagos && lote.numPagosTotal && lote.montoPagoMensual
  );

  const calendario: CuotaCalendario[] = [];
  let cuotasEsperadasHoy = 0;
  let proximaFechaVencimiento: Date | null = null;
  // Cuántas cuotas completas cubre lo pagado, por monto acumulado (no por
  // número de pagos registrados): si un mes pagan de más, el excedente
  // adelanta cuotas futuras; si pagan de menos, no se cuenta como cuota
  // completa aunque haya un registro de pago.
  let cuotasPagadas = 0;

  if (tienePlan) {
    const inicio = lote.fechaInicioPagos as Date;
    const total = lote.numPagosTotal as number;
    const monto = lote.montoPagoMensual as number;

    cuotasPagadas =
      monto > 0
        ? Math.min(total, Math.floor((totalPagosCuotas + 0.01) / monto))
        : 0;

    for (let i = 1; i <= total; i++) {
      const fechaVencimiento = startOfDay(addMonths(inicio, i - 1));
      const vencida = fechaVencimiento <= today;
      const pagada = i <= cuotasPagadas;
      if (vencida) cuotasEsperadasHoy = i;
      if (!pagada && !proximaFechaVencimiento) {
        proximaFechaVencimiento = fechaVencimiento;
      }
      calendario.push({
        numero: i,
        fechaVencimiento,
        monto,
        pagada,
        vencida: vencida && !pagada,
      });
    }
  }

  const cuotasAtrasadas = Math.max(cuotasEsperadasHoy - cuotasPagadas, 0);
  const enAtraso = cuotasAtrasadas > 0;

  let diasAtraso = 0;
  if (enAtraso && lote.fechaInicioPagos) {
    const fechaCuotaMasAntiguaVencida = startOfDay(
      addMonths(lote.fechaInicioPagos, cuotasPagadas)
    );
    diasAtraso = Math.max(
      0,
      Math.floor(
        (today.getTime() - fechaCuotaMasAntiguaVencida.getTime()) /
          86_400_000
      )
    );
  }

  const proximoMontoVencimiento =
    tienePlan && cuotasPagadas < (lote.numPagosTotal as number)
      ? (lote.montoPagoMensual as number)
      : null;

  return {
    totalPagado,
    saldoPendiente,
    porcentajePagado,
    cuotasPagadas,
    cuotasEsperadasHoy,
    cuotasAtrasadas,
    enAtraso,
    diasAtraso,
    proximaFechaVencimiento,
    proximoMontoVencimiento,
    calendario,
  };
}
