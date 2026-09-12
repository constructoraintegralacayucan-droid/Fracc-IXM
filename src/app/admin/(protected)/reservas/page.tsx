import { getReservasTodas } from "@/lib/data";
import { formatoFecha, formatoMoneda } from "@/lib/financiamiento";
import { confirmarReserva, cancelarReserva } from "@/app/admin/actions";

export const metadata = { title: "Reservas | Terranova Admin" };

const ESTATUS_BADGE: Record<string, string> = {
  PENDIENTE: "bg-gold-400/25 text-sand-900",
  CONFIRMADA: "bg-forest-100 text-forest-800",
  CANCELADA: "bg-stone-ink/10 text-stone-ink/60",
  EXPIRADA: "bg-stone-ink/10 text-stone-ink/60",
};

export default async function AdminReservasPage() {
  const reservas = await getReservasTodas();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-forest-900">
        Solicitudes de apartado
      </h1>
      <p className="mt-1 text-sm text-forest-700/70">
        Leads generados desde el sitio público. Confirma o cancela cada
        solicitud.
      </p>

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
              <div className="flex gap-2">
                <form action={confirmarReserva}>
                  <input type="hidden" name="reservaId" value={r.id} />
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
          </div>
        ))}
      </div>
    </div>
  );
}
