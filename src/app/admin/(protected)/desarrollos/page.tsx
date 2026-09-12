import Link from "next/link";
import { getDesarrollosTodos } from "@/lib/data";
import { actualizarEstadoDesarrollo } from "@/app/admin/actions";
import { CrearDesarrolloForm } from "@/components/crear-desarrollo-form";

export const metadata = { title: "Desarrollos | Terranova Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDesarrollosPage() {
  const desarrollos = await getDesarrollosTodos();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-forest-900">
        Desarrollos
      </h1>
      <p className="mt-1 text-sm text-forest-700/70">
        Cada desarrollo tiene su propia página pública, mapa de lotes,
        financiamiento y configuración. Actívalo cuando esté listo para
        publicarse en Terranova.
      </p>

      <div className="mt-8 rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Nuevo desarrollo
        </h2>
        <div className="mt-4">
          <CrearDesarrolloForm />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {desarrollos.map((d) => (
          <div
            key={d.id}
            className="flex flex-col gap-3 rounded-2xl border border-forest-900/10 bg-sand-50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <p className="font-semibold text-forest-900">{d.nombre}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    d.activo
                      ? "bg-forest-100 text-forest-800"
                      : "bg-stone-ink/10 text-stone-ink/60"
                  }`}
                >
                  {d.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <p className="mt-1 text-sm text-forest-700/70">
                {d.ubicacion}
              </p>
              <p className="mt-1 text-xs text-forest-700/50">
                /{d.slug}
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/admin/configuracion?desarrollo=${d.slug}`}
                className="rounded-full border border-gold-500/50 px-4 py-2 text-xs font-semibold text-gold-600 hover:bg-gold-400/10"
              >
                Configurar
              </Link>
              <form action={actualizarEstadoDesarrollo}>
                <input type="hidden" name="id" value={d.id} />
                {!d.activo && (
                  <input type="hidden" name="activo" value="on" />
                )}
                <button
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    d.activo
                      ? "border border-red-700/30 text-red-800 hover:bg-red-50"
                      : "bg-forest-800 text-sand-50 hover:bg-forest-700"
                  }`}
                >
                  {d.activo ? "Desactivar" : "Activar"}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
