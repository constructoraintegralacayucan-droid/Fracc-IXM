import { getStats, getResumenPorManzana } from "@/lib/data";
import { formatoMoneda } from "@/lib/financiamiento";

export const metadata = { title: "Dashboard | Terravista Admin" };

export default async function AdminDashboardPage() {
  const [stats, resumen] = await Promise.all([
    getStats(),
    getResumenPorManzana(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-forest-900">
        Dashboard de lotes
      </h1>
      <p className="mt-1 text-sm text-forest-700/70">
        Fraccionamiento Ixmegallo — Acayucan, Veracruz
      </p>

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

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Monto total del inventario"
          value={formatoMoneda(stats.montoTotal)}
        />
        <StatCard
          label="Total anticipos recibidos"
          value={formatoMoneda(stats.anticipoTotal)}
        />
        <StatCard
          label="Saldo pendiente total"
          value={formatoMoneda(stats.saldoTotal)}
        />
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
  tone?: "forest" | "gold";
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
              : "text-forest-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
