"use client";

import { usePathname, useRouter } from "next/navigation";

export function AdminDesarrolloSwitcher({
  desarrollos,
  actualSlug,
}: {
  desarrollos: { slug: string; nombre: string; activo: boolean }[];
  actualSlug: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  if (desarrollos.length <= 1) return null;

  return (
    <select
      value={actualSlug}
      onChange={(e) => router.push(`${pathname}?desarrollo=${e.target.value}`)}
      className="rounded-xl border border-forest-800/20 bg-sand-50 px-3.5 py-2 text-sm font-medium text-forest-900"
    >
      {desarrollos.map((d) => (
        <option key={d.slug} value={d.slug}>
          {d.nombre}
          {!d.activo ? " (inactivo)" : ""}
        </option>
      ))}
    </select>
  );
}
