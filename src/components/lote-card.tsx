import { formatoMoneda } from "@/lib/financiamiento";
import type { LotePlano } from "./lote-detail-panel";

const ESTADO_ESTILO: Record<
  string,
  { badge: string; borde: string; fondo: string }
> = {
  DISPONIBLE: {
    badge: "bg-forest-100 text-forest-800",
    borde: "border-forest-300",
    fondo: "bg-white",
  },
  PROMOCION: {
    badge: "bg-gold-400/25 text-sand-900",
    borde: "border-gold-500",
    fondo: "bg-gold-400/5",
  },
  APARTADO: {
    badge: "bg-sand-300/60 text-forest-800",
    borde: "border-sand-300",
    fondo: "bg-sand-100/50",
  },
  VENDIDO: {
    badge: "bg-stone-ink/10 text-stone-ink/60",
    borde: "border-stone-ink/10",
    fondo: "bg-stone-ink/5",
  },
};

function estadoLabel(lote: LotePlano) {
  if (lote.enPromocion) return "PROMOCIÓN";
  return lote.estatus;
}

export function LoteCard({
  lote,
  moneda,
  onClick,
}: {
  lote: LotePlano;
  moneda: string;
  onClick: () => void;
}) {
  const estadoKey = lote.enPromocion ? "PROMOCION" : lote.estatus;
  const estilo = ESTADO_ESTILO[estadoKey] ?? ESTADO_ESTILO.DISPONIBLE;
  const clicable = lote.estatus === "DISPONIBLE";

  return (
    <button
      type="button"
      disabled={!clicable}
      onClick={clicable ? onClick : undefined}
      className={`flex flex-col rounded-2xl border p-4 text-left transition ${estilo.borde} ${estilo.fondo} ${
        clicable
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
          : "cursor-default opacity-90"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-forest-700/60">
            Lote {lote.numero}
          </p>
          <p className="mt-0.5 text-sm text-forest-700/80">
            {lote.areaM2} m²
          </p>
          <p className="text-xs text-forest-700/60">
            {lote.frenteM}×{lote.fondoM} m
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${estilo.badge}`}
        >
          {estadoLabel(lote)}
        </span>
      </div>

      {lote.estatus === "DISPONIBLE" && lote.precioContado != null ? (
        <div className="mt-3">
          {lote.enPromocion && lote.precioContadoOriginal != null && (
            <p className="text-xs text-forest-700/50 line-through">
              {formatoMoneda(lote.precioContadoOriginal, moneda)}
            </p>
          )}
          <p className="font-display text-xl font-semibold text-forest-900">
            {formatoMoneda(lote.precioContado, moneda)}
          </p>
          <p className="text-[11px] text-forest-700/60">de contado</p>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-sm font-medium text-forest-700/50">
            {lote.estatus === "VENDIDO" ? "Ya vendido" : "Ya apartado"}
          </p>
        </div>
      )}
    </button>
  );
}
