import "server-only";

const CONEKTA_API_URL = "https://api.conekta.io";
const CONEKTA_API_VERSION = "application/vnd.conekta-v2.1.0+json";

function authHeader(): string {
  const key = process.env.CONEKTA_PRIVATE_KEY;
  if (!key) {
    throw new Error("CONEKTA_PRIVATE_KEY no está configurada.");
  }
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

export function conektaHabilitado(): boolean {
  return Boolean(process.env.CONEKTA_PRIVATE_KEY);
}

export type CrearCheckoutParams = {
  monto: number; // en pesos MXN, se convierte a centavos
  descripcion: string;
  nombre?: string;
  correo?: string;
  telefono?: string;
  successUrl: string;
  failureUrl: string;
  metadata?: Record<string, string>;
};

export type CheckoutConekta = {
  orderId: string;
  checkoutUrl: string;
};

export async function crearCheckoutHospedado(
  params: CrearCheckoutParams
): Promise<CheckoutConekta> {
  const body = {
    currency: "MXN",
    customer_info: {
      name: params.nombre || "Cliente Terranova App",
      email: params.correo || undefined,
      phone: params.telefono || undefined,
    },
    line_items: [
      {
        name: params.descripcion.slice(0, 250),
        unit_price: Math.round(params.monto * 100),
        quantity: 1,
      },
    ],
    checkout: {
      type: "HostedPayment",
      allowed_payment_methods: ["card"],
      success_url: params.successUrl,
      failure_url: params.failureUrl,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    },
    metadata: params.metadata ?? {},
  };

  const res = await fetch(`${CONEKTA_API_URL}/orders`, {
    method: "POST",
    headers: {
      Accept: CONEKTA_API_VERSION,
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(`Conekta rechazó la orden (${res.status}): ${detalle}`);
  }

  const data = await res.json();
  const checkoutUrl: string | undefined = data?.checkout?.url;
  const orderId: string | undefined = data?.id;

  if (!checkoutUrl || !orderId) {
    throw new Error("Respuesta de Conekta sin URL de pago.");
  }

  return { orderId, checkoutUrl };
}

export function verificarWebhookAutorizado(
  authHeaderValue: string | null
): boolean {
  const user = process.env.CONEKTA_WEBHOOK_USER;
  const pass = process.env.CONEKTA_WEBHOOK_PASS;
  if (!user || !pass) return false;
  if (!authHeaderValue?.startsWith("Basic ")) return false;

  const decoded = Buffer.from(
    authHeaderValue.slice(6),
    "base64"
  ).toString("utf-8");
  return decoded === `${user}:${pass}`;
}
