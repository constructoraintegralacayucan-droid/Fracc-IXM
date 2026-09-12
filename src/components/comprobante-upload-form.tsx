"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  subirComprobanteReserva,
  type SubirComprobanteState,
} from "@/app/(site)/[desarrollo]/lotes/actions";

const initialState: SubirComprobanteState = { ok: false, message: "" };

export function ComprobanteUploadForm({ reservaId }: { reservaId: string }) {
  const [state, formAction] = useActionState(
    subirComprobanteReserva,
    initialState
  );

  if (state.ok) {
    return (
      <p className="text-sm font-medium text-forest-700">{state.message}</p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="reservaId" value={reservaId} />
      <label className="block text-xs font-medium text-forest-700/70">
        Sube tu comprobante de transferencia o depósito
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          name="comprobante"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required
          className="min-w-0 flex-1 text-xs"
        />
        <SubmitButton />
      </div>
      {state.message && (
        <p className="text-xs text-red-700">{state.message}</p>
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
      className="shrink-0 rounded-full bg-forest-800 px-4 py-2 text-xs font-semibold text-sand-50 hover:bg-forest-700 disabled:opacity-60"
    >
      {pending ? "Subiendo..." : "Subir"}
    </button>
  );
}
