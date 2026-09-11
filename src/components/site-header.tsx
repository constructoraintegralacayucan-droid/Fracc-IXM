import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-sand-100">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
            >
              <path
                d="M4 20V10.5L12 4l8 6.5V20"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 20v-6h6v6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-display text-xl font-semibold tracking-wide text-forest-900">
            Terravista
          </span>
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
