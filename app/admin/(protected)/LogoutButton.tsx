
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("No se pudo cerrar la sesión.");
      }

      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError("Error al cerrar sesión. Inténtalo nuevamente.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="w-full rounded-lg border border-slate-700 px-3 py-2 text-left text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Cerrando sesión..." : "Cerrar sesión"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

