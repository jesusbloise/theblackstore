"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteVariantButtonProps = {
  productId: string;
  variantId: string;
  variantName: string;
};

export function DeleteVariantButton({
  productId,
  variantId,
  variantName,
}: DeleteVariantButtonProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  async function handleDelete() {
    const confirmed =
      window.confirm(
        `¿Seguro que quieres eliminar la variante "${variantName}"?\n\nEsta acción no se puede deshacer.`,
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/variants/${variantId}`,
        {
          method: "DELETE",
        },
      );

      const result =
        (await response.json()) as {
          ok: boolean;
          message?: string;
        };

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message ??
            "No fue posible eliminar la variante.",
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar la variante.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleDelete}
      className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 size={15} />

      {loading
        ? "Eliminando..."
        : "Eliminar"}
    </button>
  );
}
