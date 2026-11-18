"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  crearAdminUsuario,
  type CrearAdminUsuarioState,
} from "@/app/admin/actions";

const initialState: CrearAdminUsuarioState = { ok: false, message: "" };

export function CrearAdminUsuarioForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    async (prev: CrearAdminUsuarioState, formData: FormData) => {
      const result = await crearAdminUsuario(prev, formData);
      if (result.ok) formRef.current?.reset();
      return result;
    },
    initialState
  );

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Nombre
        </label>
        <input
          name="nombre"
          required
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Correo
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Contraseña (mín. 6 caracteres)
        </label>
        <input
          name="password"
          type="text"
          required
          minLength={6}
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Rol
        </label>
        <select
          name="rol"
          defaultValue="ADMIN"
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
        >
          <option value="ADMIN">Administrador</option>
          <option value="VENDEDOR">Vendedor</option>
        </select>
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
      {pending ? "Creando..." : "Crear usuario"}
    </button>
  );
}
