export type PlanFinanciamiento = {
  precio: number;
  inicial: number;
  plazoMeses: number;
  tasaInteresAnual: number;
};

export type ResultadoFinanciamiento = {
  inicial: number;
  aFinanciar: number;
  cuotaMensual: number;
  totalPagado: number;
  primeraCuota: Date;
};

/**
 * Financiamiento directo sin intereses (como maneja el fraccionamiento):
 * el saldo a financiar se divide en partes iguales entre el plazo.
 * Si en el futuro se define una tasa > 0, se aplica interés simple mensual.
 */
export function calcularFinanciamiento({
  precio,
  inicial,
  plazoMeses,
  tasaInteresAnual,
}: PlanFinanciamiento): ResultadoFinanciamiento {
  const aFinanciar = Math.max(precio - inicial, 0);
  const tasaMensual = tasaInteresAnual / 100 / 12;

  let cuotaMensual: number;
  if (tasaMensual > 0 && plazoMeses > 0) {
    cuotaMensual =
      (aFinanciar * tasaMensual) /
      (1 - Math.pow(1 + tasaMensual, -plazoMeses));
  } else {
    cuotaMensual = plazoMeses > 0 ? aFinanciar / plazoMeses : 0;
  }

  const primeraCuota = new Date();
  primeraCuota.setMonth(primeraCuota.getMonth() + 1);

  return {
    inicial,
    aFinanciar,
    cuotaMensual: Math.round(cuotaMensual * 100) / 100,
    totalPagado: Math.round((inicial + cuotaMensual * plazoMeses) * 100) / 100,
    primeraCuota,
  };
}

export function formatoMoneda(valor: number, moneda = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(valor);
}

export function formatoFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
}
