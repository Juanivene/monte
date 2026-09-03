"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/server/actions/auth";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await logout();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
    >
      Cerrar sesión
    </button>
  );
}
