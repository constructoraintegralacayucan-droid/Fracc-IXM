"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import {
  iniciarPagoCuota,
  type IniciarPagoCuotaState,
} from "@/app/cliente/actions";

const initialState: IniciarPagoCuotaState = { ok: false, message: "" };

export function PagarCuotaButton({
  loteId,
  monto,
  numeroCuota,
}: {
  loteId: string;
  monto: number;
  numeroCuota?: number | null;
}) {
  const [state, formAction] = useActionState(iniciarPagoCuota, initialState);

  useEffect(() => {
    if (state.ok && state.checkoutUrl) {
      window.location.href = state.checkoutUrl;
    }
  }, [state]);

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="loteId" value={loteId} />
      <input type="hidden" name="monto" value={monto} />
      {numeroCuota ? (
        <input type="hidden" name="numeroCuota" value={numeroCuota} />
      ) : null}
      <SubmitButton />
      {state.message && !state.ok && (
        <p className="mt-2 text-sm text-red-700">{state.message}</p>
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
      className="rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-forest-950 transition hover:bg-gold-400 disabled:opacity-60"
    >
      {pending ? "Redirigiendo..." : "Pagar esta cuota con tarjeta"}
    </button>
  );
}
