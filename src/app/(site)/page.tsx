import Link from "next/link";
import {
  getProyectoConfig,
  getPrecioDesde,
  getGaleriaImagenes,
  getTestimoniosAprobados,
} from "@/lib/data";
import { formatoMoneda } from "@/lib/financiamiento";
import { GenericCalculator } from "@/components/generic-calculator";
import { CountdownBanner } from "@/components/countdown-banner";
import { HeroCarousel } from "@/components/hero-carousel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [config, precioDesde, imagenes, testimonios] = await Promise.all([
    getProyectoConfig(),
    getPrecioDesde(),
    getGaleriaImagenes(),
    getTestimoniosAprobados(),
  ]);

  const ofertaVigente =
    config.ofertaActiva &&
    config.ofertaFin &&
    config.ofertaFin.getTime() > Date.now();

  const plazosPublicos = config.plazosMeses.filter(
    (p) => p <= config.plazoMaxPublico
  );

  return (
    <>
      {ofertaVigente && (
        <CountdownBanner
          titulo={config.ofertaTitulo ?? "Oferta por tiempo limitado"}
          finISO={config.ofertaFin!.toISOString()}
        />
      )}

      <section className="relative overflow-hidden bg-forest-950 text-sand-50">
        {imagenes.length > 0 ? (
          <HeroCarousel imagenes={imagenes.map((i) => i.dataUrl)} />
        ) : (
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
        )}

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
          <p className="mt-4 max-w-xl font-display text-xl italic text-gold-400">
            Empieza hoy el patrimonio de tu familia.
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

          <div className="mt-16 flex flex-wrap items-center gap-6 border-t border-sand-100/15 pt-10">
            <span className="rounded-full bg-gold-400/20 px-4 py-2 text-sm font-semibold text-gold-400">
              Quedan pocos lotes disponibles
            </span>
            {precioDesde > 0 && (
              <div>
                <p className="font-display text-2xl font-semibold text-sand-50">
                  Desde {formatoMoneda(precioDesde, config.moneda)}
                </p>
                <p className="text-xs uppercase tracking-wide text-sand-300">
                  Precio por lote · en lotes seleccionados
                </p>
              </div>
            )}
          </div>

          {config.disclaimer && (
            <p className="mt-8 max-w-2xl text-xs leading-relaxed text-sand-400">
              {config.disclaimer}
            </p>
          )}
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

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <Feature
            title="Financiamiento directo"
            description="Sin intereses, sin buró de crédito. Tú eliges el plazo que mejor se acomode a tu bolsillo."
          />
          <Feature
            title="Ubicación estratégica"
            description="A 100 metros de la calle pavimentada y a 10 minutos del centro de Acayucan, con crecimiento urbano cercano."
          />
          <Feature
            title="Certeza legal"
            description="Escrituración y trámites acompañados de principio a fin, con expediente documentado por lote."
          />
        </div>
      </section>

      {testimonios.length > 0 && (
        <section className="bg-sand-100/70">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
                Testimonios
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-forest-900 sm:text-4xl">
                Lo que dicen nuestros compradores
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonios.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6"
                >
                  <div className="text-gold-500">
                    {"★".repeat(t.calificacion)}
                    {"☆".repeat(Math.max(0, 5 - t.calificacion))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-forest-800">
                    “{t.mensaje}”
                  </p>
                  <p className="mt-4 text-sm font-semibold text-forest-900">
                    {t.nombre}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        id="financiamiento"
        className={testimonios.length > 0 ? "" : "bg-sand-100/70"}
      >
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              Financiamiento
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-forest-900 sm:text-4xl">
              Simula tu plan de pagos
            </h2>
            <p className="mt-3 text-forest-700">
              Sin intereses, con enganche mínimo del {config.inicialMinimoPct}%
              y hasta {config.plazoMaxPublico} meses. Lo más recomendado por
              nuestros clientes: {config.plazoRecomendado} meses.
            </p>
          </div>

          <div className="mt-10">
            <GenericCalculator
              precioBase={precioDesde || 75000}
              inicialMinimoPct={config.inicialMinimoPct}
              plazos={plazosPublicos}
              plazoRecomendado={config.plazoRecomendado}
            />
          </div>
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
