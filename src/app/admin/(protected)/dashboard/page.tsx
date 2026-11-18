import Link from "next/link";
import { getStats, getResumenPorManzana, resolverDesarrolloAdmin } from "@/lib/data";
import { formatoMoneda } from "@/lib/financiamiento";
import { AdminDesarrolloSwitcher } from "@/components/admin-desarrollo-switcher";

export const metadata = { title: "Dashboard | Terranova Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
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

  const [stats, resumen] = await Promise.all([
    getStats(actual.id),
    getResumenPorManzana(actual.id),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold text-forest-900">
            Dashboard de lotes
          </h1>
          <p className="mt-1 text-sm text-forest-700/70">
            {actual.nombre} — {actual.ubicacion}
          </p>
        </div>
        <AdminDesarrolloSwitcher desarrollos={desarrollos} actualSlug={actual.slug} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de lotes" value={String(stats.total)} />
        <StatCard
          label="Disponibles"
          value={String(stats.disponibles)}
          tone="forest"
        />
        <StatCard
          label="Apartados"
          value={String(stats.apartados)}
          tone="gold"
        />
        <StatCard label="Vendidos" value={String(stats.vendidos)} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Cobrado este mes"
          value={formatoMoneda(stats.cobradoEsteMes)}
          tone="forest"
        />
        <StatCard
          label="Saldo pendiente por cobrar"
          value={formatoMoneda(stats.saldoTotal)}
        />
        <StatCard
          label="Pagos próximos (7 días)"
          value={String(stats.pagosProximos)}
          tone="gold"
        />
        <StatCard
          label="Pagos atrasados"
          value={String(stats.pagosAtrasados)}
          tone={stats.pagosAtrasados > 0 ? "alerta" : undefined}
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <QuickLink href="/admin/desarrollos" label="Fraccionamientos" />
        <QuickLink href="/admin/lotes" label="Lotes" />
        <QuickLink href="/admin/reservas" label="Clientes y solicitudes" />
        <QuickLink href="/admin/colaboradores" label="Colaboradores" />
        <QuickLink href="/admin/cupones" label="Cupones" />
        <QuickLink href="/admin/administradores" label="Administradores" />
        <QuickLink href="/admin/configuracion" label="Promociones y precios" />
      </div>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-forest-900/10 bg-sand-50">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-forest-900/10 text-xs uppercase tracking-wide text-forest-700/70">
              <th className="px-5 py-3.5 font-semibold">Manzana</th>
              <th className="px-5 py-3.5 font-semibold">Lotes</th>
              <th className="px-5 py-3.5 font-semibold">Disponibles</th>
              <th className="px-5 py-3.5 font-semibold">Apartados</th>
              <th className="px-5 py-3.5 font-semibold">Vendidos</th>
              <th className="px-5 py-3.5 font-semibold">Monto total</th>
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
                <td className="px-5 py-3.5">{r.totalLotes}</td>
                <td className="px-5 py-3.5 text-forest-600">
                  {r.disponibles}
                </td>
                <td className="px-5 py-3.5 text-gold-600">{r.apartados}</td>
                <td className="px-5 py-3.5 text-forest-900/60">
                  {r.vendidos}
                </td>
                <td className="px-5 py-3.5">{formatoMoneda(r.montoTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "forest" | "gold" | "alerta";
}) {
  return (
    <div className="rounded-2xl border border-forest-900/10 bg-sand-50 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-forest-700/60">
        {label}
      </p>
      <p
        className={`mt-2 font-display text-2xl font-semibold ${
          tone === "forest"
            ? "text-forest-700"
            : tone === "gold"
              ? "text-gold-600"
              : tone === "alerta"
                ? "text-red-700"
                : "text-forest-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-forest-800/20 bg-sand-50 px-4 py-2 text-xs font-semibold text-forest-800 transition hover:border-forest-800/50 hover:bg-forest-800/5"
    >
      {label} →
    </Link>
  );
}
