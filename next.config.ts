import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las imágenes (portada de desarrollo, galería) se suben como archivo
  // directo a un Server Action; el límite por defecto de Next.js para
  // esas peticiones es 1MB, muy por debajo de los 4MB que permitimos
  // validar en el propio formulario.
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
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
