"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  enviarTestimonio,
  type EnviarTestimonioState,
} from "@/app/cliente/actions";

const initialState: EnviarTestimonioState = { ok: false, message: "" };

export function TestimonioForm() {
  const [state, formAction] = useActionState(enviarTestimonio, initialState);
  const [calificacion, setCalificacion] = useState(5);

  if (state.ok) {
    return (
      <p className="text-sm text-forest-700">{state.message}</p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-forest-700/70">
          Tu calificación
        </label>
        <input type="hidden" name="calificacion" value={calificacion} />
        <div className="flex gap-1 text-2xl text-gold-500">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCalificacion(n)}
              aria-label={`${n} estrellas`}
            >
              {n <= calificacion ? "★" : "☆"}
            </button>
          ))}
        </div>
      </div>
      <textarea
        name="mensaje"
        required
        minLength={10}
        rows={3}
        placeholder="Cuéntanos tu experiencia comprando tu lote..."
        className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
      />
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
      className="rounded-full bg-forest-800 px-5 py-2.5 text-xs font-semibold text-sand-50 hover:bg-forest-700 disabled:opacity-60"
    >
      {pending ? "Enviando..." : "Enviar testimonio"}
    </button>
  );
}
