function soloDigitos(v: string) {
  return v.replace(/\D/g, "");
}

export function WhatsappButton({ whatsapp }: { whatsapp: string }) {
  const digitos = soloDigitos(whatsapp);
  if (!digitos) return null;
  const numero = digitos.startsWith("52") ? digitos : `52${digitos}`;
  const mensaje = encodeURIComponent(
    "Hola, me interesa un lote en Fraccionamiento Ixmegallo. ¿Me pueden dar más información?"
  );

  return (
    <a
      href={`https://wa.me/${numero}?text=${mensaje}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.5 1.34 5.02L2 22l5.13-1.35A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.06c-1.6 0-3.16-.43-4.52-1.24l-.32-.19-3.05.8.81-2.97-.21-.31a8.05 8.05 0 0 1-1.24-4.29c0-4.46 3.63-8.09 8.1-8.09 2.16 0 4.19.84 5.72 2.37a8.03 8.03 0 0 1 2.37 5.72c0 4.46-3.63 8.2-8.66 8.2Zm4.44-6.1c-.24-.12-1.43-.7-1.65-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28Z" />
      </svg>
    </a>
  );
}
