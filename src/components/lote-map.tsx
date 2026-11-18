"use client";

import { useMemo, useState } from "react";
import { LoteDetailPanel, type LotePlano } from "./lote-detail-panel";
import { LoteCard } from "./lote-card";
import { LoteInfoModal } from "./lote-info-modal";
import { PlanoLotesMapa } from "./plano-lotes-mapa";
import {
  FiltroPresupuesto,
  FILTROS_VACIOS,
  type FiltrosPresupuesto,
} from "./filtro-presupuesto";

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
  datosBancarios: string;
  whatsapp: string;
};

export function LoteMap({
  manzanas,
  config,
  desarrolloSlug,
  desarrolloNombre,
  planoImagen,
}: {
  manzanas: ManzanaPlano[];
  config: ProyectoConfigPlano;
  desarrolloSlug: string;
  desarrolloNombre: string;
  planoImagen?: string | null;
}) {
  const [selectedClave, setSelectedClave] = useState<string | null>(null);
  const [infoLote, setInfoLote] = useState<LotePlano | null>(null);
  const [filtros, setFiltros] = useState<FiltrosPresupuesto>(FILTROS_VACIOS);
  const [vista, setVista] = useState<"lista" | "mapa">(
    planoImagen ? "mapa" : "lista"
  );

  const plazoMax =
    config.plazosMeses.length > 0 ? Math.max(...config.plazosMeses) : 1;

  const todosLotes = manzanas.flatMap((m) => m.lotes);
  const selectedLote = todosLotes.find((l) => l.clave === selectedClave) ?? null;
  const selectedManzana = manzanas.find((m) =>
    m.lotes.some((l) => l.clave === selectedClave)
  );

  function cumpleFiltros(lote: LotePlano): boolean {
    if (filtros.soloDisponibles && lote.estatus !== "DISPONIBLE") return false;
    if (filtros.soloPromociones && !lote.enPromocion) return false;
    if (lote.estatus !== "DISPONIBLE") return true;

    if (
      filtros.precioMax !== null &&
      lote.precioContado !== null &&
      lote.precioContado > filtros.precioMax
    ) {
      return false;
    }
    if (lote.precioCredito !== null) {
      const engancheMinimo = Math.round(
        (lote.precioCredito * config.inicialMinimoPct) / 100
      );
      if (filtros.engancheMax !== null && engancheMinimo > filtros.engancheMax) {
        return false;
      }
      const mensualidadMinima =
        plazoMax > 0
          ? Math.round((lote.precioCredito - engancheMinimo) / plazoMax)
          : 0;
      if (
        filtros.mensualidadMax !== null &&
        mensualidadMinima > filtros.mensualidadMax
      ) {
        return false;
      }
    }
    return true;
  }

  const manzanasFiltradas = useMemo(
    () =>
      manzanas
        .map((m) => ({ ...m, lotes: m.lotes.filter(cumpleFiltros) }))
        .filter((m) => m.lotes.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [manzanas, filtros, config.inicialMinimoPct, plazoMax]
  );

  const hayFiltrosActivos =
    filtros.precioMax !== null ||
    filtros.engancheMax !== null ||
    filtros.mensualidadMax !== null ||
    filtros.soloPromociones ||
    !filtros.soloDisponibles;

  return (
    <div className="relative">
      {planoImagen && (
        <div className="mb-6 inline-flex rounded-full border border-forest-900/10 bg-white p-1 text-sm">
          <button
            type="button"
            onClick={() => setVista("mapa")}
            className={`rounded-full px-4 py-1.5 font-semibold transition ${
              vista === "mapa"
                ? "bg-forest-800 text-sand-50"
                : "text-forest-700/70 hover:text-forest-900"
            }`}
          >
            Plano
          </button>
          <button
            type="button"
            onClick={() => setVista("lista")}
            className={`rounded-full px-4 py-1.5 font-semibold transition ${
              vista === "lista"
                ? "bg-forest-800 text-sand-50"
                : "text-forest-700/70 hover:text-forest-900"
            }`}
          >
            Lista
          </button>
        </div>
      )}

      {vista === "mapa" && planoImagen ? (
        <PlanoLotesMapa
          planoImagen={planoImagen}
          lotes={todosLotes}
          onSelectDisponible={setSelectedClave}
          onSelectInfo={setInfoLote}
        />
      ) : (
        <>
          <div className="mb-6">
            <FiltroPresupuesto onChange={setFiltros} />
          </div>

          {manzanasFiltradas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-forest-900/20 bg-sand-50 p-8 text-center text-sm text-forest-700/60">
              No hay lotes que cumplan estos filtros por ahora. Intenta con un
              presupuesto más amplio.
            </p>
          ) : (
            <div className="grid gap-6">
              {manzanasFiltradas.map((m) => (
                <div
                  key={m.numero}
                  className="rounded-2xl border border-forest-900/10 bg-sand-50 p-5 sm:p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-forest-900">
                      Manzana {m.numero}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {m.lotes.map((l) => (
                      <LoteCard
                        key={l.clave}
                        lote={l}
                        moneda={config.moneda}
                        onClick={() => setSelectedClave(l.clave)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hayFiltrosActivos && (
            <div className="mt-8 flex flex-wrap gap-5 text-xs text-forest-700/70">
              <Legend colorClass="bg-white border-forest-300" label="Disponible" />
              <Legend
                colorClass="bg-gold-400/5 border-gold-500"
                label="Promoción"
              />
              <Legend
                colorClass="bg-sand-100/50 border-sand-300"
                label="Apartado"
              />
              <Legend colorClass="bg-stone-ink/5 border-stone-ink/10" label="Vendido" />
            </div>
          )}
        </>
      )}

      {infoLote && (
        <LoteInfoModal lote={infoLote} onClose={() => setInfoLote(null)} />
      )}

      {selectedLote && selectedManzana && (
        <LoteDetailPanel
          key={selectedLote.clave}
          lote={selectedLote}
          disponiblesEnManzana={selectedManzana.disponiblesEnManzana}
          config={config}
          desarrolloSlug={desarrolloSlug}
          desarrolloNombre={desarrolloNombre}
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
