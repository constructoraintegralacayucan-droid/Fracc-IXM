import Link from "next/link";
import { requireCliente } from "@/lib/require-cliente";
import { logoutCliente } from "../actions";
import { Logo } from "@/components/logo";

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireCliente();

  return (
    <div className="min-h-screen bg-sand-100/60">
      <header className="flex items-center justify-between border-b border-forest-900/10 bg-sand-50 px-5 py-4 sm:px-10">
        <Link href="/">
          <Logo subtitle={false} markClassName="h-8 w-8 text-forest-900" />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-forest-700/70 sm:inline">
            {session.nombre}
          </span>
          <form action={logoutCliente}>
            <button className="rounded-full border border-forest-800/20 px-4 py-2 text-xs font-medium text-forest-800 hover:border-forest-800/50">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="p-5 sm:p-10">{children}</main>
    </div>
  );
}
