"use client";

import { useMemo, useState } from "react";
import { actualizarLote } from "@/app/admin/actions";
import { formatoMoneda } from "@/lib/financiamiento";

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
  anticipo: number;
  saldo: number;
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

      <div className="overflow-x-auto rounded-2xl border border-forest-900/10 bg-sand-50">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-forest-900/10 text-xs uppercase tracking-wide text-forest-700/70">
              <th className="px-4 py-3 font-semibold">Clave</th>
              <th className="px-4 py-3 font-semibold">Estatus</th>
              <th className="px-4 py-3 font-semibold">Precio</th>
              <th className="px-4 py-3 font-semibold">Comprador</th>
              <th className="px-4 py-3 font-semibold">Teléfono</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Saldo</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((lote) => (
              <tr
                key={lote.id}
                className="border-b border-forest-900/5 align-top last:border-0"
              >
                <FilaLote lote={lote} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilaLote({ lote }: { lote: LoteAdminPlano }) {
  return (
    <td colSpan={8} className="p-0">
      <form
        action={actualizarLote}
        className="grid grid-cols-8 items-center gap-2 px-4 py-2.5"
      >
        <input type="hidden" name="loteId" value={lote.id} />
        <div className="font-medium text-forest-900">{lote.clave}</div>

        <select
          name="estatus"
          defaultValue={lote.estatus}
          className="col-span-1 rounded-lg border border-forest-800/20 bg-white px-2 py-1.5 text-xs"
        >
          <option value="DISPONIBLE">Disponible</option>
          <option value="APARTADO">Apartado</option>
          <option value="VENDIDO">Vendido</option>
        </select>

        <input
          name="precio"
          type="number"
          defaultValue={lote.precio}
          className="col-span-1 w-28 rounded-lg border border-forest-800/20 bg-white px-2 py-1.5 text-xs"
        />

        <input
          name="compradorNombre"
          defaultValue={lote.compradorNombre ?? ""}
          placeholder="—"
          className="col-span-2 rounded-lg border border-forest-800/20 bg-white px-2 py-1.5 text-xs"
        />

        <input
          name="compradorTelefono"
          defaultValue={lote.compradorTelefono ?? ""}
          placeholder="—"
          className="col-span-1 rounded-lg border border-forest-800/20 bg-white px-2 py-1.5 text-xs"
        />

        <input
          name="compradorCorreo"
          defaultValue={lote.compradorCorreo ?? ""}
          placeholder="—"
          className="col-span-1 rounded-lg border border-forest-800/20 bg-white px-2 py-1.5 text-xs"
        />

        <div className="text-xs text-forest-700/70">
          {formatoMoneda(lote.saldo)}
        </div>

        <button
          type="submit"
          className="justify-self-end rounded-full bg-forest-800 px-3 py-1.5 text-xs font-semibold text-sand-50 hover:bg-forest-700"
        >
          Guardar
        </button>
      </form>
    </td>
  );
}
