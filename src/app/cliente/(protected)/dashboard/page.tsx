import { requireCliente } from "@/lib/require-cliente";
import {
  getLotesDeCliente,
  getNumerosLotesDeManzana,
  getProyectoConfig,
  getTestimonioDeCliente,
} from "@/lib/data";
import { calcularEstadoCuenta } from "@/lib/pagos";
import { formatoFecha, formatoMoneda } from "@/lib/financiamiento";
import { TestimonioForm } from "@/components/testimonio-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi lote | Terravista" };

export default async function ClienteDashboardPage() {
  const session = await requireCliente();
  const [lotes, config, testimonio] = await Promise.all([
    getLotesDeCliente(session.sub),
    getProyectoConfig(),
    getTestimonioDeCliente(session.sub),
  ]);

  if (lotes.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-forest-900/10 bg-sand-50 p-8 text-center">
        <p className="text-forest-800">
          Todavía no tienes ningún lote asignado a tu cuenta. Si crees que
          esto es un error, contacta a la administración del fraccionamiento.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
          Bienvenido
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest-900">
          {session.nombre}
        </h1>
      </div>

      {await Promise.all(
        lotes.map(async (lote) => {
          const numerosManzana = await getNumerosLotesDeManzana(
            lote.manzanaId
          );
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

          return (
            <section
              key={lote.id}
              className="overflow-hidden rounded-3xl border border-forest-900/10 bg-sand-50"
            >
              <div className="border-b border-forest-900/10 bg-forest-950 px-6 py-6 text-sand-50 sm:px-8">
                <p className="text-xs uppercase tracking-[0.2em] text-sand-300">
                  Manzana {lote.manzana.numero} · Lote {lote.numero}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold">
                  Clave {lote.clave}
                </h2>
              </div>

              <div className="px-6 py-6 sm:px-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-700/60">
                  Ubicación en la manzana
                </p>
                <div className="flex flex-wrap gap-2">
                  {numerosManzana.map((l) => {
                    const esMio = l.numero === lote.numero;
                    return (
                      <div
                        key={l.clave}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-semibold ${
                          esMio
                            ? "border-gold-500 bg-gold-400/25 text-forest-900 ring-2 ring-gold-500"
                            : "border-forest-900/10 bg-forest-900/5 text-forest-900/20"
                        }`}
                        title={esMio ? "Tu lote" : undefined}
                      >
                        {esMio ? l.numero : ""}
                      </div>
                    );
                  })}
                </div>

                {estado.enAtraso && (
                  <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-800">
                    <p className="font-semibold">
                      Tienes {estado.cuotasAtrasadas} cuota(s) atrasada(s)
                    </p>
                    <p className="mt-0.5">
                      Atraso de {estado.diasAtraso} día(s). Ponte al corriente
                      lo antes posible para evitar recargos según tu
                      contrato.
                    </p>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat
                    label="Precio del lote"
                    value={formatoMoneda(Number(lote.precio), config.moneda)}
                  />
                  <Stat
                    label="Total pagado"
                    value={formatoMoneda(estado.totalPagado, config.moneda)}
                    tone="forest"
                  />
                  <Stat
                    label="Saldo pendiente"
                    value={formatoMoneda(
                      estado.saldoPendiente,
                      config.moneda
                    )}
                  />
                  <Stat
                    label="Avance"
                    value={`${estado.porcentajePagado}%`}
                    tone="gold"
                  />
                </div>

                {estado.proximaFechaVencimiento && (
                  <p className="mt-4 text-sm text-forest-700">
                    Próxima cuota:{" "}
                    <strong>
                      {formatoMoneda(
                        estado.proximoMontoVencimiento ?? 0,
                        config.moneda
                      )}
                    </strong>{" "}
                    el {formatoFecha(estado.proximaFechaVencimiento)}
                  </p>
                )}

                {estado.calendario.length > 0 && (
                  <div className="mt-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-forest-700/60">
                      Estado de cuenta detallado
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-forest-900/10">
                      <table className="w-full min-w-[420px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-forest-900/10 text-xs uppercase text-forest-700/60">
                            <th className="px-4 py-2.5 font-semibold">
                              Cuota
                            </th>
                            <th className="px-4 py-2.5 font-semibold">
                              Vencimiento
                            </th>
                            <th className="px-4 py-2.5 font-semibold">
                              Monto
                            </th>
                            <th className="px-4 py-2.5 font-semibold">
                              Estatus
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {estado.calendario.map((c) => (
                            <tr
                              key={c.numero}
                              className="border-b border-forest-900/5 last:border-0"
                            >
                              <td className="px-4 py-2.5">{c.numero}</td>
                              <td className="px-4 py-2.5">
                                {formatoFecha(c.fechaVencimiento)}
                              </td>
                              <td className="px-4 py-2.5">
                                {formatoMoneda(c.monto, config.moneda)}
                              </td>
                              <td className="px-4 py-2.5">
                                {c.pagada ? (
                                  <span className="rounded-full bg-forest-100 px-2.5 py-0.5 text-xs font-semibold text-forest-800">
                                    Pagada
                                  </span>
                                ) : c.vencida ? (
                                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                                    Atrasada
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-sand-200 px-2.5 py-0.5 text-xs font-semibold text-forest-700">
                                    Pendiente
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })
      )}

      <section className="rounded-3xl border border-forest-900/10 bg-sand-50 p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-forest-900">
          Comparte tu experiencia
        </h2>
        {testimonio ? (
          <p className="mt-3 text-sm text-forest-700">
            {testimonio.estatus === "APROBADO" &&
              "¡Gracias! Tu testimonio ya está publicado en la página principal."}
            {testimonio.estatus === "PENDIENTE" &&
              "Gracias por tu testimonio. Está pendiente de revisión antes de publicarse."}
            {testimonio.estatus === "RECHAZADO" &&
              "Recibimos tu testimonio, pero no fue publicado."}
          </p>
        ) : (
          <div className="mt-4">
            <p className="mb-3 text-sm text-forest-700/70">
              Nos encantaría compartir tu experiencia con otros compradores.
            </p>
            <TestimonioForm />
          </div>
        )}
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
    <div className="rounded-xl border border-forest-900/10 bg-white p-4">
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
