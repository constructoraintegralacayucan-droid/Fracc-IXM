import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { logoutAdmin } from "../actions";
import { LogoMark } from "@/components/logo";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-sand-100/60">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-forest-900/10 bg-forest-950 px-5 py-7 text-sand-100 sm:flex">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8 text-sand-50" />
          <p className="font-display text-xl font-bold uppercase tracking-[0.08em] text-sand-50">
            Terranova App
          </p>
        </div>
        <p className="mt-1.5 text-xs text-sand-400">
          by Constructora Integral Acayucan
        </p>

        <nav className="mt-10 flex flex-col gap-1 text-sm">
          <NavLink href="/admin/dashboard">Dashboard</NavLink>
          <NavLink href="/admin/lotes">Lotes</NavLink>
          <NavLink href="/admin/reservas">Reservas</NavLink>
          <NavLink href="/admin/testimonios">Testimonios</NavLink>
          <NavLink href="/admin/configuracion">Configuración</NavLink>
        </nav>

        <div className="mt-auto pt-8 text-xs text-sand-400">
          <p className="text-sand-200">{session.nombre}</p>
          <p className="mt-0.5">{session.email}</p>
          <form action={logoutAdmin} className="mt-4">
            <button className="rounded-full border border-sand-100/20 px-4 py-2 text-xs font-medium text-sand-100 hover:border-sand-100/50">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-forest-900/10 bg-sand-50 px-5 py-4 sm:hidden">
          <p className="font-display text-lg font-bold uppercase tracking-[0.06em] text-forest-900">
            Terranova App Admin
          </p>
          <form action={logoutAdmin}>
            <button className="text-xs font-medium text-forest-700 underline">
              Salir
            </button>
          </form>
        </header>
        <main className="p-5 sm:p-10">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3.5 py-2.5 text-sand-200 transition hover:bg-sand-50/10 hover:text-sand-50"
    >
      {children}
    </Link>
  );
}
