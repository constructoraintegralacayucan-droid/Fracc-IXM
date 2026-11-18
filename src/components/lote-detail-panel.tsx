"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { calcularFinanciamiento, formatoMoneda } from "@/lib/financiamiento";
import {
  crearReserva,
  validarCuponAction,
  type CrearReservaState,
  type ValidarCuponState,
} from "@/app/(site)/[desarrollo]/lotes/actions";
import type { ProyectoConfigPlano } from "./lote-map";
import { ComprobanteUploadForm } from "./comprobante-upload-form";

export type LotePlano = {
  clave: string;
  manzanaNumero: number;
  disponible: boolean;
  numero: number | null;
  estatus: "DISPONIBLE" | "APARTADO" | "VENDIDO";
  precioContado: number | null;
  precioCredito: number | null;
  precioContadoOriginal: number | null;
  enPromocion: boolean;
  areaM2: number;
  frenteM: number;
  fondoM: number;
  planoX: number | null;
  planoY: number | null;
};

const initialState: CrearReservaState = { ok: false, message: "" };
const cuponInitialState: ValidarCuponState = { ok: false, message: "" };

type Paso = "ficha" | "simulador" | "apartado";

function construirLinkWhatsapp(
  whatsapp: string,
  mensaje: string
): string | null {
  const digitos = whatsapp.replace(/\D/g, "");
  if (!digitos) return null;
  const numero = digitos.startsWith("52") ? digitos : `52${digitos}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export function LoteDetailPanel({
  lote,
  disponiblesEnManzana,
  config,
  desarrolloSlug,
  desarrolloNombre,
  onClose,
}: {
  lote: LotePlano;
  disponiblesEnManzana: number;
  config: ProyectoConfigPlano;
  desarrolloSlug: string;
  desarrolloNombre: string;
  onClose: () => void;
}) {
  // Se congelan al abrir el panel: al enviar la solicitud de apartado, el
  // lote pasa a "no disponible" y el precio público deja de mostrarse por
  // privacidad (ver getLotesConManzana), pero el panel sigue abierto para
  // mostrar la confirmación — no queremos que el precio se vuelva $0 justo
  // cuando el cliente más necesita verlo.
  const [precioContado] = useState(lote.precioContado ?? 0);
  const [precioCredito] = useState(lote.precioCredito ?? 0);

  const [cuponState, cuponFormAction] = useActionState(
    validarCuponAction,
    cuponInitialState
  );
  const [cuponQuitado, setCuponQuitado] = useState(false);
  const cuponAplicado = cuponState.ok && !cuponQuitado;
  const descuentoContado = cuponAplicado ? cuponState.descuentoContado ?? 0 : 0;
  const descuentoCredito = cuponAplicado ? cuponState.descuentoCredito ?? 0 : 0;
  const precioContadoFinal = Math.max(precioContado - descuentoContado, 0);
  const precioCreditoFinal = Math.max(precioCredito - descuentoCredito, 0);

  const [paso, setPaso] = useState<Paso>("ficha");
  const [tipoPago, setTipoPago] = useState<"CONTADO" | "CREDITO">("CONTADO");

  const engancheMinimo = Math.round(
    (precioCreditoFinal * config.inicialMinimoPct) / 100
  );
  const [inicial, setInicial] = useState(engancheMinimo);
  const plazosDisponibles =
    config.plazosMeses.length > 0 ? config.plazosMeses : [config.plazoRecomendado];
  const plazoMax = Math.max(...plazosDisponibles);
  const plazoInicial = plazosDisponibles.includes(config.plazoRecomendado)
    ? config.plazoRecomendado
    : plazosDisponibles[0];
  const [plazoMeses, setPlazoMeses] = useState(plazoInicial);

  const mensualidadDesde =
    plazoMax > 0
      ? Math.round((precioCreditoFinal - engancheMinimo) / plazoMax)
      : 0;

  const resultado = useMemo(
    () =>
      calcularFinanciamiento({
        precio: precioCreditoFinal,
        inicial,
        plazoMeses,
        tasaInteresAnual: config.tasaInteres,
      }),
    [precioCreditoFinal, inicial, plazoMeses, config.tasaInteres]
  );

  const [state, formAction] = useActionState(crearReserva, initialState);

  const folio = state.reservaId
    ? state.reservaId.slice(-8).toUpperCase()
    : null;

  const linkPedirInfo = construirLinkWhatsapp(
    config.whatsapp,
    `Hola, quiero información sobre el Lote ${lote.numero}, Manzana ${lote.manzanaNumero} de ${desarrolloNombre}.`
  );
  const linkComprobante = construirLinkWhatsapp(
    config.whatsapp,
    `Hola, ya envié mi apartado del lote ${lote.clave} (Manzana ${lote.manzanaNumero}). Adjunto mi comprobante de pago.`
  );

  const avisoDisponibilidad =
    disponiblesEnManzana === 1
      ? "¡Solo queda 1 lote disponible en esta manzana!"
      : `Quedan ${disponiblesEnManzana} lotes disponibles en esta manzana`;

  const precioApartado =
    tipoPago === "CONTADO" ? precioContadoFinal : precioCreditoFinal;
  const descuentoApartado =
    tipoPago === "CONTADO" ? descuentoContado : descuentoCredito;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-forest-950/50 backdrop-blur-sm"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-sand-50 p-6 shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700/60">
              Manzana {lote.manzanaNumero} · Lote {lote.numero}
            </p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-forest-900">
              {paso === "ficha" && "Ficha del lote"}
              {paso === "simulador" && "Calcular financiamiento"}
              {paso === "apartado" && "Apartar este lote"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-forest-700 hover:bg-forest-900/5"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {paso !== "ficha" && !state.ok && (
          <button
            onClick={() => setPaso("ficha")}
            className="mb-4 text-xs font-semibold text-forest-700/70 hover:text-forest-900"
          >
            ← Volver a la ficha
          </button>
        )}

        {paso === "ficha" && (
          <FichaLote
            lote={lote}
            precioContado={precioContadoFinal}
            precioCredito={precioCreditoFinal}
            precioContadoTachado={
              cuponAplicado
                ? precioContado
                : lote.enPromocion
                  ? lote.precioContadoOriginal
                  : null
            }
            engancheMinimo={engancheMinimo}
            mensualidadDesde={mensualidadDesde}
            moneda={config.moneda}
            avisoDisponibilidad={avisoDisponibilidad}
            linkPedirInfo={linkPedirInfo}
            cuponState={cuponState}
            cuponAplicado={cuponAplicado}
            cuponFormAction={cuponFormAction}
            desarrolloSlug={desarrolloSlug}
            precioContadoBase={precioContado}
            precioCreditoBase={precioCredito}
            onQuitarCupon={() => setCuponQuitado(true)}
            onCalcular={() => setPaso("simulador")}
            onApartar={() => {
              setTipoPago("CONTADO");
              setPaso("apartado");
            }}
          />
        )}

        {paso === "simulador" && (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-forest-800">
                Enganche (mínimo {config.inicialMinimoPct}%:{" "}
                {formatoMoneda(engancheMinimo, config.moneda)})
              </label>
              <input
                type="range"
                min={engancheMinimo}
                max={precioCreditoFinal}
                step={500}
                value={inicial}
                onChange={(e) => setInicial(Number(e.target.value))}
                className="w-full accent-forest-700"
              />
              <p className="mt-1 font-semibold text-forest-900">
                {formatoMoneda(inicial, config.moneda)}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-forest-800">
                Plazo
              </label>
              <select
                value={plazoMeses}
                onChange={(e) => setPlazoMeses(Number(e.target.value))}
                className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
              >
                {plazosDisponibles.map((p) => (
                  <option key={p} value={p}>
                    {p} meses{p === config.plazoRecomendado ? " (recomendado)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {cuponAplicado && (
              <p className="rounded-xl bg-forest-100 px-3.5 py-2 text-xs font-semibold text-forest-800">
                Cupón {cuponState.codigo} aplicado: −
                {formatoMoneda(descuentoCredito, config.moneda)}
              </p>
            )}
            <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 text-sm">
              <Dato label="Precio del lote" valor={formatoMoneda(precioCreditoFinal, config.moneda)} />
              <Dato label="Enganche" valor={formatoMoneda(inicial, config.moneda)} />
              <Dato label="Cantidad financiada" valor={formatoMoneda(resultado.aFinanciar, config.moneda)} />
              <Dato label="Número de mensualidades" valor={String(plazoMeses)} />
            </dl>

            <div className="rounded-2xl bg-forest-900 p-5 text-sand-100">
              <p className="text-xs uppercase tracking-wide text-sand-300">
                Mensualidad
              </p>
              <p className="font-display text-3xl font-semibold text-sand-50">
                {formatoMoneda(resultado.cuotaMensual, config.moneda)}
              </p>
              <p className="mt-1 text-xs text-sand-300">
                Total a pagar: {formatoMoneda(resultado.totalPagado, config.moneda)} ·
                Sin intereses
              </p>
            </div>

            <button
              onClick={() => {
                setTipoPago("CREDITO");
                setPaso("apartado");
              }}
              className="w-full rounded-full bg-gold-500 py-3 text-sm font-semibold text-forest-950 transition hover:bg-gold-400"
            >
              Apartar con este plan
            </button>
          </div>
        )}

        {paso === "apartado" && (
          <div>
            {!state.ok && (
              <div className="mb-5 rounded-2xl border border-forest-900/10 bg-white p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-forest-700/60">
                  Resumen
                </p>
                <dl className="space-y-1.5 text-sm">
                  <RenglonResumen etiqueta="Fraccionamiento" valor={desarrolloNombre} />
                  <RenglonResumen etiqueta="Lote" valor={String(lote.numero)} />
                  <RenglonResumen etiqueta="Manzana" valor={String(lote.manzanaNumero)} />
                  <RenglonResumen
                    etiqueta="Forma de pago"
                    valor={
                      <span className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setTipoPago("CONTADO")}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            tipoPago === "CONTADO"
                              ? "bg-forest-800 text-sand-50"
                              : "bg-forest-900/5 text-forest-700"
                          }`}
                        >
                          Contado
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipoPago("CREDITO")}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            tipoPago === "CREDITO"
                              ? "bg-forest-800 text-sand-50"
                              : "bg-forest-900/5 text-forest-700"
                          }`}
                        >
                          Crédito
                        </button>
                      </span>
                    }
                  />
                  <RenglonResumen
                    etiqueta="Precio"
                    valor={formatoMoneda(precioApartado, config.moneda)}
                  />
                  {cuponAplicado && (
                    <RenglonResumen
                      etiqueta="Cupón"
                      valor={`${cuponState.codigo} (−${formatoMoneda(descuentoApartado, config.moneda)})`}
                    />
                  )}
                  <RenglonResumen
                    etiqueta="Monto del apartado"
                    valor={`desde ${formatoMoneda(config.reservaMinima, config.moneda)}`}
                  />
                </dl>
              </div>
            )}

            {!state.ok && (
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="desarrolloSlug" value={desarrolloSlug} />
                <input type="hidden" name="clave" value={lote.clave} />
                <input type="hidden" name="planTipoPago" value={tipoPago} />
                {cuponAplicado && cuponState.codigo && (
                  <input type="hidden" name="cuponCodigo" value={cuponState.codigo} />
                )}
                {tipoPago === "CREDITO" && (
                  <>
                    <input type="hidden" name="plazoMeses" value={plazoMeses} />
                    <input type="hidden" name="inicialMonto" value={inicial} />
                  </>
                )}

                <p className="text-sm font-semibold text-forest-900">
                  Tus datos
                </p>
                <div className="grid gap-3">
                  <input
                    name="nombre"
                    required
                    placeholder="Nombre completo"
                    className="rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
                  />
                  <input
                    name="telefono"
                    required
                    placeholder="Teléfono / WhatsApp"
                    className="rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
                  />
                  <input
                    name="correo"
                    type="email"
                    placeholder="Correo (opcional)"
                    className="rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
                  />
                  <div>
                    <label className="mb-1 block text-xs font-medium text-forest-700/70">
                      Monto de apartado (mínimo{" "}
                      {formatoMoneda(config.reservaMinima, config.moneda)})
                    </label>
                    <input
                      name="montoReserva"
                      type="number"
                      min={config.reservaMinima}
                      defaultValue={config.reservaMinima}
                      required
                      className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <SubmitButton />

                {state.message && (
                  <p className="text-sm text-red-700">{state.message}</p>
                )}
              </form>
            )}

            {state.ok && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-forest-300 bg-forest-100 p-5 text-center">
                  <p className="text-sm font-semibold text-forest-800">
                    {state.message}
                  </p>
                  {folio && (
                    <p className="mt-2 text-xs uppercase tracking-wide text-forest-700/70">
                      Folio de operación:{" "}
                      <span className="font-mono font-bold text-forest-900">
                        {folio}
                      </span>
                    </p>
                  )}
                </div>

                {state.checkoutUrl && (
                  <a
                    href={state.checkoutUrl}
                    className="block w-full rounded-full bg-forest-800 py-3 text-center text-sm font-semibold text-sand-50 transition hover:bg-forest-700"
                  >
                    Pagar apartado ahora con tarjeta
                  </a>
                )}

                {config.datosBancarios && (
                  <div className="rounded-2xl border border-forest-900/10 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">
                      O transfiere tu apartado a
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm text-forest-800">
                      {config.datosBancarios}
                    </p>
                  </div>
                )}

                {state.reservaId && (
                  <div className="rounded-2xl border border-forest-900/10 bg-white p-4">
                    <ComprobanteUploadForm reservaId={state.reservaId} />
                  </div>
                )}

                {linkComprobante && (
                  <div className="rounded-2xl border border-gold-500/30 bg-gold-400/10 p-4">
                    <a
                      href={linkComprobante}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-full bg-[#25D366] py-2.5 text-center text-sm font-semibold text-white transition hover:brightness-95"
                    >
                      Enviar comprobante por WhatsApp
                    </a>
                    <p className="mt-2 text-xs text-forest-700/70">
                      <strong>Importante:</strong> en el chat de WhatsApp con
                      nosotros, desactiva los &ldquo;mensajes
                      temporales&rdquo; (que desaparecen). Necesitamos
                      conservar el historial completo de la conversación por
                      logística y seguimiento de tu apartado.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FichaLote({
  lote,
  precioContado,
  precioCredito,
  precioContadoTachado,
  engancheMinimo,
  mensualidadDesde,
  moneda,
  avisoDisponibilidad,
  linkPedirInfo,
  cuponState,
  cuponAplicado,
  cuponFormAction,
  desarrolloSlug,
  precioContadoBase,
  precioCreditoBase,
  onQuitarCupon,
  onCalcular,
  onApartar,
}: {
  lote: LotePlano;
  precioContado: number;
  precioCredito: number;
  precioContadoTachado: number | null;
  engancheMinimo: number;
  mensualidadDesde: number;
  moneda: string;
  avisoDisponibilidad: string;
  linkPedirInfo: string | null;
  cuponState: ValidarCuponState;
  cuponAplicado: boolean;
  cuponFormAction: (payload: FormData) => void;
  desarrolloSlug: string;
  precioContadoBase: number;
  precioCreditoBase: number;
  onQuitarCupon: () => void;
  onCalcular: () => void;
  onApartar: () => void;
}) {
  return (
    <div>
      <span className="inline-block rounded-full bg-gold-400/25 px-3 py-1 text-xs font-semibold text-sand-900">
        {avisoDisponibilidad}
      </span>

      <p className="mt-4 text-sm text-forest-700/80">
        {lote.areaM2} m² · {lote.frenteM} × {lote.fondoM} m
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-forest-700/60">
            Precio de contado
          </p>
          {precioContadoTachado != null && (
            <p className="text-xs text-forest-700/50 line-through">
              {formatoMoneda(precioContadoTachado, moneda)}
            </p>
          )}
          <p className="font-display text-xl font-semibold text-forest-900">
            {formatoMoneda(precioContado, moneda)}
          </p>
        </div>
        <div className="rounded-xl bg-white p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-forest-700/60">
            Precio financiado
          </p>
          <p className="font-display text-xl font-semibold text-forest-900">
            {formatoMoneda(precioCredito, moneda)}
          </p>
        </div>
        <div className="rounded-xl bg-white p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-forest-700/60">
            Enganche desde
          </p>
          <p className="font-display text-lg font-semibold text-forest-900">
            {formatoMoneda(engancheMinimo, moneda)}
          </p>
        </div>
        <div className="rounded-xl bg-white p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-forest-700/60">
            Mensualidad desde
          </p>
          <p className="font-display text-lg font-semibold text-forest-900">
            {formatoMoneda(mensualidadDesde, moneda)}
          </p>
        </div>
      </div>

      {/* Espacio preparado para fotos, video o ubicación del lote, cuando
          estén disponibles. Sin contenido de relleno mientras tanto. */}
      <div className="mt-4 flex h-28 items-center justify-center rounded-xl border border-dashed border-forest-900/15 bg-forest-900/[0.02] text-xs text-forest-700/40">
        Fotos, video y ubicación — próximamente
      </div>

      <div className="mt-4">
        {cuponAplicado ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-forest-300 bg-forest-100 px-3.5 py-2.5">
            <p className="text-sm font-semibold text-forest-800">
              Cupón {cuponState.codigo} aplicado
            </p>
            <button
              type="button"
              onClick={onQuitarCupon}
              className="text-xs font-semibold text-forest-700/70 hover:text-forest-900"
            >
              Quitar
            </button>
          </div>
        ) : (
          <form action={cuponFormAction} className="flex gap-2">
            <input type="hidden" name="desarrolloSlug" value={desarrolloSlug} />
            <input type="hidden" name="precioContado" value={precioContadoBase} />
            <input type="hidden" name="precioCredito" value={precioCreditoBase} />
            <input
              name="cuponCodigo"
              placeholder="¿Tienes un cupón?"
              className="w-full rounded-xl border border-forest-800/20 bg-white px-3.5 py-2.5 text-sm uppercase placeholder:normal-case"
            />
            <BotonAplicarCupon />
          </form>
        )}
        {cuponState.message && !cuponState.ok && (
          <p className="mt-1.5 text-xs text-red-700">{cuponState.message}</p>
        )}
      </div>

      <div className="mt-6 grid gap-2.5">
        <button
          onClick={onCalcular}
          className="w-full rounded-full border border-forest-800 py-3 text-sm font-semibold text-forest-800 transition hover:bg-forest-800/5"
        >
          Calcular financiamiento
        </button>
        <button
          onClick={onApartar}
          className="w-full rounded-full bg-gold-500 py-3 text-sm font-semibold text-forest-950 transition hover:bg-gold-400"
        >
          Apartar este lote
        </button>
        {linkPedirInfo && (
          <a
            href={linkPedirInfo}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-full py-2.5 text-center text-sm font-semibold text-forest-700/70 transition hover:text-forest-900"
          >
            ¿Dudas? Pedir información por WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-forest-700/60">
        {label}
      </p>
      <p className="font-semibold text-forest-900">{valor}</p>
    </div>
  );
}

function RenglonResumen({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-forest-700/60">{etiqueta}</dt>
      <dd className="font-semibold text-forest-900">{valor}</dd>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-gold-500 py-3 text-sm font-semibold text-forest-950 transition hover:bg-gold-400 disabled:opacity-60"
    >
      {pending ? "Enviando..." : "Confirmar apartado"}
    </button>
  );
}

function BotonAplicarCupon() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-xl border border-forest-800 px-4 text-sm font-semibold text-forest-800 transition hover:bg-forest-800/5 disabled:opacity-60"
    >
      {pending ? "..." : "Aplicar"}
    </button>
  );
}
