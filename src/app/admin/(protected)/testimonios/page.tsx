import Link from "next/link";
import { getTestimoniosTodos, resolverDesarrolloAdmin } from "@/lib/data";
import { formatoFecha } from "@/lib/financiamiento";
import { aprobarTestimonio, rechazarTestimonio } from "@/app/admin/actions";
import { AdminDesarrolloSwitcher } from "@/components/admin-desarrollo-switcher";

export const metadata = { title: "Testimonios | Terranova Admin" };
export const dynamic = "force-dynamic";

const ESTATUS_BADGE: Record<string, string> = {
  PENDIENTE: "bg-gold-400/25 text-sand-900",
  APROBADO: "bg-forest-100 text-forest-800",
  RECHAZADO: "bg-stone-ink/10 text-stone-ink/60",
};

export default async function AdminTestimoniosPage({
  searchParams,
}: {
  searchParams: Promise<{ desarrollo?: string }>;
}) {
  const { desarrollo: slugParam } = await searchParams;
  const { desarrollos, actual } = await resolverDesarrolloAdmin(slugParam);

  if (!actual) {
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

  const testimonios = await getTestimoniosTodos(actual.id);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold text-forest-900">
            Testimonios
          </h1>
          <p className="mt-1 text-sm text-forest-700/70">
            {actual.nombre} — Apruébalos para que aparezcan en la página
            principal.
          </p>
        </div>
        <AdminDesarrolloSwitcher desarrollos={desarrollos} actualSlug={actual.slug} />
      </div>

      <div className="mt-8 space-y-3">
        {testimonios.length === 0 && (
          <p className="text-sm text-forest-700/60">
            Aún no hay testimonios enviados.
          </p>
        )}

        {testimonios.map((t) => (
          <div
            key={t.id}
            className="flex flex-col gap-3 rounded-2xl border border-forest-900/10 bg-sand-50 p-5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <p className="font-semibold text-forest-900">{t.nombre}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTATUS_BADGE[t.estatus]}`}
                >
                  {t.estatus}
                </span>
                <span className="text-gold-500">
                  {"★".repeat(t.calificacion)}
                </span>
              </div>
              <p className="mt-2 max-w-xl text-sm text-forest-800">
                “{t.mensaje}”
              </p>
              <p className="mt-2 text-xs text-forest-700/60">
                {t.cliente?.email} · {formatoFecha(t.createdAt)}
              </p>
            </div>

            {t.estatus !== "APROBADO" && (
              <div className="flex gap-2">
                <form action={aprobarTestimonio}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="rounded-full bg-forest-800 px-4 py-2 text-xs font-semibold text-sand-50 hover:bg-forest-700">
                    Aprobar
                  </button>
                </form>
                {t.estatus !== "RECHAZADO" && (
                  <form action={rechazarTestimonio}>
                    <input type="hidden" name="id" value={t.id} />
                    <button className="rounded-full border border-red-700/30 px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-50">
                      Rechazar
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
