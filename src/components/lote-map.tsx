"use client";

import { useState } from "react";
import { LoteDetailPanel, type LotePlano } from "./lote-detail-panel";

export type ManzanaPlano = {
  numero: number;
  disponiblesEnManzana: number;
  lotes: LotePlano[];
};

export type ProyectoConfigPlano = {
  moneda: string;
  inicialMinimoPct: number;
  plazosMeses: number[];
  plazoRecomendado: number;
  tasaInteres: number;
  reservaMinima: number;
};

export function LoteMap({
  manzanas,
  config,
  desarrolloSlug,
}: {
  manzanas: ManzanaPlano[];
  config: ProyectoConfigPlano;
  desarrolloSlug: string;
}) {
  const [selectedClave, setSelectedClave] = useState<string | null>(null);

  const todosLotes = manzanas.flatMap((m) => m.lotes);
  const selectedLote = todosLotes.find((l) => l.clave === selectedClave) ?? null;
  const selectedManzana = manzanas.find((m) =>
    m.lotes.some((l) => l.clave === selectedClave)
  );

  return (
    <div className="relative">
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
            </div>
            <div className="flex flex-wrap gap-2">
              {m.lotes.map((l) => (
                <button
                  key={l.clave}
                  disabled={!l.disponible}
                  onClick={() =>
                    l.disponible ? setSelectedClave(l.clave) : undefined
                  }
                  title={l.disponible ? `Lote disponible` : undefined}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${
                    l.disponible
                      ? "border-forest-300 bg-forest-100 text-forest-800 hover:bg-forest-200 cursor-pointer"
                      : "border-stone-ink/10 bg-stone-ink/10 text-transparent cursor-default"
                  } ${
                    selectedClave === l.clave
                      ? "ring-2 ring-gold-500 ring-offset-1 ring-offset-sand-50"
                      : ""
                  }`}
                >
                  {l.disponible ? l.numero : ""}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-5 text-xs text-forest-700/70">
        <Legend colorClass="bg-forest-100 border-forest-300" label="Disponible" />
        <Legend colorClass="bg-stone-ink/10 border-stone-ink/10" label="No disponible" />
      </div>

      {selectedLote && selectedManzana && (
        <LoteDetailPanel
          lote={selectedLote}
          disponiblesEnManzana={selectedManzana.disponiblesEnManzana}
          config={config}
          desarrolloSlug={desarrolloSlug}
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
