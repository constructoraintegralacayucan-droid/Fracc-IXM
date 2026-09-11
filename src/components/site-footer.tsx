import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      id="contacto"
      className="mt-24 border-t border-forest-900/10 bg-forest-950 text-sand-200"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-semibold text-sand-50">
            Terravista
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-sand-300">
            Fraccionamiento Ixmegallo — Acayucan, Veracruz. Lotes
            residenciales con financiamiento directo y áreas comunes de
            primer nivel.
          </p>
        </div>

        <div className="text-sm text-sand-300">
          <p className="mb-3 font-semibold text-sand-100">Contacto</p>
          <p>Acayucan, Veracruz, México</p>
          <p className="mt-1">ventas@terravista.mx</p>
          <p className="mt-1">+52 924 000 0000</p>
        </div>

        <div className="text-sm text-sand-300">
          <p className="mb-3 font-semibold text-sand-100">Enlaces</p>
          <ul className="space-y-1.5">
            <li>
              <Link href="/lotes" className="hover:text-gold-400">
                Mapa de lotes
              </Link>
            </li>
            <li>
              <a href="#financiamiento" className="hover:text-gold-400">
                Planes de financiamiento
              </a>
            </li>
            <li>
              <Link href="/cliente/login" className="hover:text-gold-400">
                Mi cuenta (clientes)
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-gold-400">
                Acceso administrador
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sand-100/10 py-5 text-center text-xs text-sand-400">
        © {new Date().getFullYear()} Terravista. Todos los derechos
        reservados.
      </div>
    </footer>
  );
}
