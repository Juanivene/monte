"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Field";
import { changePassword } from "@/server/actions/auth";

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    setSubmitting(true);
    const result = await changePassword({ currentPassword, newPassword });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="max-w-sm">
      <h1 className="text-xl font-semibold text-neutral-900">Cambiar contraseña</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="currentPassword">Contraseña actual</Label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="newPassword">Nueva contraseña</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Repetir nueva contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <FieldError message={error ?? undefined} />
        {success && <p className="text-sm text-green-600">Contraseña actualizada.</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </div>
  );
}
