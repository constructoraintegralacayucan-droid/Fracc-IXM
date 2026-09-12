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
        return {
          clave: l.clave,
          manzanaNumero: m.numero,
          disponible,
          numero: disponible ? l.numero : null,
          precio: disponible ? Number(l.precio) : null,
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
        Mapa interactivo
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-forest-900">
        Lotes en {config.nombre}
      </h1>
      <p className="mt-3 max-w-2xl text-forest-700">
        Selecciona un lote disponible para ver su precio, simular tu
        financiamiento y enviar tu solicitud de apartado.
      </p>

      <div className="mt-10">
        <LoteMap
          manzanas={manzanasPlano}
          desarrolloSlug={slug}
          config={{
            moneda: config.moneda,
            inicialMinimoPct: config.inicialMinimoPct,
            plazosMeses: plazosPublicos,
            plazoRecomendado: config.plazoRecomendado,
            tasaInteres: config.tasaInteres,
            reservaMinima: Number(config.reservaMinima),
          }}
        />
      </div>
    </div>
  );
}
