import { getLotesConManzana } from "@/lib/data";
import { AdminLotesTable } from "@/components/admin-lotes-table";

export const metadata = { title: "Lotes | Terranova App Admin" };

export default async function AdminLotesPage() {
  const lotes = await getLotesConManzana();

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
      <h1 className="font-display text-2xl font-semibold text-forest-900">
        Gestión de lotes
      </h1>
      <p className="mt-1 text-sm text-forest-700/70">
        Actualiza estatus, precio y datos del comprador de cada lote.
      </p>

      <div className="mt-8">
        <AdminLotesTable lotes={lotesPlano} />
      </div>
    </div>
  );
}
