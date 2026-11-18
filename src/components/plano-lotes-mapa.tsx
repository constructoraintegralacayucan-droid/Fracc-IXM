"use client";

import type { LotePlano } from "./lote-detail-panel";

const ESTATUS_PIN: Record<string, string> = {
  DISPONIBLE: "bg-forest-600 border-forest-800 hover:bg-forest-500",
  APARTADO: "bg-stone-ink/50 border-stone-ink/70",
  VENDIDO: "bg-stone-ink/50 border-stone-ink/70",
};

export function PlanoLotesMapa({
  planoImagen,
  lotes,
  onSelectDisponible,
  onSelectInfo,
}: {
  planoImagen: string;
  lotes: LotePlano[];
  onSelectDisponible: (clave: string) => void;
  onSelectInfo: (lote: LotePlano) => void;
}) {
  const lotesUbicados = lotes.filter(
    (l) => l.planoX != null && l.planoY != null
  );

  return (
    <div>
      <div className="rounded-2xl border border-forest-900/10 bg-white">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={planoImagen}
            alt="Plano del fraccionamiento"
            className="block h-auto w-full"
            draggable={false}
          />
          {lotesUbicados.map((l) => {
            const disponible = l.estatus === "DISPONIBLE";
            return (
              <button
                key={l.clave}
                type="button"
                onClick={() =>
                  disponible ? onSelectDisponible(l.clave) : onSelectInfo(l)
                }
                title={`Lote ${l.numero} · Manzana ${l.manzanaNumero}${
                  disponible ? "" : " (no disponible)"
                }`}
                style={{
                  left: `${(l.planoX ?? 0) * 100}%`,
                  top: `${(l.planoY ?? 0) * 100}%`,
                }}
                className={`absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[9px] font-bold text-white shadow transition sm:h-6 sm:w-6 sm:text-[10px] ${ESTATUS_PIN[l.estatus]}`}
              >
                {disponible ? l.numero : "🔒"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-5 text-xs text-forest-700/70">
        <div className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-forest-800 bg-forest-600" />
          Disponible
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-stone-ink/70 bg-stone-ink/50" />
          Apartado / vendido
        </div>
      </div>

      {lotes.length > 0 && lotesUbicados.length === 0 && (
        <p className="mt-4 text-sm text-forest-700/60">
          Aún no se han marcado los lotes sobre este plano.
        </p>
      )}
    </div>
  );
}
