import Link from "next/link";
import { notFound } from "next/navigation";
import { getLotePorId } from "@/lib/data";
import {
  calcularEstadoCuenta,
  precioVentaEfectivo,
  CONCEPTO_PAGO_LABEL,
} from "@/lib/pagos";
import { PlanPagoForm } from "@/components/plan-pago-form";
import { formatoFecha, formatoMoneda } from "@/lib/financiamiento";
import { AsignarClienteForm } from "@/components/asignar-cliente-form";
import { VentaLoteForm } from "@/components/venta-lote-form";
import {
  actualizarPreciosLote,
  actualizarNotasLote,
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
  const lote = await getLotePorId(id);

  if (!lote) notFound();
  const config = lote.desarrollo;

  // Si ya existe un plan de pagos, es una venta a crédito aunque el
  // campo "tipoPago" no se haya actualizado todavía.
  const tipoPagoEfectivo = lote.numPagosTotal ? "CREDITO" : lote.tipoPago;
  const precioVenta = precioVentaEfectivo(
    {
      tipoPago: tipoPagoEfectivo,
      precioContado: lote.precioContado ? Number(lote.precioContado) : null,
      precioCredito: lote.precioCredito ? Number(lote.precioCredito) : null,
      precio: Number(lote.precio),
    },
    {
      precioContadoDefault: Number(config.precioContadoDefault),
      precioCreditoDefault: Number(config.precioCreditoDefault),
    }
  );

  const estado = calcularEstadoCuenta(
    {
      precio: precioVenta,
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
  const totalPagosRegistrados = lote.pagos.reduce(
    (acc, p) => acc + Number(p.monto),
    0
  );

  const comprobantes = lote.reservas.filter((r) => r.comprobantePago);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/admin/lotes"
          className="text-sm text-forest-700/70 hover:text-forest-900"
        >
          ← Volver a lotes
        </Link>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">
          {lote.cliente
            ? "Cliente"
            : lote.compradorNombre
              ? "Comprador (sin cuenta)"
              : `Lote ${lote.clave}`}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-forest-900">
          {lote.cliente?.nombre ?? lote.compradorNombre ?? `Lote ${lote.clave}`}
        </h1>
        <p className="mt-1 text-sm text-forest-700/70">
          {lote.estatus} ·{" "}
          {formatoMoneda(precioVenta, config.moneda)}
          {tipoPagoEfectivo === "CONTADO" ? " de contado" : " a crédito"}
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

      <div className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
          <Dato label="Fraccionamiento" valor={lote.desarrollo.nombre} />
          <Dato label="Manzana" valor={String(lote.manzana.numero)} />
          <Dato label="Lote" valor={String(lote.numero)} />
          <Dato
            label="Precio contratado"
            valor={formatoMoneda(precioVenta, config.moneda)}
          />
          <Dato
            label="Enganche"
            valor={formatoMoneda(Number(lote.anticipo), config.moneda)}
          />
          <Dato
            label="Total pagado"
            valor={formatoMoneda(estado.totalPagado, config.moneda)}
          />
          <Dato
            label="Saldo"
            valor={formatoMoneda(estado.saldoPendiente, config.moneda)}
          />
          <Dato
            label="Próximo pago"
            valor={
              estado.proximaFechaVencimiento
                ? `${formatoMoneda(estado.proximoMontoVencimiento ?? 0, config.moneda)} · ${formatoFecha(estado.proximaFechaVencimiento)}`
                : "—"
            }
          />
        </dl>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-forest-900/10 pt-4 text-xs text-forest-700/60">
          <span>Avance: {estado.porcentajePagado}%</span>
          <span>
            Cuotas pagadas:{" "}
            {lote.numPagosTotal
              ? `${estado.cuotasPagadas} / ${lote.numPagosTotal}`
              : estado.cuotasPagadas}
          </span>
        </div>
      </div>

      <section className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Venta
        </h2>
        <p className="mt-1 text-sm text-forest-700/70">
          El monto de venta y los pagos anteriores son la base del estado de
          cuenta de este lote — corrígelos aquí si algo no cuadra. Los pagos
          nuevos que vayan llegando de ahora en adelante regístralos abajo en
          &ldquo;Registrar pago&rdquo; para que quede su fecha y su recibo;
          esto de aquí es solo lo que ya se había pagado antes.
        </p>
        <div className="mt-4">
          <VentaLoteForm
            loteId={lote.id}
            precio={precioVenta}
            anticipo={Number(lote.anticipo)}
            totalPagosRegistrados={totalPagosRegistrados}
            moneda={config.moneda}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Datos de contacto
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
            <AsignarClienteForm
              loteId={lote.id}
              compradorNombre={lote.compradorNombre}
              compradorTelefono={lote.compradorTelefono}
              compradorCorreo={lote.compradorCorreo}
            />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Comprobantes
        </h2>
        {comprobantes.length === 0 ? (
          <p className="mt-3 text-sm text-forest-700/50">
            Sin comprobantes subidos por el cliente todavía.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {comprobantes.map((r) => (
              <a
                key={r.id}
                href={r.comprobantePago!}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-forest-900/10 bg-white p-3 text-center text-xs font-semibold text-gold-600 hover:underline"
              >
                {formatoFecha(r.createdAt)}
                <br />
                Ver comprobante
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Precio público de este lote
        </h2>
        <p className="mt-1 text-sm text-forest-700/70">
          Por defecto, este lote muestra el precio general del desarrollo
          ({formatoMoneda(Number(config.precioContadoDefault), config.moneda)}{" "}
          de contado /{" "}
          {formatoMoneda(Number(config.precioCreditoDefault), config.moneda)}{" "}
          a crédito). Déjalos vacíos para eso, o pon un precio distinto solo
          para este lote.
        </p>
        <form
          action={actualizarPreciosLote}
          className="mt-4 grid gap-3 sm:grid-cols-3"
        >
          <input type="hidden" name="loteId" value={lote.id} />
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Precio de contado (opcional)
            </label>
            <input
              name="precioContado"
              type="number"
              min={0}
              placeholder={String(Number(config.precioContadoDefault))}
              defaultValue={
                lote.precioContado ? Number(lote.precioContado) : ""
              }
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Precio a crédito (opcional)
            </label>
            <input
              name="precioCredito"
              type="number"
              min={0}
              placeholder={String(Number(config.precioCreditoDefault))}
              defaultValue={
                lote.precioCredito ? Number(lote.precioCredito) : ""
              }
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full rounded-full bg-forest-800 px-4 py-2 text-xs font-semibold text-sand-50 hover:bg-forest-700">
              Guardar precio
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Plan de pagos
        </h2>
        <p className="mt-1 text-sm text-forest-700/70">
          Para ventas a crédito. Se calcula sobre el precio a crédito de
          este lote.
        </p>
        <div className="mt-4">
          <PlanPagoForm
            loteId={lote.id}
            precioVenta={Number(
              lote.precioCredito ?? config.precioCreditoDefault
            )}
            anticipo={Number(lote.anticipo)}
            moneda={config.moneda}
            numPagosTotal={lote.numPagosTotal}
            montoPagoMensual={
              lote.montoPagoMensual ? Number(lote.montoPagoMensual) : null
            }
            fechaInicioPagos={toDateInputValue(lote.fechaInicioPagos)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Registrar pago
        </h2>
        <form
          action={registrarPago}
          className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-[1.1fr_1fr_1fr_1.3fr_1fr_auto]"
        >
          <input type="hidden" name="loteId" value={lote.id} />
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Concepto
            </label>
            <select
              name="concepto"
              defaultValue="MENSUALIDAD"
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            >
              <option value="APARTADO">Apartado</option>
              <option value="ENGANCHE">Enganche</option>
              <option value="MENSUALIDAD">Mensualidad</option>
              <option value="ABONO">Abono</option>
              <option value="LIQUIDACION">Liquidación</option>
            </select>
          </div>
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
          <div className="col-span-2 flex items-end sm:col-span-1">
            <button className="w-full rounded-full bg-gold-500 px-4 py-2.5 text-xs font-semibold text-forest-950 hover:bg-gold-400">
              Registrar
            </button>
          </div>
          <div className="col-span-2 sm:col-span-3 lg:col-span-6">
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
                <th className="px-4 py-2.5 font-semibold">Concepto</th>
                <th className="px-4 py-2.5 font-semibold">Cuota</th>
                <th className="px-4 py-2.5 font-semibold">Fecha</th>
                <th className="px-4 py-2.5 font-semibold">Monto</th>
                <th className="px-4 py-2.5 font-semibold">Método</th>
                <th className="px-4 py-2.5 font-semibold">Registró</th>
                <th className="px-4 py-2.5 font-semibold" />
                <th className="px-4 py-2.5 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {lote.pagos.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-4 text-forest-700/60">
                    Sin pagos registrados todavía.
                  </td>
                </tr>
              )}
              {lote.pagos.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-forest-900/5 last:border-0"
                >
                  <td className="px-4 py-2.5 font-medium text-forest-900">
                    {CONCEPTO_PAGO_LABEL[p.concepto] ?? p.concepto}
                  </td>
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
                    <a
                      href={`/api/recibos/${p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-gold-600 hover:underline"
                    >
                      Recibo
                    </a>
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

      <section className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Notas
        </h2>
        <p className="mt-1 text-sm text-forest-700/70">
          Notas internas sobre este lote o cliente, solo visibles para el
          equipo administrativo.
        </p>
        <form action={actualizarNotasLote} className="mt-4 space-y-3">
          <input type="hidden" name="loteId" value={lote.id} />
          <textarea
            name="notas"
            rows={3}
            defaultValue={lote.notas ?? ""}
            placeholder="Ej. Prefiere que le hablen por las tardes, pidió factura, etc."
            className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
          />
          <button className="rounded-full bg-forest-800 px-4 py-2 text-xs font-semibold text-sand-50 hover:bg-forest-700">
            Guardar notas
          </button>
        </form>
      </section>
    </div>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-forest-700/60">
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold text-forest-900">{valor}</dd>
    </div>
  );
}
