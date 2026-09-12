"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  loginColaborador,
  type LoginColaboradorState,
} from "@/app/colaborador/actions";

const initialState: LoginColaboradorState = { ok: false, message: "" };

export function ColaboradorLoginForm() {
  const [state, formAction] = useActionState(loginColaborador, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-800">
          Correo
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
          placeholder="tucorreo@ejemplo.com"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-800">
          Contraseña
        </label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
          placeholder="••••••••"
        />
      </div>

      {state.message && (
        <p className="text-sm text-red-700">{state.message}</p>
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
      className="w-full rounded-full bg-forest-800 py-3 text-sm font-semibold text-sand-50 transition hover:bg-forest-700 disabled:opacity-60"
    >
      {pending ? "Ingresando..." : "Iniciar sesión"}
    </button>
  );
}
