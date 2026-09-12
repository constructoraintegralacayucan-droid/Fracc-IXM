import "server-only";
import { headers } from "next/headers";

export async function getSiteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("127.")
    ? "http"
    : "https";
  return `${proto}://${host}`;
}
