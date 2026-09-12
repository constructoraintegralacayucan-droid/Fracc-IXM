"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  crearSolicitudColaborador,
  type CrearSolicitudState,
} from "@/app/colaborador/actions";

export type LoteDisponiblePlano = {
  clave: string;
  numero: number;
  disponible: boolean;
};

export type ManzanaDisponiblePlano = {
  numero: number;
  lotes: LoteDisponiblePlano[];
};

const initialState: CrearSolicitudState = { ok: false, message: "" };

export function ColaboradorSolicitudPanel({
  manzanas,
  desarrolloSlug,
  reservaMinima,
  moneda,
}: {
  manzanas: ManzanaDisponiblePlano[];
  desarrolloSlug: string;
  reservaMinima: number;
  moneda: string;
}) {
  const [selectedClave, setSelectedClave] = useState<string | null>(null);
  const [state, formAction] = useActionState(
    crearSolicitudColaborador,
    initialState
  );
  const [planTipoPago, setPlanTipoPago] = useState<"CONTADO" | "CREDITO">(
    "CONTADO"
  );

  const selectedManzana = manzanas.find((m) =>
    m.lotes.some((l) => l.clave === selectedClave)
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="grid gap-6">
        {manzanas.map((m) => (
          <div
            key={m.numero}
            className="rounded-2xl border border-forest-900/10 bg-sand-50 p-5"
          >
            <h3 className="mb-3 font-display text-lg font-semibold text-forest-900">
              Manzana {m.numero}
            </h3>
            <div className="flex flex-wrap gap-2">
              {m.lotes.map((l) => (
                <button
                  key={l.clave}
                  type="button"
                  disabled={!l.disponible}
                  onClick={() => l.disponible && setSelectedClave(l.clave)}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${
                    !l.disponible
                      ? "border-stone-ink/10 bg-stone-ink/10 text-stone-ink/30 cursor-default"
                      : selectedClave === l.clave
                        ? "border-gold-500 bg-gold-400/25 text-forest-900 ring-2 ring-gold-500"
                        : "border-forest-300 bg-forest-100 text-forest-800 hover:bg-forest-200 cursor-pointer"
                  }`}
                >
                  {l.numero}
                </button>
              ))}
            </div>
          </div>
        ))}
        {manzanas.every((m) => m.lotes.every((l) => !l.disponible)) && (
          <p className="text-sm text-forest-700/60">
            No hay lotes disponibles en este desarrollo por ahora.
          </p>
        )}
      </div>

      <div className="lg:sticky lg:top-5 lg:self-start">
        {!selectedClave || !selectedManzana ? (
          <div className="rounded-2xl border border-dashed border-forest-900/20 bg-sand-50 p-6 text-center text-sm text-forest-700/60">
            Selecciona un lote disponible para levantar la solicitud de
            apartado.
          </div>
        ) : (
          <form
            key={selectedClave}
            action={formAction}
            className="space-y-4 rounded-2xl border border-forest-900/10 bg-sand-50 p-6"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                Manzana {selectedManzana.numero} · Lote
              </p>
              <h3 className="font-display text-xl font-semibold text-forest-900">
                Clave {selectedClave}
              </h3>
            </div>
            <input type="hidden" name="desarrolloSlug" value={desarrolloSlug} />
            <input type="hidden" name="clave" value={selectedClave} />

            <div>
              <label className="mb-1 block text-xs font-medium text-forest-700/70">
                Nombre completo del comprador
              </label>
              <input
                name="nombre"
                required
                className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-forest-700/70">
                  Teléfono
                </label>
                <input
                  name="telefono"
                  required
                  className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-forest-700/70">
                  Correo (opcional)
                </label>
                <input
                  name="correo"
                  type="email"
                  className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-forest-700/70">
                  Forma de pago
                </label>
                <select
                  name="planTipoPago"
                  value={planTipoPago}
                  onChange={(e) =>
                    setPlanTipoPago(e.target.value as "CONTADO" | "CREDITO")
                  }
                  className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
                >
                  <option value="CONTADO">Contado</option>
                  <option value="CREDITO">Crédito</option>
                </select>
              </div>
              {planTipoPago === "CREDITO" && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-forest-700/70">
                    Plazo (meses)
                  </label>
                  <input
                    name="plazoMeses"
                    type="number"
                    min={1}
                    className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-forest-700/70">
                Monto de apartado (mínimo{" "}
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: moneda,
                  maximumFractionDigits: 0,
                }).format(reservaMinima)}
                )
              </label>
              <input
                name="montoReserva"
                type="number"
                min={reservaMinima}
                defaultValue={reservaMinima}
                required
                className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-forest-700/70">
                Notas (opcional)
              </label>
              <textarea
                name="mensajeCliente"
                rows={2}
                className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>

            <SubmitButton />

            {state.message && (
              <p
                className={`text-sm ${state.ok ? "text-forest-700" : "text-red-700"}`}
              >
                {state.message}
              </p>
            )}
          </form>
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
      className="w-full rounded-full bg-gold-500 py-3 text-sm font-semibold text-forest-950 transition hover:bg-gold-400 disabled:opacity-60"
    >
      {pending ? "Enviando..." : "Enviar solicitud de apartado"}
    </button>
  );
}
