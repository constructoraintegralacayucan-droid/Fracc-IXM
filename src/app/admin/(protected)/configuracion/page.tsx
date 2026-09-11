import { getProyectoConfig } from "@/lib/data";
import { ConfigForm } from "@/components/config-form";

export const metadata = { title: "Configuración | Terravista Admin" };

function toDatetimeLocal(date: Date | null) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function AdminConfiguracionPage() {
  const config = await getProyectoConfig();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-forest-900">
        Configuración
      </h1>
      <p className="mt-1 text-sm text-forest-700/70">
        Controla lo que ve el público: financiamiento, oferta flash y datos
        del proyecto.
      </p>

      <div className="mt-8">
        <ConfigForm
          config={{
            nombre: config.nombre,
            ubicacion: config.ubicacion,
            descripcion: config.descripcion,
            inicialMinimoPct: config.inicialMinimoPct,
            plazoMaxPublico: config.plazoMaxPublico,
            plazoRecomendado: config.plazoRecomendado,
            tasaInteres: config.tasaInteres,
            reservaMinima: Number(config.reservaMinima),
            plazoReservaDias: config.plazoReservaDias,
            ofertaActiva: config.ofertaActiva,
            ofertaTitulo: config.ofertaTitulo ?? "",
            ofertaFin: toDatetimeLocal(config.ofertaFin),
          }}
        />
      </div>
    </div>
  );
}
