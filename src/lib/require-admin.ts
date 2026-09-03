import "server-only";
import { getSession } from "./session";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    throw new Error("No autorizado");
  }
  return session;
}
