import { prisma } from "@/lib/prisma";
import type { Cupon } from "@prisma/client";

export const TIPO_DESCUENTO_LABEL: Record<Cupon["tipoDescuento"], string> = {
  PORCENTAJE: "Porcentaje",
  MONTO_FIJO: "Monto fijo",
};

export type ValidarCuponResultado =
  | { ok: true; cupon: Cupon }
  | { ok: false; message: string };

export async function validarCupon(
  desarrolloId: string,
  codigoRaw: string
): Promise<ValidarCuponResultado> {
  const codigo = codigoRaw.trim().toUpperCase();
  if (!codigo) {
    return { ok: false, message: "Escribe un código de cupón." };
  }

  const cupon = await prisma.cupon.findUnique({ where: { codigo } });
  if (!cupon || !cupon.activo) {
    return { ok: false, message: "Ese cupón no existe o ya no está activo." };
  }
  if (cupon.desarrolloId && cupon.desarrolloId !== desarrolloId) {
    return {
      ok: false,
      message: "Este cupón no aplica a este fraccionamiento.",
    };
  }
  const ahora = new Date();
  if (cupon.fechaInicio && ahora < cupon.fechaInicio) {
    return { ok: false, message: "Este cupón todavía no está vigente." };
  }
  if (cupon.fechaFin && ahora > cupon.fechaFin) {
    return { ok: false, message: "Este cupón ya venció." };
  }
  if (cupon.usosMaximos != null && cupon.usosActuales >= cupon.usosMaximos) {
    return {
      ok: false,
      message: "Este cupón ya alcanzó su límite de usos.",
    };
  }

  return { ok: true, cupon };
}

export function calcularDescuentoCupon(cupon: Cupon, precioBase: number): number {
  if (precioBase <= 0) return 0;
  const valor = Number(cupon.valor);
  if (cupon.tipoDescuento === "PORCENTAJE") {
    return Math.round((precioBase * Math.min(valor, 100)) / 100);
  }
  return Math.min(Math.round(valor), precioBase);
}
