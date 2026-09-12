import { getProyectoConfig } from "@/lib/data";

export const metadata = { title: "Términos y Condiciones | Terranova" };
export const dynamic = "force-dynamic";

export default async function TerminosPage() {
  const config = await getProyectoConfig();

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-forest-900">
        Términos y Condiciones
      </h1>
      <div className="mt-8 whitespace-pre-wrap text-sm leading-relaxed text-forest-800">
        {config.terminosCondiciones}
      </div>
    </div>
  );
}
