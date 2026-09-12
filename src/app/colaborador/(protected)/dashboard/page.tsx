import Link from "next/link";
import { requireColaborador } from "@/lib/require-colaborador";
import { getDesarrollos, getManzanasConLotes } from "@/lib/data";
import { AdminDesarrolloSwitcher } from "@/components/admin-desarrollo-switcher";
import { ColaboradorSolicitudPanel } from "@/components/colaborador-solicitud-panel";

export const metadata = { title: "Panel de colaborador | Terranova" };
export const dynamic = "force-dynamic";

export default async function ColaboradorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ desarrollo?: string }>;
}) {
  const session = await requireColaborador();
  const { desarrollo: slugParam } = await searchParams;

  const desarrollos = await getDesarrollos();
  if (desarrollos.length === 0) {
    return (
      <p className="text-sm text-forest-700/70">
        Todavía no hay ningún desarrollo publicado.
      </p>
    );
  }

  const actual =
    desarrollos.find((d) => d.slug === slugParam) ?? desarrollos[0];
  const manzanas = await getManzanasConLotes(actual.id);

  const manzanasPlano = manzanas.map((m) => ({
    numero: m.numero,
    lotes: m.lotes.map((l) => ({
      clave: l.clave,
      numero: l.numero,
      disponible: l.estatus === "DISPONIBLE",
    })),
  }));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
            Bienvenido
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-forest-900">
            {session.nombre}
          </h1>
          <p className="mt-1 text-sm text-forest-700/70">
            {actual.nombre} — Elige un lote disponible y levanta la solicitud
            de apartado con los datos del comprador. El administrador la
            revisará antes de confirmarla.
          </p>
        </div>
        <AdminDesarrolloSwitcher
          desarrollos={desarrollos.map((d) => ({
            slug: d.slug,
            nombre: d.nombre,
            activo: d.activo,
          }))}
          actualSlug={actual.slug}
        />
      </div>

      <div className="mt-8">
        <ColaboradorSolicitudPanel
          manzanas={manzanasPlano}
          desarrolloSlug={actual.slug}
          reservaMinima={Number(actual.reservaMinima)}
          moneda={actual.moneda}
        />
      </div>

      <p className="mt-8 text-xs text-forest-700/50">
        ¿Tienes dudas sobre una solicitud?{" "}
        <Link href="/" className="underline">
          Ver sitio público
        </Link>
      </p>
    </div>
  );
}
