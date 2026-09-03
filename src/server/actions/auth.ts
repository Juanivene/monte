"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";
import { requireAdmin } from "@/lib/require-admin";
import { loginSchema, type LoginInput } from "@/lib/validations";

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function login(input: LoginInput): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const admin = await prisma.admin.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!admin) {
    return { ok: false, error: "Email o contraseña incorrectos" };
  }

  const valid = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!valid) {
    return { ok: false, error: "Email o contraseña incorrectos" };
  }

  await createSession({ adminId: admin.id, email: admin.email });
  return { ok: true };
}

export async function logout() {
  await destroySession();
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<AuthResult> {
  const session = await requireAdmin();

  if (input.newPassword.length < 8) {
    return { ok: false, error: "La nueva contraseña debe tener al menos 8 caracteres" };
  }

  const admin = await prisma.admin.findUniqueOrThrow({ where: { id: session.adminId } });
  const valid = await bcrypt.compare(input.currentPassword, admin.passwordHash);
  if (!valid) {
    return { ok: false, error: "La contraseña actual no es correcta" };
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10);
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });
  return { ok: true };
}
