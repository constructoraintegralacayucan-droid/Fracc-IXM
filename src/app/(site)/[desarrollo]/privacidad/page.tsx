import { notFound } from "next/navigation";
import { getDesarrolloBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ desarrollo: string }>;
}) {
  const { desarrollo: slug } = await params;
  const desarrollo = await getDesarrolloBySlug(slug);
  return {
    title: `Aviso de Privacidad | ${desarrollo?.nombre ?? "Terranova"}`,
  };
}

export default async function PrivacidadPage({
  params,
}: {
  params: Promise<{ desarrollo: string }>;
}) {
  const { desarrollo: slug } = await params;
  const desarrollo = await getDesarrolloBySlug(slug);
  if (!desarrollo) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-forest-900">
        Aviso de Privacidad
      </h1>
      <div className="mt-8 whitespace-pre-wrap text-sm leading-relaxed text-forest-800">
        {desarrollo.avisoPrivacidad}
      </div>
    </div>
  );
}
