"use client";

import { useState } from "react";

export type FiltrosPresupuesto = {
  precioMax: number | null;
  engancheMax: number | null;
  mensualidadMax: number | null;
  soloPromociones: boolean;
  soloDisponibles: boolean;
};

export const FILTROS_VACIOS: FiltrosPresupuesto = {
  precioMax: null,
  engancheMax: null,
  mensualidadMax: null,
  soloPromociones: false,
  soloDisponibles: true,
};

export function FiltroPresupuesto({
  onChange,
}: {
  onChange: (filtros: FiltrosPresupuesto) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosPresupuesto>(FILTROS_VACIOS);

  function actualizar(cambios: Partial<FiltrosPresupuesto>) {
    const nuevos = { ...filtros, ...cambios };
    setFiltros(nuevos);
    onChange(nuevos);
  }

  const hayFiltrosActivos =
    filtros.precioMax !== null ||
    filtros.engancheMax !== null ||
    filtros.mensualidadMax !== null ||
    filtros.soloPromociones;

  return (
    <div className="rounded-2xl border border-forest-900/10 bg-sand-50">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-forest-900">
          ¿Cuánto puedes pagar?{" "}
          {hayFiltrosActivos && (
            <span className="ml-1 rounded-full bg-gold-400/25 px-2 py-0.5 text-[11px] font-semibold text-sand-900">
              filtrando
            </span>
          )}
        </span>
        <span className="text-forest-700/60">{abierto ? "−" : "+"}</span>
      </button>

      {abierto && (
        <div className="grid gap-3 border-t border-forest-900/10 p-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Precio máximo
            </label>
            <input
              type="number"
              min={0}
              placeholder="Sin límite"
              value={filtros.precioMax ?? ""}
              onChange={(e) =>
                actualizar({
                  precioMax: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Enganche máximo
            </label>
            <input
              type="number"
              min={0}
              placeholder="Sin límite"
              value={filtros.engancheMax ?? ""}
              onChange={(e) =>
                actualizar({
                  engancheMax: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Mensualidad máxima
            </label>
            <input
              type="number"
              min={0}
              placeholder="Ej. 8000"
              value={filtros.mensualidadMax ?? ""}
              onChange={(e) =>
                actualizar({
                  mensualidadMax: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-forest-800 sm:col-span-1">
            <input
              type="checkbox"
              checked={filtros.soloDisponibles}
              onChange={(e) =>
                actualizar({ soloDisponibles: e.target.checked })
              }
              className="h-4 w-4 accent-forest-700"
            />
            Solo disponibles
          </label>
          <label className="flex items-center gap-2 text-sm text-forest-800 sm:col-span-1">
            <input
              type="checkbox"
              checked={filtros.soloPromociones}
              onChange={(e) =>
                actualizar({ soloPromociones: e.target.checked })
              }
              className="h-4 w-4 accent-gold-500"
            />
            Solo promociones
          </label>

          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={() => {
                setFiltros(FILTROS_VACIOS);
                onChange(FILTROS_VACIOS);
              }}
              className="text-left text-xs font-semibold text-forest-700/70 underline hover:text-forest-900 sm:col-span-1"
            >
              Quitar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
