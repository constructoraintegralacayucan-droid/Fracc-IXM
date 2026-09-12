import { getProyectoConfig } from "@/lib/data";

export const metadata = { title: "Aviso de Privacidad | Terranova" };
export const dynamic = "force-dynamic";

export default async function PrivacidadPage() {
  const config = await getProyectoConfig();

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-forest-900">
        Aviso de Privacidad
      </h1>
      <div className="mt-8 whitespace-pre-wrap text-sm leading-relaxed text-forest-800">
        {config.avisoPrivacidad}
      </div>
    </div>
  );
}
