// Temporada decembrina: del 1 de diciembre al 6 de enero (Día de Reyes),
// usando la fecha del servidor como aproximación a la hora de México.
export function esTemporadaNavidena(fecha: Date = new Date()): boolean {
  const mes = fecha.getMonth(); // 0 = enero, 11 = diciembre
  const dia = fecha.getDate();
  if (mes === 11) return true;
  if (mes === 0 && dia <= 6) return true;
  return false;
}
