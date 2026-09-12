import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-forest-800 sm:flex">
          <Link href="/" className="transition hover:text-gold-600">
            Inicio
          </Link>
          <Link href="/lotes" className="transition hover:text-gold-600">
            Mapa de lotes
          </Link>
          <a href="#financiamiento" className="transition hover:text-gold-600">
            Financiamiento
          </a>
          <a href="#contacto" className="transition hover:text-gold-600">
            Contacto
          </a>
        </nav>

        <Link
          href="/lotes"
          className="rounded-full bg-forest-800 px-5 py-2.5 text-sm font-semibold text-sand-50 shadow-sm transition hover:bg-forest-700"
        >
          Ver lotes disponibles
        </Link>
      </div>
    </header>
  );
}
