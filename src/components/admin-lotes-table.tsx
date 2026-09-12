"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { actualizarLote } from "@/app/admin/actions";

export type LoteAdminPlano = {
  id: string;
  clave: string;
  numero: number;
  manzanaNumero: number;
  precio: number;
  estatus: "DISPONIBLE" | "APARTADO" | "VENDIDO";
  compradorNombre: string | null;
  compradorTelefono: string | null;
  compradorCorreo: string | null;
  tipoPago: "CONTADO" | "CREDITO" | null;
  anticipo: number;
};

export function AdminLotesTable({ lotes }: { lotes: LoteAdminPlano[] }) {
  const manzanas = useMemo(
    () => Array.from(new Set(lotes.map((l) => l.manzanaNumero))).sort(
      (a, b) => a - b
    ),
    [lotes]
  );

  const [manzanaFiltro, setManzanaFiltro] = useState<number | "TODAS">(
    "TODAS"
  );
  const [estatusFiltro, setEstatusFiltro] = useState<
    "TODOS" | LoteAdminPlano["estatus"]
  >("TODOS");
  const [busqueda, setBusqueda] = useState("");

  const filtrados = lotes.filter((l) => {
    if (manzanaFiltro !== "TODAS" && l.manzanaNumero !== manzanaFiltro)
      return false;
    if (estatusFiltro !== "TODOS" && l.estatus !== estatusFiltro)
      return false;
    if (
      busqueda &&
      !l.clave.toLowerCase().includes(busqueda.toLowerCase()) &&
      !(l.compradorNombre ?? "").toLowerCase().includes(busqueda.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-3">
        <select
          value={manzanaFiltro}
          onChange={(e) =>
            setManzanaFiltro(
              e.target.value === "TODAS" ? "TODAS" : Number(e.target.value)
            )
          }
          className="rounded-xl border border-forest-800/20 bg-sand-50 px-3.5 py-2 text-sm"
        >
          <option value="TODAS">Todas las manzanas</option>
          {manzanas.map((m) => (
            <option key={m} value={m}>
              Manzana {m}
            </option>
          ))}
        </select>

        <select
          value={estatusFiltro}
          onChange={(e) =>
            setEstatusFiltro(e.target.value as typeof estatusFiltro)
          }
          className="rounded-xl border border-forest-800/20 bg-sand-50 px-3.5 py-2 text-sm"
        >
          <option value="TODOS">Todos los estatus</option>
          <option value="DISPONIBLE">Disponible</option>
          <option value="APARTADO">Apartado</option>
          <option value="VENDIDO">Vendido</option>
        </select>

        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por clave o comprador..."
          className="flex-1 min-w-[220px] rounded-xl border border-forest-800/20 bg-sand-50 px-3.5 py-2 text-sm"
        />
      </div>

      <p className="mb-3 text-xs text-forest-700/60">
        {filtrados.length} lote(s)
      </p>

      <div className="space-y-3 sm:space-y-0 sm:overflow-x-auto sm:rounded-2xl sm:border sm:border-forest-900/10 sm:bg-sand-50">
        <div className="hidden text-xs uppercase tracking-wide text-forest-700/70 sm:grid sm:grid-cols-8 sm:gap-2 sm:border-b sm:border-forest-900/10 sm:px-4 sm:py-3">
          <div className="font-semibold">Clave</div>
          <div className="font-semibold">Estatus</div>
          <div className="font-semibold">Tipo</div>
          <div className="font-semibold">Precio</div>
          <div className="col-span-2 font-semibold">Comprador</div>
          <div className="font-semibold">Teléfono</div>
          <div className="font-semibold">Correo</div>
        </div>

        {filtrados.map((lote) => (
          <FilaLote key={lote.id} lote={lote} />
        ))}
      </div>
    </div>
  );
}

function Campo({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[11px] font-medium text-forest-700/60 sm:hidden">
        {label}
      </label>
      {children}
    </div>
  );
}

function FilaLote({ lote }: { lote: LoteAdminPlano }) {
  // La key incluye los campos editables: cuando el guardado realmente
  // cambia los datos, React remonta el formulario con los valores nuevos
  // en vez de arrastrar los valores que el navegador dejó en el DOM justo
  // después de enviar (React resetea los campos no controlados del
  // formulario a su valor original apenas la acción termina).
  const key = [
    lote.id,
    lote.estatus,
    lote.precio,
    lote.compradorNombre,
    lote.compradorTelefono,
    lote.compradorCorreo,
    lote.tipoPago,
  ].join("|");

  return (
    <form
      key={key}
      action={actualizarLote}
      className="grid grid-cols-2 gap-3 rounded-2xl border border-forest-900/10 bg-sand-50 p-4 sm:grid-cols-8 sm:items-center sm:gap-2 sm:rounded-none sm:border-0 sm:border-b sm:p-0 sm:px-4 sm:py-2.5 sm:last:border-0"
    >
      <input type="hidden" name="loteId" value={lote.id} />
      <div className="col-span-2 font-display text-lg font-semibold text-forest-900 sm:col-span-1 sm:text-sm sm:font-medium">
        {lote.clave}
      </div>

      <Campo label="Estatus">
        <select
          name="estatus"
          defaultValue={lote.estatus}
          className="w-full rounded-lg border border-forest-800/20 bg-white px-2 py-2 text-sm sm:py-1.5 sm:text-xs"
        >
          <option value="DISPONIBLE">Disponible</option>
          <option value="APARTADO">Apartado</option>
          <option value="VENDIDO">Vendido</option>
        </select>
      </Campo>

      <Campo label="Tipo de pago">
        <select
          name="tipoPago"
          defaultValue={lote.tipoPago ?? ""}
          title="Tipo de pago: marca Contado para saldar el lote sin crear plan de pagos"
          className="w-full rounded-lg border border-forest-800/20 bg-white px-2 py-2 text-sm sm:py-1.5 sm:text-xs"
        >
          <option value="">Tipo —</option>
          <option value="CONTADO">Contado</option>
          <option value="CREDITO">Crédito</option>
        </select>
      </Campo>

      <Campo label="Precio">
        <input
          name="precio"
          type="number"
          defaultValue={lote.precio}
          className="w-full rounded-lg border border-forest-800/20 bg-white px-2 py-2 text-sm sm:py-1.5 sm:text-xs"
        />
      </Campo>

      <Campo label="Comprador" className="col-span-2">
        <input
          name="compradorNombre"
          defaultValue={lote.compradorNombre ?? ""}
          placeholder="—"
          className="w-full rounded-lg border border-forest-800/20 bg-white px-2 py-2 text-sm sm:py-1.5 sm:text-xs"
        />
      </Campo>

      <Campo label="Teléfono">
        <input
          name="compradorTelefono"
          defaultValue={lote.compradorTelefono ?? ""}
          placeholder="—"
          className="w-full rounded-lg border border-forest-800/20 bg-white px-2 py-2 text-sm sm:py-1.5 sm:text-xs"
        />
      </Campo>

      <Campo label="Correo">
        <input
          name="compradorCorreo"
          defaultValue={lote.compradorCorreo ?? ""}
          placeholder="—"
          className="w-full rounded-lg border border-forest-800/20 bg-white px-2 py-2 text-sm sm:py-1.5 sm:text-xs"
        />
      </Campo>

      <div className="col-span-2 flex gap-2 pt-1 sm:col-span-2 sm:pt-0">
        <button
          type="submit"
          className="flex-1 rounded-full bg-forest-800 px-3 py-2 text-xs font-semibold text-sand-50 hover:bg-forest-700 sm:flex-none sm:py-1.5"
        >
          Guardar
        </button>

        <Link
          href={`/admin/lotes/${lote.id}`}
          className="flex-1 rounded-full border border-gold-500/50 px-3 py-2 text-center text-xs font-semibold text-gold-600 hover:bg-gold-400/10 sm:flex-none sm:py-1.5"
        >
          Cliente y pagos →
        </Link>
      </div>
    </form>
  );
}
