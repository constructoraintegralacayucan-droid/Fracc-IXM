import Link from "next/link";
import { getGaleriaImagenes, resolverDesarrolloAdmin } from "@/lib/data";
import { ConfigForm } from "@/components/config-form";
import { GaleriaUploader } from "@/components/galeria-uploader";
import { AdminDesarrolloSwitcher } from "@/components/admin-desarrollo-switcher";

export const metadata = { title: "Configuración | Terranova Admin" };
export const dynamic = "force-dynamic";

function toDatetimeLocal(date: Date | null) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function AdminConfiguracionPage({
  searchParams,
}: {
  searchParams: Promise<{ desarrollo?: string }>;
}) {
  const { desarrollo: slugParam } = await searchParams;
  const { desarrollos, actual: config } = await resolverDesarrolloAdmin(
    slugParam
  );

  if (!config) {
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

  const imagenes = await getGaleriaImagenes(config.id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold text-forest-900">
            Configuración
          </h1>
          <p className="mt-1 text-sm text-forest-700/70">
            {config.nombre} — Controla lo que ve el público: financiamiento,
            oferta flash y datos del desarrollo.
          </p>
        </div>
        <AdminDesarrolloSwitcher desarrollos={desarrollos} actualSlug={config.slug} />
      </div>

      <div className="mt-8 rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Galería / carrusel de portada
        </h2>
        <div className="mt-4">
          <GaleriaUploader imagenes={imagenes} desarrolloId={config.id} />
        </div>
      </div>

      <div className="mt-8">
        <ConfigForm
          config={{
            desarrolloId: config.id,
            nombre: config.nombre,
            ubicacion: config.ubicacion,
            descripcion: config.descripcion,
            precioContadoDefault: Number(config.precioContadoDefault),
            precioCreditoDefault: Number(config.precioCreditoDefault),
            inicialMinimoPct: config.inicialMinimoPct,
            plazoMaxPublico: config.plazoMaxPublico,
            plazoRecomendado: config.plazoRecomendado,
            tasaInteres: config.tasaInteres,
            reservaMinima: Number(config.reservaMinima),
            plazoReservaDias: config.plazoReservaDias,
            ofertaActiva: config.ofertaActiva,
            ofertaTitulo: config.ofertaTitulo ?? "",
            ofertaFin: toDatetimeLocal(config.ofertaFin),
            disclaimer: config.disclaimer,
            whatsapp: config.whatsapp ?? "",
            terminosCondiciones: config.terminosCondiciones,
            avisoPrivacidad: config.avisoPrivacidad,
            datosBancarios: config.datosBancarios,
          }}
        />
      </div>
    </div>
  );
}
