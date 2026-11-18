"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { guardarPinLote, borrarPinLote } from "@/app/admin/actions";

export type LotePlanoAdmin = {
  id: string;
  clave: string;
  numero: number;
  manzanaNumero: number;
  estatus: "DISPONIBLE" | "APARTADO" | "VENDIDO";
  planoX: number | null;
  planoY: number | null;
};

const ESTATUS_COLOR: Record<string, string> = {
  DISPONIBLE: "bg-forest-600 border-forest-800",
  APARTADO: "bg-amber-500 border-amber-700",
  VENDIDO: "bg-stone-ink/60 border-stone-ink",
};

export function PlanoPinEditor({
  planoImagen,
  lotesIniciales,
}: {
  planoImagen: string;
  lotesIniciales: LotePlanoAdmin[];
}) {
  const [lotes, setLotes] = useState(lotesIniciales);
  const [armadoId, setArmadoId] = useState<string | null>(null);
  const [filtroManzana, setFiltroManzana] = useState<number | "todas">(
    "todas"
  );
  const [soloSinUbicar, setSoloSinUbicar] = useState(true);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();
  const [guardando, setGuardando] = useState(false);

  const manzanas = useMemo(
    () => Array.from(new Set(lotes.map((l) => l.manzanaNumero))).sort(
      (a, b) => a - b
    ),
    [lotes]
  );

  const lotesFiltrados = useMemo(() => {
    return lotes.filter((l) => {
      if (filtroManzana !== "todas" && l.manzanaNumero !== filtroManzana)
        return false;
      if (soloSinUbicar && l.planoX != null) return false;
      return true;
    });
  }, [lotes, filtroManzana, soloSinUbicar]);

  const ubicados = lotes.filter((l) => l.planoX != null).length;

  const armado = armadoId ? lotes.find((l) => l.id === armadoId) ?? null : null;

  function siguienteSinUbicar(desdeId: string | null) {
    const pendientes = lotes.filter((l) => l.planoX == null);
    if (pendientes.length === 0) return null;
    if (!desdeId) return pendientes[0].id;
    const idx = pendientes.findIndex((l) => l.id === desdeId);
    return pendientes[(idx + 1) % pendientes.length]?.id ?? pendientes[0].id;
  }

  async function guardarPosicion(loteId: string, x: number, y: number) {
    setGuardando(true);
    setLotes((prev) =>
      prev.map((l) => (l.id === loteId ? { ...l, planoX: x, planoY: y } : l))
    );
    const fd = new FormData();
    fd.set("loteId", loteId);
    fd.set("planoX", String(x));
    fd.set("planoY", String(y));
    await guardarPinLote({ ok: false, message: "" }, fd);
    setGuardando(false);
  }

  function handleImageClick(e: React.MouseEvent<HTMLImageElement>) {
    if (!armadoId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const siguiente = siguienteSinUbicar(armadoId);
    startTransition(() => {
      guardarPosicion(armadoId, x, y);
    });
    setArmadoId(siguiente);
  }

  function quitarPin(loteId: string) {
    setLotes((prev) =>
      prev.map((l) => (l.id === loteId ? { ...l, planoX: null, planoY: null } : l))
    );
    const fd = new FormData();
    fd.set("loteId", loteId);
    startTransition(() => {
      borrarPinLote(fd);
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <div className="space-y-3">
        <div className="rounded-xl border border-forest-900/10 bg-white p-3 text-sm">
          <p className="font-semibold text-forest-900">
            {ubicados} / {lotes.length} lotes ubicados
          </p>
          <p className="mt-1 text-xs text-forest-700/60">
            {guardando
              ? "Guardando..."
              : armado
                ? `Da clic en el plano donde está el Lote ${armado.numero} (Manzana ${armado.manzanaNumero}).`
                : "Elige un lote de la lista y luego da clic en su lugar en el plano."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filtroManzana}
            onChange={(e) =>
              setFiltroManzana(
                e.target.value === "todas" ? "todas" : Number(e.target.value)
              )
            }
            className="rounded-lg border border-forest-800/20 bg-white px-2.5 py-1.5 text-xs"
          >
            <option value="todas">Todas las manzanas</option>
            {manzanas.map((m) => (
              <option key={m} value={m}>
                Manzana {m}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-forest-700/70">
            <input
              type="checkbox"
              checked={soloSinUbicar}
              onChange={(e) => setSoloSinUbicar(e.target.checked)}
            />
            Solo sin ubicar
          </label>
        </div>

        <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-forest-900/10 bg-white">
          {lotesFiltrados.length === 0 && (
            <p className="p-3 text-xs text-forest-700/60">
              No hay lotes con este filtro.
            </p>
          )}
          {lotesFiltrados.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setArmadoId(l.id)}
              className={`flex w-full items-center justify-between gap-2 border-b border-forest-900/5 px-3 py-2 text-left text-sm last:border-0 ${
                armadoId === l.id
                  ? "bg-gold-400/20"
                  : "hover:bg-forest-900/5"
              }`}
            >
              <span>
                Manzana {l.manzanaNumero} · Lote {l.numero}
              </span>
              <span className="flex items-center gap-1.5">
                {l.planoX != null && (
                  <span
                    className={`h-2.5 w-2.5 rounded-full border ${ESTATUS_COLOR[l.estatus]}`}
                  />
                )}
                {l.planoX != null && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      quitarPin(l.id);
                    }}
                    className="text-[11px] font-semibold text-red-700/70 hover:text-red-800"
                  >
                    quitar
                  </button>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div
        ref={imgWrapRef}
        className="max-h-[80vh] overflow-auto rounded-xl border border-forest-900/10 bg-white"
      >
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={planoImagen}
            alt="Plano del fraccionamiento"
            onClick={handleImageClick}
            className={`block w-[1800px] max-w-none select-none ${
              armadoId ? "cursor-crosshair" : "cursor-default"
            }`}
            draggable={false}
          />
          {lotes
            .filter((l) => l.planoX != null && l.planoY != null)
            .map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setArmadoId(l.id);
                }}
                title={`Manzana ${l.manzanaNumero} · Lote ${l.numero}`}
                style={{
                  left: `${(l.planoX ?? 0) * 100}%`,
                  top: `${(l.planoY ?? 0) * 100}%`,
                }}
                className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white shadow ${
                  armadoId === l.id
                    ? "z-10 ring-2 ring-gold-500"
                    : ""
                } ${ESTATUS_COLOR[l.estatus]}`}
              >
                {l.numero}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
