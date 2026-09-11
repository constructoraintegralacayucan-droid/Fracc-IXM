"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  asignarCliente,
  type AsignarClienteState,
} from "@/app/admin/actions";

const initialState: AsignarClienteState = { ok: false, message: "" };

export function AsignarClienteForm({ loteId }: { loteId: string }) {
  const [state, formAction] = useActionState(asignarCliente, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="loteId" value={loteId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="nombre"
          required
          placeholder="Nombre completo"
          className="rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Correo (será su usuario)"
          className="rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
        <input
          name="telefono"
          placeholder="Teléfono"
          className="rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
        <input
          name="password"
          type="text"
          required
          placeholder="Contraseña temporal (mín. 6 caracteres)"
          className="rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
      </div>
      {state.message && (
        <p className={`text-sm ${state.ok ? "text-forest-700" : "text-red-700"}`}>
          {state.message}
        </p>
      )}
      <SubmitButton />
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
      {pending ? "Guardando..." : "Crear y asignar cliente"}
    </button>
  );
}
