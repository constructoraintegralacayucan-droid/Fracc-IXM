import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsappButton } from "@/components/whatsapp-button";
import { getProyectoConfig } from "@/lib/data";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getProyectoConfig();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter ubicacion={config.ubicacion} whatsapp={config.whatsapp} />
      {config.whatsapp && <WhatsappButton whatsapp={config.whatsapp} />}
    </div>
  );
}
