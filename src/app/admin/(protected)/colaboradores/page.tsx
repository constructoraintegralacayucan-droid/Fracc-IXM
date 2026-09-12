import { prisma } from "@/lib/prisma";
import { actualizarEstadoColaborador } from "@/app/admin/actions";
import { CrearColaboradorForm } from "@/components/crear-colaborador-form";

export const metadata = { title: "Colaboradores | Terranova Admin" };
export const dynamic = "force-dynamic";

export default async function AdminColaboradoresPage() {
  const colaboradores = await prisma.colaborador.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-forest-900">
        Colaboradores
      </h1>
      <p className="mt-1 text-sm text-forest-700/70">
        Da acceso a tu equipo de ventas para que levanten solicitudes de
        apartado desde{" "}
        <span className="whitespace-nowrap">/colaborador/login</span>. Tú
        sigues aprobando cada solicitud desde Reservas.
      </p>

      <div className="mt-8 rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Nuevo colaborador
        </h2>
        <div className="mt-4">
          <CrearColaboradorForm />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {colaboradores.length === 0 && (
          <p className="text-sm text-forest-700/60">
            Todavía no has agregado ningún colaborador.
          </p>
        )}
        {colaboradores.map((c) => (
          <div
            key={c.id}
            className="flex flex-col gap-3 rounded-2xl border border-forest-900/10 bg-sand-50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <p className="font-semibold text-forest-900">{c.nombre}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    c.activo
                      ? "bg-forest-100 text-forest-800"
                      : "bg-stone-ink/10 text-stone-ink/60"
                  }`}
                >
                  {c.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <p className="mt-1 text-sm text-forest-700/70">
                {c.email}
                {c.telefono ? ` · ${c.telefono}` : ""}
              </p>
            </div>

            <form action={actualizarEstadoColaborador}>
              <input type="hidden" name="id" value={c.id} />
              {!c.activo && <input type="hidden" name="activo" value="on" />}
              <button
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  c.activo
                    ? "border border-red-700/30 text-red-800 hover:bg-red-50"
                    : "bg-forest-800 text-sand-50 hover:bg-forest-700"
                }`}
              >
                {c.activo ? "Desactivar" : "Activar"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
