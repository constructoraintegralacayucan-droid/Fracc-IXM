import { SnowOverlay } from "@/components/snow-overlay";
import { esTemporadaNavidena } from "@/lib/temporada";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {esTemporadaNavidena() && <SnowOverlay />}
      {children}
    </div>
  );
}
