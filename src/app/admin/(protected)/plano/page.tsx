import Link from "next/link";
import { resolverDesarrolloAdmin, getLotesConManzana } from "@/lib/data";
import { AdminDesarrolloSwitcher } from "@/components/admin-desarrollo-switcher";
import { PlanoUploader } from "@/components/plano-uploader";
import { PlanoPinEditor } from "@/components/plano-pin-editor";

export const metadata = { title: "Plano | Terranova Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPlanoPage({
  searchParams,
}: {
  searchParams: Promise<{ desarrollo?: string }>;
}) {
  const { desarrollo: slugParam } = await searchParams;
  const { desarrollos, actual: config } = await resolverDesarrolloAdmin(
    slugParam
  );

  if (!config) {
    return (
      <p className="text-sm text-forest-700/70">
        Todavía no hay ningún desarrollo. Crea uno en{" "}
        <Link href="/admin/desarrollos" className="underline">
          Desarrollos
        </Link>
        .
      </p>
    );
  }

  const lotes = await getLotesConManzana(config.id);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold text-forest-900">
            Plano interactivo
          </h1>
          <p className="mt-1 text-sm text-forest-700/70">
            {config.nombre} — Sube el plano real y marca dónde está cada lote
            para que se vea en el sitio como mapa.
          </p>
        </div>
        <AdminDesarrolloSwitcher
          desarrollos={desarrollos}
          actualSlug={config.slug}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Imagen del plano
        </h2>
        <div className="mt-4">
          <PlanoUploader
            desarrolloId={config.id}
            planoActual={config.planoImagen}
          />
        </div>
      </div>

      {config.planoImagen && (
        <div className="mt-8 rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
          <h2 className="font-display text-lg font-semibold text-forest-900">
            Ubicar lotes sobre el plano
          </h2>
          <p className="mt-1 text-sm text-forest-700/70">
            Selecciona un lote de la lista (o da clic sobre un pin para
            moverlo) y luego da clic en el plano, en el lugar exacto de ese
            lote. Al guardar, avanza automáticamente al siguiente lote sin
            ubicar.
          </p>
          <div className="mt-4">
            <PlanoPinEditor
              planoImagen={config.planoImagen}
              lotesIniciales={lotes.map((l) => ({
                id: l.id,
                clave: l.clave,
                numero: l.numero,
                manzanaNumero: l.manzana.numero,
                estatus: l.estatus,
                planoX: l.planoX,
                planoY: l.planoY,
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
