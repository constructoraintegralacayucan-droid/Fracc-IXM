import Link from "next/link";
import { notFound } from "next/navigation";
import { getLotePorId, getProyectoConfig } from "@/lib/data";
import { calcularEstadoCuenta } from "@/lib/pagos";
import { formatoFecha, formatoMoneda } from "@/lib/financiamiento";
import { AsignarClienteForm } from "@/components/asignar-cliente-form";
import {
  actualizarPlanPago,
  registrarPago,
  eliminarPago,
  desasignarCliente,
} from "@/app/admin/actions";

export const metadata = { title: "Detalle de lote | Terranova Admin" };

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default async function AdminLoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lote, config] = await Promise.all([
    getLotePorId(id),
    getProyectoConfig(),
  ]);

  if (!lote) notFound();

  const estado = calcularEstadoCuenta(
    {
      precio: Number(lote.precio),
      anticipo: Number(lote.anticipo),
      numPagosTotal: lote.numPagosTotal,
      montoPagoMensual: lote.montoPagoMensual
        ? Number(lote.montoPagoMensual)
        : null,
      fechaInicioPagos: lote.fechaInicioPagos,
    },
    lote.pagos.map((p) => ({
      monto: Number(p.monto),
      fecha: p.fecha,
      numeroCuota: p.numeroCuota,
    }))
  );

  const siguienteCuotaSugerida = estado.cuotasPagadas + 1;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/admin/lotes"
          className="text-sm text-forest-700/70 hover:text-forest-900"
        >
          ← Volver a lotes
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-forest-900">
          Lote {lote.clave}
        </h1>
        <p className="mt-1 text-sm text-forest-700/70">
          Manzana {lote.manzana.numero} · {formatoMoneda(Number(lote.precio), config.moneda)} ·{" "}
          {lote.estatus}
        </p>
      </div>

      {estado.enAtraso && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p className="font-semibold">
            {estado.cuotasAtrasadas} cuota(s) atrasada(s) — {estado.diasAtraso}{" "}
            día(s) de atraso
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total pagado" value={formatoMoneda(estado.totalPagado, config.moneda)} tone="forest" />
        <Stat label="Saldo pendiente" value={formatoMoneda(estado.saldoPendiente, config.moneda)} />
        <Stat label="Avance" value={`${estado.porcentajePagado}%`} tone="gold" />
        <Stat
          label="Cuotas pagadas"
          value={
            lote.numPagosTotal
              ? `${estado.cuotasPagadas} / ${lote.numPagosTotal}`
              : String(estado.cuotasPagadas)
          }
        />
      </div>

      <section className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Cliente
        </h2>

        {lote.cliente ? (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white p-4">
            <div className="text-sm">
              <p className="font-semibold text-forest-900">
                {lote.cliente.nombre}
              </p>
              <p className="text-forest-700/70">{lote.cliente.email}</p>
              {lote.cliente.telefono && (
                <p className="text-forest-700/70">{lote.cliente.telefono}</p>
              )}
            </div>
            <form action={desasignarCliente}>
              <input type="hidden" name="loteId" value={lote.id} />
              <button className="rounded-full border border-red-700/30 px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-50">
                Quitar asignación
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-4">
            <p className="mb-3 text-sm text-forest-700/70">
              Este lote no tiene una cuenta de cliente asignada.
            </p>
            <AsignarClienteForm loteId={lote.id} />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Plan de pagos
        </h2>
        <form
          action={actualizarPlanPago}
          className="mt-4 grid gap-3 sm:grid-cols-3"
        >
          <input type="hidden" name="loteId" value={lote.id} />
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Número de pagos
            </label>
            <input
              name="numPagosTotal"
              type="number"
              min={1}
              defaultValue={lote.numPagosTotal ?? ""}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Monto por pago
            </label>
            <input
              name="montoPagoMensual"
              type="number"
              min={0}
              step="0.01"
              defaultValue={
                lote.montoPagoMensual ? Number(lote.montoPagoMensual) : ""
              }
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Fecha de inicio
            </label>
            <input
              name="fechaInicioPagos"
              type="date"
              defaultValue={toDateInputValue(lote.fechaInicioPagos)}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div className="sm:col-span-3">
            <button className="rounded-full bg-forest-800 px-4 py-2 text-xs font-semibold text-sand-50 hover:bg-forest-700">
              Guardar plan
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Registrar pago
        </h2>
        <form
          action={registrarPago}
          className="mt-4 grid gap-3 sm:grid-cols-5"
        >
          <input type="hidden" name="loteId" value={lote.id} />
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Cuota #
            </label>
            <input
              name="numeroCuota"
              type="number"
              min={1}
              defaultValue={siguienteCuotaSugerida}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Monto
            </label>
            <input
              name="monto"
              type="number"
              min={0}
              step="0.01"
              required
              defaultValue={
                lote.montoPagoMensual ? Number(lote.montoPagoMensual) : ""
              }
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Fecha
            </label>
            <input
              name="fecha"
              type="date"
              defaultValue={toDateInputValue(new Date())}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Método
            </label>
            <select
              name="metodo"
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="DEPOSITO">Depósito</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full rounded-full bg-gold-500 px-4 py-2.5 text-xs font-semibold text-forest-950 hover:bg-gold-400">
              Registrar
            </button>
          </div>
          <div className="sm:col-span-5">
            <input
              name="notas"
              placeholder="Notas (opcional)"
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
        </form>

        <div className="mt-6 overflow-x-auto rounded-xl border border-forest-900/10">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr className="border-b border-forest-900/10 text-xs uppercase text-forest-700/60">
                <th className="px-4 py-2.5 font-semibold">Cuota</th>
                <th className="px-4 py-2.5 font-semibold">Fecha</th>
                <th className="px-4 py-2.5 font-semibold">Monto</th>
                <th className="px-4 py-2.5 font-semibold">Método</th>
                <th className="px-4 py-2.5 font-semibold">Registró</th>
                <th className="px-4 py-2.5 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {lote.pagos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-forest-700/60">
                    Sin pagos registrados todavía.
                  </td>
                </tr>
              )}
              {lote.pagos.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-forest-900/5 last:border-0"
                >
                  <td className="px-4 py-2.5">{p.numeroCuota ?? "—"}</td>
                  <td className="px-4 py-2.5">{formatoFecha(p.fecha)}</td>
                  <td className="px-4 py-2.5">
                    {formatoMoneda(Number(p.monto), config.moneda)}
                  </td>
                  <td className="px-4 py-2.5">{p.metodo}</td>
                  <td className="px-4 py-2.5 text-forest-700/60">
                    {p.registradoPor ?? "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <form action={eliminarPago}>
                      <input type="hidden" name="pagoId" value={p.id} />
                      <input type="hidden" name="loteId" value={lote.id} />
                      <button className="text-xs font-medium text-red-700 hover:underline">
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "forest" | "gold";
}) {
  return (
    <div className="rounded-xl border border-forest-900/10 bg-sand-50 p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-forest-700/60">
        {label}
      </p>
      <p
        className={`mt-1.5 font-display text-xl font-semibold ${
          tone === "forest"
            ? "text-forest-700"
            : tone === "gold"
              ? "text-gold-600"
              : "text-forest-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
