"use client";

import { useMemo, useState } from "react";
import { LoteDetailPanel, type LotePlano } from "./lote-detail-panel";

export type ManzanaPlano = {
  numero: number;
  lotes: LotePlano[];
};

export type ProyectoConfigPlano = {
  moneda: string;
  inicialMinimoPct: number;
  plazosMeses: number[];
  tasaInteres: number;
  reservaMinima: number;
};

const ESTATUS_FILTROS = [
  { key: "TODOS", label: "Todos" },
  { key: "DISPONIBLE", label: "Disponible" },
  { key: "APARTADO", label: "Apartado" },
  { key: "VENDIDO", label: "Vendido" },
] as const;

const ESTATUS_STYLES: Record<LotePlano["estatus"], string> = {
  DISPONIBLE:
    "bg-forest-100 text-forest-800 border-forest-300 hover:bg-forest-200",
  APARTADO: "bg-gold-400/25 text-sand-900 border-gold-500/60 hover:bg-gold-400/40",
  VENDIDO: "bg-stone-ink/10 text-stone-ink/50 border-stone-ink/15",
};

export function LoteMap({
  manzanas,
  config,
}: {
  manzanas: ManzanaPlano[];
  config: ProyectoConfigPlano;
}) {
  const [filtro, setFiltro] =
    useState<(typeof ESTATUS_FILTROS)[number]["key"]>("TODOS");
  const [selectedClave, setSelectedClave] = useState<string | null>(null);

  const todosLotes = useMemo(
    () => manzanas.flatMap((m) => m.lotes),
    [manzanas]
  );

  const counts = useMemo(
    () => ({
      TODOS: todosLotes.length,
      DISPONIBLE: todosLotes.filter((l) => l.estatus === "DISPONIBLE").length,
      APARTADO: todosLotes.filter((l) => l.estatus === "APARTADO").length,
      VENDIDO: todosLotes.filter((l) => l.estatus === "VENDIDO").length,
    }),
    [todosLotes]
  );

  const selectedLote = todosLotes.find((l) => l.clave === selectedClave) ?? null;

  return (
    <div className="relative">
      <div className="mb-8 flex flex-wrap items-center gap-2.5">
        {ESTATUS_FILTROS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              filtro === f.key
                ? "border-forest-800 bg-forest-800 text-sand-50"
                : "border-forest-800/15 bg-sand-50 text-forest-800 hover:border-forest-800/40"
            }`}
          >
            {f.label}{" "}
            <span
              className={
                filtro === f.key ? "text-sand-300" : "text-forest-700/50"
              }
            >
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {manzanas.map((m) => (
          <div
            key={m.numero}
            className="rounded-2xl border border-forest-900/10 bg-sand-50 p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-forest-900">
                Manzana {m.numero}
              </h3>
              <span className="text-xs text-forest-700/60">
                {m.lotes.length} lotes
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {m.lotes.map((l) => {
                const dimmed = filtro !== "TODOS" && l.estatus !== filtro;
                return (
                  <button
                    key={l.clave}
                    onClick={() => setSelectedClave(l.clave)}
                    title={`Lote ${l.clave}`}
                    className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${
                      ESTATUS_STYLES[l.estatus]
                    } ${dimmed ? "opacity-25" : "opacity-100"} ${
                      selectedClave === l.clave
                        ? "ring-2 ring-gold-500 ring-offset-1 ring-offset-sand-50"
                        : ""
                    }`}
                  >
                    {l.numero}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-5 text-xs text-forest-700/70">
        <Legend colorClass="bg-forest-100 border-forest-300" label="Disponible" />
        <Legend colorClass="bg-gold-400/25 border-gold-500/60" label="Apartado" />
        <Legend colorClass="bg-stone-ink/10 border-stone-ink/15" label="Vendido" />
      </div>

      {selectedLote && (
        <LoteDetailPanel
          lote={selectedLote}
          config={config}
          onClose={() => setSelectedClave(null)}
        />
      )}
    </div>
  );
}

function Legend({
  colorClass,
  label,
}: {
  colorClass: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3.5 w-3.5 rounded border ${colorClass}`} />
      {label}
    </div>
  );
}
