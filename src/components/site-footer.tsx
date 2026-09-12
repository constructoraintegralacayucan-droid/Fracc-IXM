import Link from "next/link";
import { LogoMark } from "@/components/logo";

export function SiteFooter({
  desarrollo,
}: {
  desarrollo?: {
    slug: string;
    nombre: string;
    ubicacion: string;
    whatsapp: string | null;
  };
} = {}) {
  const base = desarrollo ? `/${desarrollo.slug}` : null;

  return (
    <footer
      id="contacto"
      className="mt-24 border-t border-forest-900/10 bg-forest-950 text-sand-200"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9 text-sand-50" />
            <p className="font-display text-2xl font-bold uppercase tracking-[0.08em] text-sand-50">
              Terranova
            </p>
          </div>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.15em] text-sand-400">
            by Constructora Integral Acayucan
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-sand-300">
            {desarrollo
              ? `Tu futuro, en buen terreno. ${desarrollo.nombre}. Financiamiento directo, sin intereses.`
              : "Tu futuro, en buen terreno. Fraccionamientos con financiamiento directo, sin intereses."}
          </p>
        </div>

        <div className="text-sm text-sand-300">
          <p className="mb-3 font-semibold text-sand-100">Contacto</p>
          {desarrollo && <p className="max-w-xs">{desarrollo.ubicacion}</p>}
          <p className="mt-2">constructoraintegral_acayucan@hotmail.com</p>
          {desarrollo?.whatsapp && (
            <p className="mt-1">Tel. / WhatsApp: {desarrollo.whatsapp}</p>
          )}
        </div>

        <div className="text-sm text-sand-300">
          <p className="mb-3 font-semibold text-sand-100">Enlaces</p>
          <ul className="space-y-1.5">
            {base && (
              <li>
                <Link href={`${base}/lotes`} className="hover:text-gold-400">
                  Mapa de lotes
                </Link>
              </li>
            )}
            {base && (
              <li>
                <a href="#financiamiento" className="hover:text-gold-400">
                  Planes de financiamiento
                </a>
              </li>
            )}
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
            {base && (
              <li>
                <Link href={`${base}/terminos`} className="hover:text-gold-400">
                  Términos y Condiciones
                </Link>
              </li>
            )}
            {base && (
              <li>
                <Link
                  href={`${base}/privacidad`}
                  className="hover:text-gold-400"
                >
                  Aviso de Privacidad
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-sand-100/10 py-5 text-center text-xs text-sand-400">
        © {new Date().getFullYear()} Terranova. Todos los derechos
        reservados.
      </div>
    </footer>
  );
}
