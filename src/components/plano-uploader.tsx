"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { subirPlanoImagen, type SubirPlanoState } from "@/app/admin/actions";

const initialState: SubirPlanoState = { ok: false, message: "" };

export function PlanoUploader({
  desarrolloId,
  planoActual,
}: {
  desarrolloId: string;
  planoActual: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    async (prev: SubirPlanoState, formData: FormData) => {
      const result = await subirPlanoImagen(prev, formData);
      if (result.ok) formRef.current?.reset();
      return result;
    },
    initialState
  );

  return (
    <div>
      <p className="text-sm text-forest-700/70">
        Sube el plano o croquis real (JPG, PNG o WEBP, máximo 10MB). Al
        reemplazarlo, las posiciones de los lotes que ya marcaste se
        conservan — solo vuelve a verificarlas si el nuevo plano cambia de
        tamaño o encuadre.
      </p>

      <form
        ref={formRef}
        action={formAction}
        className="mt-4 flex flex-wrap items-center gap-3"
      >
        <input type="hidden" name="desarrolloId" value={desarrolloId} />
        <input
          type="file"
          name="imagen"
          accept="image/jpeg,image/png,image/webp"
          required
          className="text-sm"
        />
        <SubmitButton />
      </form>
      {state.message && (
        <p
          className={`mt-2 text-sm ${state.ok ? "text-forest-700" : "text-red-700"}`}
        >
          {state.message}
        </p>
      )}

      {planoActual && (
        <div className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={planoActual}
            alt="Plano actual"
            className="max-h-64 rounded-xl border border-forest-900/10 object-contain"
          />
        </div>
      )}
    </div>
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
      {pending ? "Subiendo..." : "Subir plano"}
    </button>
  );
}
