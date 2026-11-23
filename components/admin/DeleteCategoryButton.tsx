"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { id: string; name: string };

export function DeleteCategoryButton({ id, name }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar la categoría «${name}»? Esta acción no se puede deshacer.`)) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/categories/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data: { ok?: boolean; message?: string } = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "No se pudo eliminar la categoría.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
      >
        {busy ? "Eliminando…" : "Eliminar"}
      </button>
      {error && <p role="alert" className="max-w-xs text-xs text-red-700">{error}</p>}
    </div>
  );
}
