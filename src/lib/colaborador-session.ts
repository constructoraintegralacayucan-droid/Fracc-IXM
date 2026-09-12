import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "ixmegallo_colaborador_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 días

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET no está configurado");
  }
  return new TextEncoder().encode(secret);
}

export type ColaboradorSessionPayload = {
  sub: string;
  email: string;
  nombre: string;
};

export async function createColaboradorSession(
  payload: ColaboradorSessionPayload
) {
  const token = await new SignJWT({ ...payload, kind: "colaborador" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getColaboradorSession(): Promise<ColaboradorSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.kind !== "colaborador") return null;
    return {
      sub: String(payload.sub ?? ""),
      email: String(payload.email ?? ""),
      nombre: String(payload.nombre ?? ""),
    };
  } catch {
    return null;
  }
}

export async function destroyColaboradorSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME as COLABORADOR_COOKIE_NAME };
