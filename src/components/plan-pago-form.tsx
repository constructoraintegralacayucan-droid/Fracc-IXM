"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { formatoMoneda } from "@/lib/financiamiento";
import { actualizarPlanPago } from "@/app/admin/actions";

export function PlanPagoForm({
  loteId,
  precioVenta,
  anticipo,
  moneda,
  numPagosTotal,
  montoPagoMensual,
  fechaInicioPagos,
}: {
  loteId: string;
  precioVenta: number;
  anticipo: number;
  moneda: string;
  numPagosTotal: number | null;
  montoPagoMensual: number | null;
  fechaInicioPagos: string;
}) {
  const porFinanciar = Math.max(precioVenta - anticipo, 0);

  const [numPagos, setNumPagos] = useState(numPagosTotal ?? 12);
  const [monto, setMonto] = useState(
    montoPagoMensual ??
      (numPagosTotal
        ? Math.round((porFinanciar / numPagosTotal) * 100) / 100
        : Math.round((porFinanciar / 12) * 100) / 100)
  );

  function handleNumPagosChange(value: number) {
    setNumPagos(value);
    if (value > 0) {
      setMonto(Math.round((porFinanciar / value) * 100) / 100);
    }
  }

  function handleMontoChange(value: number) {
    setMonto(value);
    if (value > 0) {
      setNumPagos(Math.ceil(porFinanciar / value));
    }
  }

  return (
    <div>
      <div className="mt-1 grid grid-cols-3 gap-3 text-sm">
        <p className="text-forest-700/70">
          Precio de venta:{" "}
          <span className="font-semibold text-forest-900">
            {formatoMoneda(precioVenta, moneda)}
          </span>
        </p>
        <p className="text-forest-700/70">
          Enganche registrado:{" "}
          <span className="font-semibold text-forest-900">
            {formatoMoneda(anticipo, moneda)}
          </span>
        </p>
        <p className="text-forest-700/70">
          Por financiar:{" "}
          <span className="font-semibold text-forest-900">
            {formatoMoneda(porFinanciar, moneda)}
          </span>
        </p>
      </div>

      <form
        action={actualizarPlanPago}
        className="mt-4 grid gap-3 sm:grid-cols-3"
      >
        <input type="hidden" name="loteId" value={loteId} />
        <div>
          <label className="mb-1 block text-xs font-medium text-forest-700/70">
            Número de pagos
          </label>
          <input
            name="numPagosTotal"
            type="number"
            min={1}
            value={numPagos}
            onChange={(e) => handleNumPagosChange(Number(e.target.value))}
            className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-forest-700/70">
            Monto por pago
          </label>
          <input
            name="montoPagoMensual"
            type="number"
            min={0}
            step="0.01"
            value={monto}
            onChange={(e) => handleMontoChange(Number(e.target.value))}
            className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-forest-700/70">
            Fecha de inicio
          </label>
          <input
            name="fechaInicioPagos"
            type="date"
            defaultValue={fechaInicioPagos}
            className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>
        <p className="sm:col-span-3 text-xs text-forest-700/60">
          El monto por pago se recalcula solo al cambiar el número de pagos
          (y viceversa), tomando como base lo que falta por financiar.
        </p>
        <div className="sm:col-span-3">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="rounded-full bg-forest-800 px-4 py-2 text-xs font-semibold text-sand-50 hover:bg-forest-700 disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Guardar plan"}
    </button>
  );
}
