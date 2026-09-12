import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsappButton } from "@/components/whatsapp-button";
import { getDesarrolloBySlug } from "@/lib/data";

export default async function DesarrolloLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ desarrollo: string }>;
}) {
  const { desarrollo: slug } = await params;
  const desarrollo = await getDesarrolloBySlug(slug);

  if (!desarrollo || !desarrollo.activo) {
    notFound();
  }

  return (
    <>
      <SiteHeader desarrollo={{ slug: desarrollo.slug, nombre: desarrollo.nombre }} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        desarrollo={{
          slug: desarrollo.slug,
          nombre: desarrollo.nombre,
          ubicacion: desarrollo.ubicacion,
          whatsapp: desarrollo.whatsapp,
        }}
      />
      {desarrollo.whatsapp && (
        <WhatsappButton whatsapp={desarrollo.whatsapp} />
      )}
    </>
  );
}
