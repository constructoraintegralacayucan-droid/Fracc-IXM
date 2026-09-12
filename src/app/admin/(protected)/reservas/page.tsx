import Link from "next/link";
import { getReservasTodas, resolverDesarrolloAdmin } from "@/lib/data";
import { formatoFecha, formatoMoneda } from "@/lib/financiamiento";
import { confirmarReserva, cancelarReserva } from "@/app/admin/actions";
import { AdminDesarrolloSwitcher } from "@/components/admin-desarrollo-switcher";

export const metadata = { title: "Reservas | Terranova Admin" };
export const dynamic = "force-dynamic";

const ESTATUS_BADGE: Record<string, string> = {
  PENDIENTE: "bg-gold-400/25 text-sand-900",
  CONFIRMADA: "bg-forest-100 text-forest-800",
  CANCELADA: "bg-stone-ink/10 text-stone-ink/60",
  EXPIRADA: "bg-stone-ink/10 text-stone-ink/60",
};

export default async function AdminReservasPage({
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

  const reservas = await getReservasTodas(actual.id);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold text-forest-900">
            Solicitudes de apartado
          </h1>
          <p className="mt-1 text-sm text-forest-700/70">
            {actual.nombre} — Leads generados desde el sitio público.
            Confirma solo cuando ya hayas recibido el dinero del apartado:
            se registra como pago y se genera su recibo automáticamente
            (y se envía por correo si el cliente dejó uno).
          </p>
        </div>
        <AdminDesarrolloSwitcher desarrollos={desarrollos} actualSlug={actual.slug} />
      </div>

      <div className="mt-8 space-y-3">
        {reservas.length === 0 && (
          <p className="text-sm text-forest-700/60">
            Aún no hay solicitudes de apartado.
          </p>
        )}

        {reservas.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-3 rounded-2xl border border-forest-900/10 bg-sand-50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <p className="font-semibold text-forest-900">
                  Lote {r.lote.clave}
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTATUS_BADGE[r.estatus]}`}
                >
                  {r.estatus}
                </span>
              </div>
              <p className="mt-1 text-sm text-forest-800">
                {r.nombre} · {r.telefono}
                {r.correo ? ` · ${r.correo}` : ""}
              </p>
              <p className="mt-1 text-xs text-forest-700/60">
                Plan: {r.planTipoPago === "CONTADO" ? "Contado" : "Crédito"}
                {r.plazoMeses ? ` · ${r.plazoMeses} meses` : ""} · Monto
                apartado: {formatoMoneda(Number(r.montoReserva))} · Recibida
                el {formatoFecha(r.createdAt)}
              </p>
            </div>

            {r.estatus === "PENDIENTE" && (
              <div className="flex flex-wrap items-center gap-2">
                <form
                  action={confirmarReserva}
                  className="flex items-center gap-2"
                >
                  <input type="hidden" name="reservaId" value={r.id} />
                  <select
                    name="metodo"
                    defaultValue="TRANSFERENCIA"
                    title="¿Cómo recibiste el dinero del apartado?"
                    className="rounded-full border border-forest-800/20 bg-white px-3 py-2 text-xs"
                  >
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="DEPOSITO">Depósito</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TARJETA">Tarjeta</option>
                    <option value="OTRO">Otro</option>
                  </select>
                  <button className="rounded-full bg-forest-800 px-4 py-2 text-xs font-semibold text-sand-50 hover:bg-forest-700">
                    Confirmar
                  </button>
                </form>
                <form action={cancelarReserva}>
                  <input type="hidden" name="reservaId" value={r.id} />
                  <button className="rounded-full border border-red-700/30 px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-50">
                    Cancelar
                  </button>
                </form>
              </div>
            )}

            {r.estatus === "CONFIRMADA" && r.pagos[0] && (
              <a
                href={`/api/recibos/${r.pagos[0].id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gold-500/50 px-4 py-2 text-xs font-semibold text-gold-600 hover:bg-gold-400/10"
              >
                Ver recibo
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
