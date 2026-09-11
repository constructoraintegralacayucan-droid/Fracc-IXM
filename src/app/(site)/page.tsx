import Link from "next/link";
import { getProyectoConfig, getStats, getResumenPorManzana } from "@/lib/data";
import { formatoMoneda } from "@/lib/financiamiento";
import { GenericCalculator } from "@/components/generic-calculator";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [config, stats, resumen] = await Promise.all([
    getProyectoConfig(),
    getStats(),
    getResumenPorManzana(),
  ]);

  const precioPromedio = Math.round(stats.montoTotal / stats.total);

  return (
    <>
      <section className="relative overflow-hidden bg-forest-950 text-sand-50">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
          viewBox="0 0 800 500"
          preserveAspectRatio="none"
          fill="none"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <path
              key={i}
              d={`M-50 ${60 + i * 50} C 200 ${10 + i * 50}, 500 ${
                110 + i * 50
              }, 850 ${40 + i * 50}`}
              stroke="#cba86a"
              strokeWidth="1"
            />
          ))}
        </svg>

        <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-400">
            Acayucan · Veracruz
          </p>
          <h1 className="mt-5 max-w-2xl font-display text-5xl font-semibold leading-[1.05] text-sand-50 sm:text-6xl">
            {config.nombre}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-sand-200">
            {config.descripcion}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/lotes"
              className="rounded-full bg-gold-500 px-7 py-3.5 text-sm font-semibold text-forest-950 shadow-lg shadow-gold-500/20 transition hover:bg-gold-400"
            >
              Explorar mapa de lotes
            </Link>
            <a
              href="#financiamiento"
              className="rounded-full border border-sand-100/30 px-7 py-3.5 text-sm font-semibold text-sand-50 transition hover:border-sand-100/60"
            >
              Simular financiamiento
            </a>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 border-t border-sand-100/15 pt-10 sm:grid-cols-4">
            <Stat label="Lotes totales" value={String(stats.total)} />
            <Stat label="Manzanas" value={String(resumen.length)} />
            <Stat label="Disponibles" value={String(stats.disponibles)} />
            <Stat
              label="Desde"
              value={formatoMoneda(
                Math.min(...resumen.map(() => precioPromedio))
              )}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
            Por qué Ixmegallo
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-forest-900 sm:text-4xl">
            Un patrimonio pensado para crecer contigo
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Feature
            title="Financiamiento directo"
            description="Sin intereses, sin buró de crédito. Tú eliges el plazo que mejor se acomode a tu bolsillo."
          />
          <Feature
            title="Ubicación estratégica"
            description="A minutos del centro de Acayucan, con vías de acceso pavimentadas y crecimiento urbano cercano."
          />
          <Feature
            title="Áreas comunes"
            description="Club house, alberca, canchas deportivas y parque central para toda la familia."
          />
          <Feature
            title="Certeza legal"
            description="Escrituración y trámites acompañados de principio a fin, con expediente documentado por lote."
          />
        </div>
      </section>

      <section className="bg-sand-100/70">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
                Disponibilidad
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-forest-900 sm:text-4xl">
                Avance por manzana
              </h2>
            </div>
            <Link
              href="/lotes"
              className="text-sm font-semibold text-forest-800 underline decoration-gold-500 decoration-2 underline-offset-4"
            >
              Ver mapa interactivo completo →
            </Link>
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-forest-900/10 bg-sand-50">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-forest-900/10 text-xs uppercase tracking-wide text-forest-700/70">
                  <th className="px-5 py-3.5 font-semibold">Manzana</th>
                  <th className="px-5 py-3.5 font-semibold">Lotes</th>
                  <th className="px-5 py-3.5 font-semibold">Disponibles</th>
                  <th className="px-5 py-3.5 font-semibold">Apartados</th>
                  <th className="px-5 py-3.5 font-semibold">Vendidos</th>
                </tr>
              </thead>
              <tbody>
                {resumen.map((r) => (
                  <tr
                    key={r.manzana}
                    className="border-b border-forest-900/5 last:border-0"
                  >
                    <td className="px-5 py-3.5 font-medium text-forest-900">
                      Manzana {r.manzana}
                    </td>
                    <td className="px-5 py-3.5 text-forest-800">
                      {r.totalLotes}
                    </td>
                    <td className="px-5 py-3.5 text-forest-600">
                      {r.disponibles}
                    </td>
                    <td className="px-5 py-3.5 text-gold-600">
                      {r.apartados}
                    </td>
                    <td className="px-5 py-3.5 text-forest-900/60">
                      {r.vendidos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="financiamiento" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
            Financiamiento
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-forest-900 sm:text-4xl">
            Simula tu plan de pagos
          </h2>
          <p className="mt-3 text-forest-700">
            Ajusta el precio, el enganche y el plazo para conocer tu
            mensualidad estimada. Sin intereses, con inicial mínima del{" "}
            {config.inicialMinimoPct}%.
          </p>
        </div>

        <div className="mt-10">
          <GenericCalculator
            precioBase={precioPromedio}
            inicialMinimoPct={config.inicialMinimoPct}
            plazos={config.plazosMeses}
          />
        </div>
      </section>

      <section className="bg-forest-900">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <h2 className="font-display text-3xl font-semibold text-sand-50 sm:text-4xl">
            Aparta tu lote hoy mismo
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sand-300">
            Elige tu lote en el mapa interactivo, arma tu plan de pagos y
            envía tu solicitud de apartado en minutos.
          </p>
          <Link
            href="/lotes"
            className="mt-8 inline-block rounded-full bg-gold-500 px-8 py-3.5 text-sm font-semibold text-forest-950 transition hover:bg-gold-400"
          >
            Ir al mapa de lotes
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-semibold text-sand-50">
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wide text-sand-300">
        {label}
      </p>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-forest-100 text-forest-700">
        <span className="h-2 w-2 rounded-full bg-gold-500" />
      </div>
      <h3 className="font-display text-lg font-semibold text-forest-900">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-forest-700/80">
        {description}
      </p>
    </div>
  );
}
