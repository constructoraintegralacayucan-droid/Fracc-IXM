"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin/dashboard", label: "Inicio" },
  { href: "/admin/lotes", label: "Lotes" },
  { href: "/admin/reservas", label: "Reservas" },
  { href: "/admin/testimonios", label: "Testim." },
  { href: "/admin/configuracion", label: "Ajustes" },
  { href: "/admin/desarrollos", label: "Desarr." },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-forest-900/10 bg-sand-50 pb-[env(safe-area-inset-bottom)] sm:hidden">
      {ITEMS.map((item) => {
        const activo =
          pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
              activo ? "text-forest-900" : "text-forest-700/50"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                activo ? "bg-gold-500" : "bg-transparent"
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
