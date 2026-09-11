import "server-only";
import { redirect } from "next/navigation";
import { getClienteSession } from "./cliente-session";

export async function requireCliente() {
  const session = await getClienteSession();
  if (!session) {
    redirect("/cliente/login");
  }
  return session;
}
