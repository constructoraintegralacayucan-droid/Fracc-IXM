"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  subirImagenGaleria,
  eliminarImagenGaleria,
  type SubirImagenState,
} from "@/app/admin/actions";

const initialState: SubirImagenState = { ok: false, message: "" };

export type ImagenPlano = { id: string; dataUrl: string };

export function GaleriaUploader({ imagenes }: { imagenes: ImagenPlano[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    async (prev: SubirImagenState, formData: FormData) => {
      const result = await subirImagenGaleria(prev, formData);
      if (result.ok) formRef.current?.reset();
      return result;
    },
    initialState
  );

  return (
    <div>
      <p className="text-sm text-forest-700/70">
        Sube fotos o capturas de video (drone, panorámicas, avance de obra).
        Se muestran en la portada, rotando cada 5 segundos. Máximo 4MB por
        imagen, formato JPG/PNG/WEBP.
      </p>

      <form
        ref={formRef}
        action={formAction}
        className="mt-4 flex flex-wrap items-center gap-3"
      >
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

      {imagenes.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {imagenes.map((img) => (
            <div key={img.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.dataUrl}
                alt=""
                className="h-28 w-full rounded-xl object-cover"
              />
              <form action={eliminarImagenGaleria} className="mt-1.5">
                <input type="hidden" name="id" value={img.id} />
                <button className="w-full rounded-full border border-red-700/30 py-1 text-xs font-semibold text-red-800 hover:bg-red-50">
                  Eliminar
                </button>
              </form>
            </div>
          ))}
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
      {pending ? "Subiendo..." : "Subir imagen"}
    </button>
  );
}
