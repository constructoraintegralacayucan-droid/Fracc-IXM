"use client";

import { useMemo, useState } from "react";
import { calcularFinanciamiento, formatoMoneda } from "@/lib/financiamiento";

export function GenericCalculator({
  precioBase,
  inicialMinimoPct,
  plazos,
}: {
  precioBase: number;
  inicialMinimoPct: number;
  plazos: number[];
}) {
  const [precio, setPrecio] = useState(precioBase);
  const inicialMinima = useMemo(
    () => Math.round((precio * inicialMinimoPct) / 100),
    [precio, inicialMinimoPct]
  );
  const [inicial, setInicial] = useState(inicialMinima);
  const [plazoMeses, setPlazoMeses] = useState(plazos[0]);

  const resultado = useMemo(
    () =>
      calcularFinanciamiento({
        precio,
        inicial,
        plazoMeses,
        tasaInteresAnual: 0,
      }),
    [precio, inicial, plazoMeses]
  );

  return (
    <div className="grid gap-8 rounded-3xl border border-forest-800/10 bg-sand-50 p-6 shadow-[0_20px_60px_-30px_rgba(23,40,31,0.35)] sm:p-10 md:grid-cols-2">
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-forest-800">
            Precio del lote
          </label>
          <input
            type="range"
            min={50000}
            max={150000}
            step={1000}
            value={precio}
            onChange={(e) => {
              const value = Number(e.target.value);
              setPrecio(value);
              setInicial(Math.round((value * inicialMinimoPct) / 100));
            }}
            className="w-full accent-forest-700"
          />
          <p className="mt-1 font-display text-2xl font-semibold text-forest-900">
            {formatoMoneda(precio)}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-forest-800">
            Enganche / inicial (mínimo {inicialMinimoPct}%)
          </label>
          <input
            type="range"
            min={inicialMinima}
            max={precio}
            step={500}
            value={inicial}
            onChange={(e) => setInicial(Number(e.target.value))}
            className="w-full accent-gold-500"
          />
          <p className="mt-1 font-display text-2xl font-semibold text-forest-900">
            {formatoMoneda(inicial)}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-forest-800">
            Plazo de financiamiento
          </label>
          <div className="flex flex-wrap gap-2">
            {plazos.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlazoMeses(p)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                  plazoMeses === p
                    ? "border-forest-800 bg-forest-800 text-sand-50"
                    : "border-forest-800/20 text-forest-800 hover:border-forest-800/50"
                }`}
              >
                {p} meses
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center rounded-2xl bg-forest-900 p-8 text-sand-100">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-300">
          Tu plan de pagos
        </p>
        <p className="mt-3 font-display text-4xl font-semibold text-sand-50">
          {formatoMoneda(resultado.cuotaMensual)}
          <span className="text-base font-normal text-sand-300"> /mes</span>
        </p>
        <p className="mt-1 text-sm text-sand-300">
          Sin intereses · {plazoMeses} mensualidades
        </p>

        <dl className="mt-6 space-y-2.5 border-t border-sand-50/15 pt-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-sand-300">Precio total</dt>
            <dd className="font-medium text-sand-50">
              {formatoMoneda(precio)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sand-300">Inicial</dt>
            <dd className="font-medium text-sand-50">
              {formatoMoneda(inicial)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sand-300">A financiar</dt>
            <dd className="font-medium text-sand-50">
              {formatoMoneda(resultado.aFinanciar)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
