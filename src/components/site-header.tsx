import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteHeader({
  desarrollo,
}: {
  desarrollo?: { slug: string; nombre: string };
} = {}) {
  const base = desarrollo ? `/${desarrollo.slug}` : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href={base}>
          <Logo />
        </Link>

        {desarrollo ? (
          <nav className="hidden items-center gap-8 text-sm font-medium text-forest-800 sm:flex">
            <Link href={base} className="transition hover:text-gold-600">
              Inicio
            </Link>
            <Link
              href={`${base}/lotes`}
              className="transition hover:text-gold-600"
            >
              Mapa de lotes
            </Link>
            <a
              href="#financiamiento"
              className="transition hover:text-gold-600"
            >
              Financiamiento
            </a>
            <a href="#contacto" className="transition hover:text-gold-600">
              Contacto
            </a>
          </nav>
        ) : (
          <nav className="hidden items-center gap-8 text-sm font-medium text-forest-800 sm:flex">
            <a
              href="#desarrollos"
              className="transition hover:text-gold-600"
            >
              Nuestros desarrollos
            </a>
          </nav>
        )}

        <Link
          href={desarrollo ? `${base}/lotes` : "#desarrollos"}
          className="rounded-full bg-forest-800 px-5 py-2.5 text-sm font-semibold text-sand-50 shadow-sm transition hover:bg-forest-700"
        >
          {desarrollo ? "Ver lotes disponibles" : "Elige tu desarrollo"}
        </Link>
      </div>
    </header>
  );
}
