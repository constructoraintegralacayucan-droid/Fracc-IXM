"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  crearDesarrollo,
  type CrearDesarrolloState,
} from "@/app/admin/actions";

const initialState: CrearDesarrolloState = { ok: false, message: "" };

export function CrearDesarrolloForm() {
  const [state, formAction] = useActionState(crearDesarrollo, initialState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Nombre
        </label>
        <input
          name="nombre"
          required
          placeholder="Fraccionamiento Popular Acayucan"
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Dirección web (slug)
        </label>
        <input
          name="slug"
          required
          placeholder="popular-acayucan"
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Ubicación
        </label>
        <input
          name="ubicacion"
          required
          placeholder="Acayucan, Veracruz, México"
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
      </div>

      <div className="sm:col-span-3">
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
      {pending ? "Creando..." : "Crear desarrollo"}
    </button>
  );
}
