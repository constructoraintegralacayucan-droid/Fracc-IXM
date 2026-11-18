"use client";

import type { LotePlano } from "./lote-detail-panel";

const ESTATUS_LABEL: Record<string, string> = {
  APARTADO: "Apartado",
  VENDIDO: "Vendido",
};

export function LoteInfoModal({
  lote,
  onClose,
}: {
  lote: LotePlano;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-forest-950/50 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-sand-50 p-6 shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700/60">
              Manzana {lote.manzanaNumero} · Lote {lote.numero}
            </p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-forest-900">
              Lote no disponible
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-forest-700 hover:bg-forest-900/5"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-ink/10 px-3 py-1 text-xs font-semibold text-stone-ink/70">
          🔒 {ESTATUS_LABEL[lote.estatus] ?? lote.estatus}
        </span>

        <p className="mt-4 text-sm text-forest-700/80">
          {lote.areaM2} m² · {lote.frenteM} × {lote.fondoM} m
        </p>

        <p className="mt-4 text-sm text-forest-700/70">
          Este lote ya {lote.estatus === "VENDIDO" ? "fue vendido" : "está apartado"}
          . Si buscas algo parecido, revisa los lotes disponibles marcados en
          verde en el plano.
        </p>
      </div>
    </div>
  );
}
