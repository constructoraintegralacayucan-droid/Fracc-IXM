import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDesarrolloBySlug,
  getPrecioDesde,
  getResumenHero,
  getGaleriaImagenes,
  getTestimoniosAprobados,
} from "@/lib/data";
import { formatoMoneda } from "@/lib/financiamiento";
import { GenericCalculator } from "@/components/generic-calculator";
import { CountdownBanner } from "@/components/countdown-banner";
import { HeroCarousel } from "@/components/hero-carousel";
import { esTemporadaNavidena } from "@/lib/temporada";

export const dynamic = "force-dynamic";

function formatoMonedaDecimal(valor: number, moneda = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 2,
  }).format(valor);
}

export default async function DesarrolloPage({
  params,
}: {
  params: Promise<{ desarrollo: string }>;
}) {
  const { desarrollo: slug } = await params;
  const config = await getDesarrolloBySlug(slug);
  if (!config) notFound();

  const [precioDesde, resumenHero, imagenes, testimonios] = await Promise.all([
    getPrecioDesde(config.id),
    getResumenHero(config.id),
    getGaleriaImagenes(config.id),
    getTestimoniosAprobados(config.id),
  ]);

  const ofertaVigente =
    config.ofertaActiva &&
    config.ofertaFin &&
    config.ofertaFin.getTime() > Date.now();

  const plazosPublicos = config.plazosMeses.filter(
    (p) => p <= config.plazoMaxPublico
  );

  const navidad = esTemporadaNavidena();

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

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          {navidad && (
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-sand-100/10 px-3.5 py-1.5 text-xs font-semibold text-sand-100">
              ❄️ Felices Fiestas de parte de Terranova
            </p>
          )}
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-400">
            {config.nombre}
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight text-sand-50 sm:text-6xl">
            Lotes en {config.ciudad}
          </h1>

          {resumenHero && resumenHero.precioDesde > 0 && (
            <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-1">
              <p className="font-display text-4xl font-bold text-gold-400 sm:text-5xl">
                Desde{" "}
                {formatoMonedaDecimal(resumenHero.precioPorM2, config.moneda)}
              </p>
              <p className="pb-1.5 text-sm font-medium text-sand-300">
                por m²
              </p>
            </div>
          )}

          <p className="mt-3 text-base text-sand-200 sm:text-lg">
            Terrenos de {resumenHero?.areaM2 ?? 200} m² · {resumenHero?.frenteM ?? 10}{" "}
            × {resumenHero?.fondoM ?? 20} m
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <span className="rounded-full bg-sand-100/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-sand-100">
              Financiamiento directo
            </span>
            {resumenHero && resumenHero.disponibles > 0 && (
              <span className="rounded-full bg-gold-400/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold-400">
                {resumenHero.disponibles} lotes disponibles
              </span>
            )}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={`/${slug}/lotes`}
              className="rounded-full bg-gold-500 px-8 py-4 text-sm font-bold uppercase tracking-wide text-forest-950 shadow-lg shadow-gold-500/20 transition hover:bg-gold-400"
            >
              Ver lotes disponibles
            </Link>
            <a
              href="#financiamiento"
              className="rounded-full border border-sand-100/30 px-7 py-4 text-sm font-semibold text-sand-50 transition hover:border-sand-100/60"
            >
              Calcular mensualidad
            </a>
          </div>

          {config.disclaimer && (
            <p className="mt-10 max-w-2xl text-xs leading-relaxed text-sand-400">
              {config.disclaimer}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
            Por qué {config.nombre}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-forest-900 sm:text-4xl">
            Un patrimonio pensado para crecer contigo
          </h2>
          {config.descripcion && (
            <p className="mt-4 text-forest-700">{config.descripcion}</p>
          )}
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

      <section className="bg-sand-100/70">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              Cómo comprar
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-forest-900 sm:text-4xl">
              Elige, cotiza y aparta en minutos
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <PasoCompra
              numero={1}
              title="Elige tu lote"
              description="Explora los lotes disponibles y revisa la ficha completa de tu favorito."
            />
            <PasoCompra
              numero={2}
              title="Cotiza tu plan"
              description={`Calcula tu enganche y mensualidad, sin intereses, a hasta ${config.plazoMaxPublico} meses.`}
            />
            <PasoCompra
              numero={3}
              title="Aparta en línea"
              description={`Envía tu solicitud y aparta con un anticipo. Tienes ${config.plazoReservaDias} día(s) para confirmarlo.`}
            />
            <PasoCompra
              numero={4}
              title="Firma y sigue tu cuenta"
              description="Te acompañamos en el proceso de compra-venta y das seguimiento a tus pagos desde tu cuenta."
            />
          </div>
        </div>
      </section>

      {testimonios.length > 0 && (
        <section>
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

      <section className="bg-sand-100/70">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              Preguntas frecuentes
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-forest-900 sm:text-4xl">
              Resolvemos tus dudas
            </h2>
          </div>

          <div className="mt-10 divide-y divide-forest-900/10 rounded-2xl border border-forest-900/10 bg-sand-50">
            <PreguntaFrecuente pregunta="¿Necesito enganche para apartar mi lote?">
              No. Para apartar solo necesitas cubrir el monto mínimo de
              apartado (
              {formatoMoneda(Number(config.reservaMinima), config.moneda)}).
              El enganche aplica únicamente si eliges pagar a crédito.
            </PreguntaFrecuente>
            <PreguntaFrecuente pregunta="¿El financiamiento tiene intereses?">
              {config.tasaInteres > 0
                ? `Manejamos una tasa del ${config.tasaInteres}% anual sobre el saldo financiado.`
                : "No. Es financiamiento directo sin intereses: el precio que ves es el precio final, sin importar el plazo que elijas."}
            </PreguntaFrecuente>
            <PreguntaFrecuente pregunta="¿En cuánto tiempo debo confirmar mi apartado?">
              {`Tienes ${config.plazoReservaDias} día(s) desde que envías tu solicitud para completar tu pago de apartado y que quede confirmado.`}
            </PreguntaFrecuente>
            <PreguntaFrecuente pregunta="¿Cómo puedo pagar?">
              Puedes pagar por transferencia o depósito bancario
              {config.whatsapp ? " y enviarnos tu comprobante por WhatsApp" : ""}.
              Consulta con nuestro equipo otras formas de pago disponibles
              para tu caso.
            </PreguntaFrecuente>
            <PreguntaFrecuente pregunta="¿Puedo dar seguimiento a mis pagos en línea?">
              Sí. Al asignarte una cuenta de cliente puedes entrar a tu
              portal para ver tu saldo, tu próximo pago y el historial
              completo de lo que has pagado, con recibo descargable en cada
              uno.
            </PreguntaFrecuente>
          </div>
        </div>
      </section>

      <section id="financiamiento">
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
            Elige tu lote, calcula tu mensualidad y envía tu solicitud de
            apartado en minutos.
          </p>
          <Link
            href={`/${slug}/lotes`}
            className="mt-8 inline-block rounded-full bg-gold-500 px-8 py-3.5 text-sm font-semibold text-forest-950 transition hover:bg-gold-400"
          >
            Ver lotes disponibles
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

function PasoCompra({
  numero,
  title,
  description,
}: {
  numero: number;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-sand-50 p-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 font-display text-sm font-bold text-forest-950">
        {numero}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-forest-900">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-forest-700/80">
        {description}
      </p>
    </div>
  );
}

function PreguntaFrecuente({
  pregunta,
  children,
}: {
  pregunta: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group px-6 py-4 first:rounded-t-2xl last:rounded-b-2xl open:bg-forest-900/[0.02]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-forest-900 marker:content-none">
        {pregunta}
        <span className="shrink-0 text-forest-700/50 transition group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-2.5 text-sm leading-relaxed text-forest-700/80">
        {children}
      </p>
    </details>
  );
}
