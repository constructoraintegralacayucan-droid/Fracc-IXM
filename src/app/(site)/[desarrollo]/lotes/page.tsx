import { notFound } from "next/navigation";
import { getManzanasConLotes, getDesarrolloBySlug } from "@/lib/data";
import { LoteMap } from "@/components/lote-map";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ desarrollo: string }>;
}) {
  const { desarrollo: slug } = await params;
  const config = await getDesarrolloBySlug(slug);
  return {
    title: `Mapa de lotes | ${config?.nombre ?? "Terranova"}`,
  };
}

export default async function LotesPage({
  params,
}: {
  params: Promise<{ desarrollo: string }>;
}) {
  const { desarrollo: slug } = await params;
  const config = await getDesarrolloBySlug(slug);
  if (!config) notFound();

  const manzanas = await getManzanasConLotes(config.id);

  const manzanasPlano = manzanas.map((m) => {
    const disponiblesEnManzana = m.lotes.filter(
      (l) => l.estatus === "DISPONIBLE"
    ).length;

    return {
      numero: m.numero,
      disponiblesEnManzana,
      lotes: m.lotes.map((l) => {
        const disponible = l.estatus === "DISPONIBLE";
        const precioContadoDefault = Number(config.precioContadoDefault);
        const precioContado = disponible
          ? Number(l.precioContado ?? precioContadoDefault)
          : null;
        const enPromocion =
          disponible && l.precioContado != null && precioContado !== null
            ? precioContado < precioContadoDefault
            : false;
        return {
          clave: l.clave,
          manzanaNumero: m.numero,
          disponible,
          numero: l.numero,
          estatus: l.estatus,
          precioContado,
          precioCredito: disponible
            ? Number(l.precioCredito ?? config.precioCreditoDefault)
            : null,
          precioContadoOriginal: enPromocion ? precioContadoDefault : null,
          enPromocion,
          areaM2: l.areaM2 ?? config.areaM2Default,
          frenteM: l.frenteM ?? config.frenteMDefault,
          fondoM: l.fondoM ?? config.fondoMDefault,
        };
      }),
    };
  });

  const plazosPublicos = config.plazosMeses.filter(
    (p) => p <= config.plazoMaxPublico
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
        Elige tu lote
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-forest-900">
        Lotes en {config.nombre}
      </h1>
      <p className="mt-3 max-w-2xl text-forest-700">
        Elige un lote disponible para ver su ficha completa, calcular tu
        mensualidad y apartarlo.
      </p>

      <div className="mt-10">
        <LoteMap
          manzanas={manzanasPlano}
          desarrolloSlug={slug}
          desarrolloNombre={config.nombre}
          config={{
            moneda: config.moneda,
            inicialMinimoPct: config.inicialMinimoPct,
            plazosMeses: plazosPublicos,
            plazoRecomendado: config.plazoRecomendado,
            tasaInteres: config.tasaInteres,
            reservaMinima: Number(config.reservaMinima),
            datosBancarios: config.datosBancarios,
            whatsapp: config.whatsapp ?? "",
          }}
        />
      </div>
    </div>
  );
}
