import { getManzanasConLotes, getProyectoConfig } from "@/lib/data";
import { LoteMap } from "@/components/lote-map";

export const metadata = {
  title: "Mapa de lotes | Terravista - Fraccionamiento Ixmegallo",
};

export const dynamic = "force-dynamic";

export default async function LotesPage() {
  const [manzanas, config] = await Promise.all([
    getManzanasConLotes(),
    getProyectoConfig(),
  ]);

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
        Lotes en Ixmegallo
      </h1>
      <p className="mt-3 max-w-2xl text-forest-700">
        Selecciona un lote disponible para ver su precio, simular tu
        financiamiento y enviar tu solicitud de apartado.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-forest-900/10 bg-sand-50">
        <div className="border-b border-forest-900/10 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/70">
            Plano de referencia
          </p>
          <p className="mt-0.5 text-xs text-forest-700/50">
            Solo para ubicarte (calles y manzanas reales). Para elegir y
            apartar tu lote, usa el mapa interactivo de abajo.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/plano-ixmegallo.svg"
          alt="Plano de referencia del Fraccionamiento Ixmegallo con manzanas y calles"
          className="max-h-[560px] w-full bg-sand-50 object-contain p-4"
        />
      </div>

      <div className="mt-10">
        <LoteMap
          manzanas={manzanasPlano}
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
