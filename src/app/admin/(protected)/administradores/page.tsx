import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { CrearAdminUsuarioForm } from "@/components/crear-admin-usuario-form";

export const metadata = { title: "Administradores | Terranova Admin" };
export const dynamic = "force-dynamic";

const ROL_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  VENDEDOR: "Vendedor",
};

export default async function AdminUsuariosPage() {
  const session = await requireAdmin();
  const usuarios = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-forest-900">
        Administradores
      </h1>
      <p className="mt-1 text-sm text-forest-700/70">
        Cuentas con acceso al panel de administración (
        <span className="whitespace-nowrap">/admin/login</span>). Dales
        acceso solo a personas de confianza: pueden ver y editar toda la
        información del negocio.
      </p>

      <div className="mt-8 rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Nuevo administrador
        </h2>
        <div className="mt-4">
          <CrearAdminUsuarioForm />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {usuarios.map((u) => (
          <div
            key={u.id}
            className="flex flex-col gap-3 rounded-2xl border border-forest-900/10 bg-sand-50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <p className="font-semibold text-forest-900">{u.nombre}</p>
                <span className="rounded-full bg-forest-100 px-2.5 py-0.5 text-xs font-semibold text-forest-800">
                  {ROL_LABEL[u.rol] ?? u.rol}
                </span>
                {u.id === session.sub && (
                  <span className="rounded-full bg-gold-400/25 px-2.5 py-0.5 text-xs font-semibold text-sand-900">
                    Tú
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-forest-700/70">{u.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
