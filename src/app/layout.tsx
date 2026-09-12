import type { Metadata, Viewport } from "next";
import { Montserrat, Lato } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

const bodyFont = Lato({
  variable: "--font-body",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const displayFont = Montserrat({
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Terranova App by Constructora Integral Acayucan",
  description:
    "Terranova App — Tu futuro, en buen terreno. Fraccionamiento Ixmegallo en Acayucan, Veracruz. Financiamiento directo sin intereses.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    title: "Terranova App",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b3a2f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sand-50 text-stone-ink">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
