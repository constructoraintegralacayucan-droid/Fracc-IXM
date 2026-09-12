import "server-only";
import { redirect } from "next/navigation";
import { getColaboradorSession } from "./colaborador-session";

export async function requireColaborador() {
  const session = await getColaboradorSession();
  if (!session) {
    redirect("/colaborador/login");
  }
  return session;
}
