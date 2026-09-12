import "server-only";

const RESEND_API_URL = "https://api.resend.com/emails";

export function emailHabilitado(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export type EnviarCorreoParams = {
  to: string;
  subject: string;
  html: string;
  adjuntoPdf?: { nombre: string; bytes: Uint8Array };
};

export async function enviarCorreo(params: EnviarCorreoParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error(
      "El envío de correos no está configurado (RESEND_API_KEY / EMAIL_FROM)."
    );
  }

  const body: Record<string, unknown> = {
    from,
    to: [params.to],
    subject: params.subject,
    html: params.html,
  };

  if (params.adjuntoPdf) {
    body.attachments = [
      {
        filename: params.adjuntoPdf.nombre,
        content: Buffer.from(params.adjuntoPdf.bytes).toString("base64"),
      },
    ];
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(`Resend rechazó el envío (${res.status}): ${detalle}`);
  }
}
