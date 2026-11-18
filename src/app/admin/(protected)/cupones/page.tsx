import { prisma } from "@/lib/prisma";
import { actualizarEstadoCupon } from "@/app/admin/actions";
import { CrearCuponForm } from "@/components/crear-cupon-form";
import { TIPO_DESCUENTO_LABEL } from "@/lib/cupones";

export const metadata = { title: "Cupones | Terranova Admin" };
export const dynamic = "force-dynamic";

function formatoFecha(fecha: Date | null) {
  if (!fecha) return null;
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(fecha);
}

export default async function AdminCuponesPage() {
  const [cupones, desarrollos] = await Promise.all([
    prisma.cupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { desarrollo: true },
    }),
    prisma.desarrollo.findMany({ orderBy: { orden: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-forest-900">
        Cupones de descuento
      </h1>
      <p className="mt-1 text-sm text-forest-700/70">
        Crea códigos que tus clientes pueden escribir al apartar un lote
        (desde el sitio o con un colaborador) para ver un precio con
        descuento. Tú decides el precio final al confirmar la venta.
      </p>

      <div className="mt-8 rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Nuevo cupón
        </h2>
        <div className="mt-4">
          <CrearCuponForm
            desarrollos={desarrollos.map((d) => ({ id: d.id, nombre: d.nombre }))}
          />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {cupones.length === 0 && (
          <p className="text-sm text-forest-700/60">
            Todavía no has creado ningún cupón.
          </p>
        )}
        {cupones.map((c) => {
          const vigencia = [
            formatoFecha(c.fechaInicio) ? `desde ${formatoFecha(c.fechaInicio)}` : null,
            formatoFecha(c.fechaFin) ? `hasta ${formatoFecha(c.fechaFin)}` : null,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={c.id}
              className="flex flex-col gap-3 rounded-2xl border border-forest-900/10 bg-sand-50 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <p className="font-mono font-semibold text-forest-900">
                    {c.codigo}
                  </p>
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
                  {TIPO_DESCUENTO_LABEL[c.tipoDescuento]}:{" "}
                  {c.tipoDescuento === "PORCENTAJE"
                    ? `${Number(c.valor)}%`
                    : new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                        maximumFractionDigits: 0,
                      }).format(Number(c.valor))}
                  {c.descripcion ? ` · ${c.descripcion}` : ""}
                </p>
                <p className="mt-1 text-xs text-forest-700/60">
                  {c.desarrollo ? c.desarrollo.nombre : "Todos los fraccionamientos"}
                  {vigencia ? ` · ${vigencia}` : ""}
                  {" · "}
                  Usos: {c.usosActuales}
                  {c.usosMaximos != null ? ` / ${c.usosMaximos}` : ""}
                </p>
              </div>

              <form action={actualizarEstadoCupon}>
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
          );
        })}
      </div>
    </div>
  );
}
