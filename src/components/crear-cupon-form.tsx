"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { crearCupon, type CrearCuponState } from "@/app/admin/actions";

const initialState: CrearCuponState = { ok: false, message: "" };

export function CrearCuponForm({
  desarrollos,
}: {
  desarrollos: { id: string; nombre: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [tipoDescuento, setTipoDescuento] = useState<"PORCENTAJE" | "MONTO_FIJO">(
    "PORCENTAJE"
  );
  const [state, formAction] = useActionState(
    async (prev: CrearCuponState, formData: FormData) => {
      const result = await crearCupon(prev, formData);
      if (result.ok) formRef.current?.reset();
      return result;
    },
    initialState
  );

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Código
        </label>
        <input
          name="codigo"
          required
          placeholder="NAVIDAD2026"
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm uppercase placeholder:normal-case"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Descripción (opcional, se muestra al cliente)
        </label>
        <input
          name="descripcion"
          placeholder="10% de descuento diciembre"
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Tipo de descuento
        </label>
        <select
          name="tipoDescuento"
          value={tipoDescuento}
          onChange={(e) =>
            setTipoDescuento(e.target.value as "PORCENTAJE" | "MONTO_FIJO")
          }
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        >
          <option value="PORCENTAJE">Porcentaje (%)</option>
          <option value="MONTO_FIJO">Monto fijo ($)</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Valor {tipoDescuento === "PORCENTAJE" ? "(%)" : "($)"}
        </label>
        <input
          name="valor"
          type="number"
          min={1}
          max={tipoDescuento === "PORCENTAJE" ? 100 : undefined}
          required
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Solo para este fraccionamiento (opcional)
        </label>
        <select
          name="desarrolloId"
          defaultValue=""
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        >
          <option value="">Todos los fraccionamientos</option>
          {desarrollos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Usos máximos (opcional)
        </label>
        <input
          name="usosMaximos"
          type="number"
          min={1}
          placeholder="Sin límite"
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Vigente desde (opcional)
        </label>
        <input
          name="fechaInicio"
          type="date"
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Vigente hasta (opcional)
        </label>
        <input
          name="fechaFin"
          type="date"
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
      </div>

      <div className="sm:col-span-2">
        <SubmitButton />
        {state.message && (
          <p
            className={`mt-2 text-sm ${state.ok ? "text-forest-700" : "text-red-700"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-forest-800 px-5 py-2.5 text-sm font-semibold text-sand-50 hover:bg-forest-700 disabled:opacity-60"
    >
      {pending ? "Creando..." : "Crear cupón"}
    </button>
  );
}
