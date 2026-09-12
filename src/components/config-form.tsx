"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  actualizarConfig,
  type ActualizarConfigState,
} from "@/app/admin/actions";

const initialState: ActualizarConfigState = { ok: false, message: "" };

export type ConfigPlano = {
  desarrolloId: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  inicialMinimoPct: number;
  plazoMaxPublico: number;
  plazoRecomendado: number;
  tasaInteres: number;
  reservaMinima: number;
  plazoReservaDias: number;
  ofertaActiva: boolean;
  ofertaTitulo: string;
  ofertaFin: string;
  disclaimer: string;
  whatsapp: string;
  terminosCondiciones: string;
  avisoPrivacidad: string;
};

export function ConfigForm({ config }: { config: ConfigPlano }) {
  const [state, formAction] = useActionState(actualizarConfig, initialState);

  return (
    <form action={formAction} className="space-y-10">
      <input type="hidden" name="desarrolloId" value={config.desarrolloId} />
      <section className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Datos del proyecto
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Nombre
            </label>
            <input
              name="nombre"
              defaultValue={config.nombre}
              required
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Ubicación
            </label>
            <input
              name="ubicacion"
              defaultValue={config.ubicacion}
              required
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Descripción (aparece en la portada)
            </label>
            <textarea
              name="descripcion"
              defaultValue={config.descripcion}
              rows={3}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              WhatsApp de contacto (10 dígitos)
            </label>
            <input
              name="whatsapp"
              defaultValue={config.whatsapp}
              placeholder="9241122354"
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Disclaimer (aviso breve, aparece en la portada)
            </label>
            <textarea
              name="disclaimer"
              defaultValue={config.disclaimer}
              rows={2}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Financiamiento
        </h2>
        <p className="mt-1 text-sm text-forest-700/70">
          Estos son los topes que ve el público en el sitio. Tú puedes
          cambiarlos aquí; en el mapa de lotes y en la calculadora nunca se
          muestran plazos ni enganches menores a lo que definas.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Enganche mínimo (%)
            </label>
            <input
              name="inicialMinimoPct"
              type="number"
              min={0}
              max={100}
              defaultValue={config.inicialMinimoPct}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Plazo máximo público (meses)
            </label>
            <input
              name="plazoMaxPublico"
              type="number"
              min={1}
              max={96}
              defaultValue={config.plazoMaxPublico}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Plazo recomendado (meses)
            </label>
            <input
              name="plazoRecomendado"
              type="number"
              min={1}
              max={96}
              defaultValue={config.plazoRecomendado}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Tasa de interés anual (%)
            </label>
            <input
              name="tasaInteres"
              type="number"
              min={0}
              step="0.1"
              defaultValue={config.tasaInteres}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Apartado mínimo ($)
            </label>
            <input
              name="reservaMinima"
              type="number"
              min={0}
              defaultValue={config.reservaMinima}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Plazo del apartado (días)
            </label>
            <input
              name="plazoReservaDias"
              type="number"
              min={1}
              defaultValue={config.plazoReservaDias}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Oferta flash
        </h2>
        <p className="mt-1 text-sm text-forest-700/70">
          Activa un contador de cuenta regresiva en la portada. Desaparece
          solo cuando llega la fecha límite.
        </p>
        <div className="mt-4 flex items-center gap-2.5">
          <input
            id="ofertaActiva"
            name="ofertaActiva"
            type="checkbox"
            defaultChecked={config.ofertaActiva}
            className="h-4 w-4"
          />
          <label htmlFor="ofertaActiva" className="text-sm text-forest-800">
            Mostrar oferta activa en la portada
          </label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Título de la oferta
            </label>
            <input
              name="ofertaTitulo"
              defaultValue={config.ofertaTitulo}
              placeholder="Ej. Oferta de lanzamiento"
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Termina el
            </label>
            <input
              name="ofertaFin"
              type="datetime-local"
              defaultValue={config.ofertaFin}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-forest-900/10 bg-sand-50 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-900">
          Legal
        </h2>
        <p className="mt-1 text-sm text-forest-700/70">
          Texto de las páginas públicas /terminos y /privacidad. Ya vienen con
          una plantilla inicial — te recomendamos que un abogado la revise
          antes de usarla de forma definitiva.
        </p>
        <div className="mt-4 grid gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Términos y Condiciones
            </label>
            <textarea
              name="terminosCondiciones"
              defaultValue={config.terminosCondiciones}
              rows={8}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 font-mono text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-forest-700/70">
              Aviso de Privacidad
            </label>
            <textarea
              name="avisoPrivacidad"
              defaultValue={config.avisoPrivacidad}
              rows={8}
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 font-mono text-xs"
            />
          </div>
        </div>
      </section>

      {state.message && (
        <p className={`text-sm ${state.ok ? "text-forest-700" : "text-red-700"}`}>
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-forest-800 px-6 py-3 text-sm font-semibold text-sand-50 hover:bg-forest-700 disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Guardar configuración"}
    </button>
  );
}
