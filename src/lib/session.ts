import "server-only";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "./auth-token";

export async function createSession(payload: SessionPayload) {
  const token = await signSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
