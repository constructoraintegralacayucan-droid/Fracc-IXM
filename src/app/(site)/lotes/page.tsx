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

  const manzanasPlano = manzanas.map((m) => ({
    numero: m.numero,
    lotes: m.lotes.map((l) => ({
      clave: l.clave,
      numero: l.numero,
      manzanaNumero: m.numero,
      precio: Number(l.precio),
      estatus: l.estatus,
    })),
  }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
        Mapa interactivo
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-forest-900">
        Lotes disponibles en Ixmegallo
      </h1>
      <p className="mt-3 max-w-2xl text-forest-700">
        Selecciona un lote para ver su precio, simular tu financiamiento y
        enviar tu solicitud de apartado.
      </p>

      <div className="mt-10">
        <LoteMap
          manzanas={manzanasPlano}
          config={{
            moneda: config.moneda,
            inicialMinimoPct: config.inicialMinimoPct,
            plazosMeses: config.plazosMeses,
            tasaInteres: config.tasaInteres,
            reservaMinima: Number(config.reservaMinima),
          }}
        />
      </div>
    </div>
  );
}
