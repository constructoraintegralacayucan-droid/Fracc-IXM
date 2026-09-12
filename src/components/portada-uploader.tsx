"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  subirImagenPortada,
  quitarImagenPortada,
  type SubirImagenState,
} from "@/app/admin/actions";

const initialState: SubirImagenState = { ok: false, message: "" };

export function PortadaUploader({
  desarrolloId,
  imagenPortada,
}: {
  desarrolloId: string;
  imagenPortada: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    async (prev: SubirImagenState, formData: FormData) => {
      const result = await subirImagenPortada(prev, formData);
      if (result.ok) formRef.current?.reset();
      return result;
    },
    initialState
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {imagenPortada ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imagenPortada}
          alt=""
          className="h-16 w-24 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-forest-900/20 text-[10px] text-forest-700/50">
          Sin foto
        </div>
      )}

      <div>
        <form
          ref={formRef}
          action={formAction}
          className="flex flex-wrap items-center gap-2"
        >
          <input type="hidden" name="desarrolloId" value={desarrolloId} />
          <input
            type="file"
            name="imagen"
            accept="image/jpeg,image/png,image/webp"
            required
            className="text-xs"
          />
          <SubmitButton />
          {imagenPortada && (
            <button
              formAction={quitarImagenPortada}
              formNoValidate
              className="rounded-full border border-red-700/30 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-50"
            >
              Quitar
            </button>
          )}
        </form>
        {state.message && (
          <p
            className={`mt-1 text-xs ${state.ok ? "text-forest-700" : "text-red-700"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-forest-800 px-3 py-1.5 text-xs font-semibold text-sand-50 hover:bg-forest-700 disabled:opacity-60"
    >
      {pending ? "Subiendo..." : "Subir foto"}
    </button>
  );
}
