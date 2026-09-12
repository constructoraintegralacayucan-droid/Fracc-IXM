import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El sitio antes era de un solo fraccionamiento; estas URLs pudieron
  // quedar compartidas (WhatsApp, redes, anuncios) antes de que cada
  // desarrollo tuviera su propia dirección bajo /ixmegallo.
  async redirects() {
    return [
      { source: "/lotes", destination: "/ixmegallo/lotes", permanent: true },
      {
        source: "/terminos",
        destination: "/ixmegallo/terminos",
        permanent: true,
      },
      {
        source: "/privacidad",
        destination: "/ixmegallo/privacidad",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
