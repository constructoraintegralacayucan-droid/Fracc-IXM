export const metadata = { title: "Pago no completado | Terravista" };

export default async function PagoFallidoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const esCuota = tipo === "cuota";

  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center sm:px-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-700">
        ✕
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold text-forest-900">
        No se completó el pago
      </h1>
      <p className="mt-3 text-forest-700">
        Tu pago no pudo procesarse o fue cancelado. No se realizó ningún
        cargo. Puedes intentarlo de nuevo o contactarnos si el problema
        continúa.
      </p>
      <a
        href={esCuota ? "/cliente/dashboard" : "/lotes"}
        className="mt-8 inline-block rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-forest-950 transition hover:bg-gold-400"
      >
        {esCuota ? "Volver a mi cuenta" : "Volver al mapa de lotes"}
      </a>
    </div>
  );
}
