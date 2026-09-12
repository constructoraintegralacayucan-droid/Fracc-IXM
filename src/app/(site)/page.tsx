import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getDesarrollos } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terranova by Constructora Integral Acayucan",
};

export default async function TerranovaHomePage() {
  const desarrollos = await getDesarrollos();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-forest-950 text-sand-50">
          <div className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8 sm:py-32">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-400">
              Constructora Integral Acayucan
            </p>
            <h1 className="mx-auto mt-5 max-w-2xl font-display text-5xl font-bold uppercase tracking-[0.04em] text-sand-50 sm:text-6xl">
              Terranova
            </h1>
            <p className="mx-auto mt-4 max-w-xl font-display text-xl italic text-gold-400">
              Tu futuro, en buen terreno.
            </p>
            <p className="mx-auto mt-6 max-w-lg text-sand-200">
              Elige el desarrollo que quieres conocer y encuentra tu lote
              ideal, con financiamiento directo y sin intereses.
            </p>
          </div>
        </section>

        <section id="desarrollos" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
              Nuestros desarrollos
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-forest-900 sm:text-4xl">
              Encuentra el lugar donde todo comienza
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {desarrollos.map((d) => (
              <Link
                key={d.id}
                href={`/${d.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-forest-900/10 bg-sand-50 shadow-sm transition hover:shadow-lg"
              >
                <div
                  className="h-40 bg-forest-800 bg-cover bg-center"
                  style={
                    d.imagenPortada
                      ? { backgroundImage: `url(${d.imagenPortada})` }
                      : undefined
                  }
                />
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-semibold text-forest-900">
                    {d.nombre}
                  </h3>
                  <p className="mt-1 text-sm text-forest-700/70">
                    {d.ubicacion}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-gold-600 transition group-hover:text-gold-500">
                    Ver desarrollo →
                  </span>
                </div>
              </Link>
            ))}

            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-forest-900/20 bg-forest-900/5 p-6 text-center">
              <p className="font-display text-lg font-semibold text-forest-700/70">
                Nuevo desarrollo
              </p>
              <p className="mt-1 text-sm text-forest-700/50">
                Muy pronto
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
