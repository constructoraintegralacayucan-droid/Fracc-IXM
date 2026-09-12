import Link from "next/link";
import { getLotesConManzana, resolverDesarrolloAdmin } from "@/lib/data";
import { AdminLotesTable } from "@/components/admin-lotes-table";
import { AdminDesarrolloSwitcher } from "@/components/admin-desarrollo-switcher";

export const metadata = { title: "Lotes | Terranova Admin" };
export const dynamic = "force-dynamic";

export default async function AdminLotesPage({
  searchParams,
}: {
  searchParams: Promise<{ desarrollo?: string }>;
}) {
  const { desarrollo: slugParam } = await searchParams;
  const { desarrollos, actual } = await resolverDesarrolloAdmin(slugParam);

  if (!actual) {
    return (
      <p className="text-sm text-forest-700/70">
        Todavía no hay ningún desarrollo. Crea uno en{" "}
        <Link href="/admin/desarrollos" className="underline">
          Desarrollos
        </Link>
        .
      </p>
    );
  }

  const lotes = await getLotesConManzana(actual.id);

  const lotesPlano = lotes.map((l) => ({
    id: l.id,
    clave: l.clave,
    numero: l.numero,
    manzanaNumero: l.manzana.numero,
    precio: Number(l.precio),
    estatus: l.estatus,
    compradorNombre: l.compradorNombre,
    compradorTelefono: l.compradorTelefono,
    compradorCorreo: l.compradorCorreo,
    tipoPago: l.tipoPago,
    anticipo: Number(l.anticipo),
    saldo: Number(l.saldo),
  }));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold text-forest-900">
            Gestión de lotes
          </h1>
          <p className="mt-1 text-sm text-forest-700/70">
            {actual.nombre} — Actualiza estatus, precio y datos del comprador
            de cada lote.
          </p>
        </div>
        <AdminDesarrolloSwitcher desarrollos={desarrollos} actualSlug={actual.slug} />
      </div>

      <div className="mt-8">
        <AdminLotesTable lotes={lotesPlano} />
      </div>
    </div>
  );
}
