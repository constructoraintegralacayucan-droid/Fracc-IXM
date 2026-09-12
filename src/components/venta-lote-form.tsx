"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { formatoMoneda } from "@/lib/financiamiento";
import {
  actualizarVentaLote,
  type ActualizarVentaState,
} from "@/app/admin/actions";

const initialState: ActualizarVentaState = { ok: false, message: "" };

export function VentaLoteForm({
  loteId,
  precio,
  anticipo,
  totalPagosRegistrados,
  moneda,
}: {
  loteId: string;
  precio: number;
  anticipo: number;
  totalPagosRegistrados: number;
  moneda: string;
}) {
  const [state, formAction] = useActionState(actualizarVentaLote, initialState);
  const [precioInput, setPrecioInput] = useState(precio);
  const [anticipoInput, setAnticipoInput] = useState(anticipo);

  const saldoPreview = Math.max(
    precioInput - anticipoInput - totalPagosRegistrados,
    0
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="loteId" value={loteId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-forest-700/70">
            Monto en que se vendió
          </label>
          <input
            name="precio"
            type="number"
            min={0}
            step="0.01"
            required
            value={precioInput}
            onChange={(e) => setPrecioInput(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-forest-700/70">
            Pagos anteriores (antes de usar la app)
          </label>
          <input
            name="anticipo"
            type="number"
            min={0}
            step="0.01"
            value={anticipoInput}
            onChange={(e) => setAnticipoInput(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>
      </div>

      <p className="text-sm text-forest-700/80">
        Saldo pendiente con estos montos:{" "}
        <span className="font-semibold text-forest-900">
          {formatoMoneda(saldoPreview, moneda)}
        </span>
        {totalPagosRegistrados > 0 && (
          <span className="text-forest-700/60">
            {" "}
            (ya incluye {formatoMoneda(totalPagosRegistrados, moneda)} de
            pagos registrados abajo)
          </span>
        )}
      </p>

      <SubmitButton />

      {state.message && (
        <p className={`text-sm ${state.ok ? "text-forest-700" : "text-red-700"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-forest-800 px-4 py-2 text-xs font-semibold text-sand-50 hover:bg-forest-700 disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Guardar venta"}
    </button>
  );
}
