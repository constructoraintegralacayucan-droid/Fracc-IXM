export const metadata = { title: "Pago recibido | Terravista" };

export default async function PagoExitosoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const esCuota = tipo === "cuota";

  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center sm:px-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-800/10 text-3xl text-forest-800">
        ✓
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold text-forest-900">
        ¡Pago recibido!
      </h1>
      <p className="mt-3 text-forest-700">
        {esCuota
          ? "Registramos tu pago de mensualidad. Puede tardar unos minutos en reflejarse en tu estado de cuenta."
          : "Registramos tu pago de apartado. Nuestro equipo se pondrá en contacto contigo para los siguientes pasos."}
      </p>
      <a
        href={esCuota ? "/cliente/dashboard" : "/"}
        className="mt-8 inline-block rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-forest-950 transition hover:bg-gold-400"
      >
        {esCuota ? "Ir a mi cuenta" : "Volver al inicio"}
      </a>
    </div>
  );
}
