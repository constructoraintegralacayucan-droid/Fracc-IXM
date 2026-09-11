"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { calcularFinanciamiento, formatoMoneda } from "@/lib/financiamiento";
import { crearReserva, type CrearReservaState } from "@/app/(site)/lotes/actions";
import type { ProyectoConfigPlano } from "./lote-map";

export type LotePlano = {
  clave: string;
  manzanaNumero: number;
  disponible: boolean;
  numero: number | null;
  precio: number | null;
};

const initialState: CrearReservaState = { ok: false, message: "" };

export function LoteDetailPanel({
  lote,
  disponiblesEnManzana,
  config,
  onClose,
}: {
  lote: LotePlano;
  disponiblesEnManzana: number;
  config: ProyectoConfigPlano;
  onClose: () => void;
}) {
  const precio = lote.precio ?? 0;
  const inicialMinima = Math.round((precio * config.inicialMinimoPct) / 100);
  const [inicial, setInicial] = useState(inicialMinima);
  const plazosDisponibles =
    config.plazosMeses.length > 0 ? config.plazosMeses : [config.plazoRecomendado];
  const plazoInicial = plazosDisponibles.includes(config.plazoRecomendado)
    ? config.plazoRecomendado
    : plazosDisponibles[0];
  const [plazoMeses, setPlazoMeses] = useState(plazoInicial);
  const [tipoPago, setTipoPago] = useState<"CONTADO" | "CREDITO">("CONTADO");

  const resultado = useMemo(
    () =>
      calcularFinanciamiento({
        precio,
        inicial: tipoPago === "CONTADO" ? precio : inicial,
        plazoMeses: tipoPago === "CONTADO" ? 0 : plazoMeses,
        tasaInteresAnual: config.tasaInteres,
      }),
    [precio, inicial, plazoMeses, tipoPago, config.tasaInteres]
  );

  const [state, formAction] = useActionState(crearReserva, initialState);

  const avisoDisponibilidad =
    disponiblesEnManzana === 1
      ? "¡Solo queda 1 lote disponible en esta manzana!"
      : `Quedan ${disponiblesEnManzana} lotes disponibles en esta manzana`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-forest-950/50 backdrop-blur-sm"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-sand-50 p-6 shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700/60">
              Manzana {lote.manzanaNumero} · Lote {lote.numero}
            </p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-forest-900">
              Lote disponible
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-forest-700 hover:bg-forest-900/5"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <span className="inline-block rounded-full bg-gold-400/25 px-3 py-1 text-xs font-semibold text-sand-900">
          {avisoDisponibilidad}
        </span>

        <p className="mt-4 font-display text-3xl font-semibold text-forest-900">
          {formatoMoneda(precio, config.moneda)}
        </p>

        <div className="mt-6 flex gap-2 rounded-full bg-forest-900/5 p-1 text-sm">
          <button
            onClick={() => setTipoPago("CONTADO")}
            className={`flex-1 rounded-full py-2 font-medium transition ${
              tipoPago === "CONTADO"
                ? "bg-forest-800 text-sand-50"
                : "text-forest-800"
            }`}
          >
            Contado
          </button>
          <button
            onClick={() => setTipoPago("CREDITO")}
            className={`flex-1 rounded-full py-2 font-medium transition ${
              tipoPago === "CREDITO"
                ? "bg-forest-800 text-sand-50"
                : "text-forest-800"
            }`}
          >
            Crédito
          </button>
        </div>

        {tipoPago === "CREDITO" && (
          <div className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-forest-800">
                Enganche (mínimo {config.inicialMinimoPct}%:{" "}
                {formatoMoneda(inicialMinima, config.moneda)})
              </label>
              <input
                type="range"
                min={inicialMinima}
                max={precio}
                step={500}
                value={inicial}
                onChange={(e) => setInicial(Number(e.target.value))}
                className="w-full accent-forest-700"
              />
              <p className="mt-1 font-semibold text-forest-900">
                {formatoMoneda(inicial, config.moneda)}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-forest-800">
                Plazo
              </label>
              <select
                value={plazoMeses}
                onChange={(e) => setPlazoMeses(Number(e.target.value))}
                className="w-full rounded-xl border border-forest-800/20 bg-sand-50 px-3.5 py-2.5 text-sm"
              >
                {plazosDisponibles.map((p) => (
                  <option key={p} value={p}>
                    {p} meses{p === config.plazoRecomendado ? " (recomendado)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-forest-900 p-5 text-sand-100">
              <p className="text-xs uppercase tracking-wide text-sand-300">
                Cuota mensual
              </p>
              <p className="font-display text-3xl font-semibold text-sand-50">
                {formatoMoneda(resultado.cuotaMensual, config.moneda)}
              </p>
              <p className="mt-1 text-xs text-sand-300">
                A financiar: {formatoMoneda(resultado.aFinanciar, config.moneda)} ·
                Sin intereses
              </p>
            </div>
          </div>
        )}

        <form action={formAction} className="mt-7 space-y-4">
          <input type="hidden" name="clave" value={lote.clave} />
          <input type="hidden" name="planTipoPago" value={tipoPago} />
          {tipoPago === "CREDITO" && (
            <>
              <input type="hidden" name="plazoMeses" value={plazoMeses} />
              <input type="hidden" name="inicialMonto" value={inicial} />
            </>
          )}

          <p className="text-sm font-semibold text-forest-900">
            Aparta este lote
          </p>
          <div className="grid gap-3">
            <input
              name="nombre"
              required
              placeholder="Nombre completo"
              className="rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
            <input
              name="telefono"
              required
              placeholder="Teléfono / WhatsApp"
              className="rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
            <input
              name="correo"
              type="email"
              placeholder="Correo (opcional)"
              className="rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
            <div>
              <label className="mb-1 block text-xs font-medium text-forest-700/70">
                Monto de apartado (mínimo{" "}
                {formatoMoneda(config.reservaMinima, config.moneda)})
              </label>
              <input
                name="montoReserva"
                type="number"
                min={config.reservaMinima}
                defaultValue={config.reservaMinima}
                required
                className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <SubmitButton />

          {state.message && (
            <p
              className={`text-sm ${
                state.ok ? "text-forest-700" : "text-red-700"
              }`}
            >
              {state.message}
            </p>
          )}
        </form>
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
      {pending ? "Enviando..." : "Solicitar apartado"}
    </button>
  );
}
