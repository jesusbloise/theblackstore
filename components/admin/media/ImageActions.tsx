"use client";

import {
  Star,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ImageActionsProps = {
  productId: string;
  imageId: string;
  imageAlt?: string | null;
  isPrimary: boolean;
};

export function ImageActions({
  productId,
  imageId,
  imageAlt,
  isPrimary,
}: ImageActionsProps) {
  const router = useRouter();

  const [loadingAction, setLoadingAction] =
    useState<
      "primary" | "delete" | null
    >(null);

  async function handleSetPrimary() {
    if (isPrimary) {
      return;
    }

    setLoadingAction("primary");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/images/${imageId}`,
        {
          method: "PATCH",
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
            "No fue posible cambiar la imagen principal.",
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No fue posible cambiar la imagen principal.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleDelete() {
    const confirmed =
      window.confirm(
        `¿Seguro que quieres eliminar esta imagen${
          imageAlt
            ? ` (${imageAlt})`
            : ""
        }?\n\nEsta acción también eliminará el archivo de Cloudflare R2.`,
      );

    if (!confirmed) {
      return;
    }

    setLoadingAction("delete");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/images/${imageId}`,
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
            "No fue posible eliminar la imagen.",
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar la imagen.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  const disabled =
    loadingAction !== null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {isPrimary ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
          <Star
            size={14}
            className="fill-current"
          />
          Principal
        </span>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={handleSetPrimary}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 transition hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Star size={16} />

          {loadingAction === "primary"
            ? "Cambiando..."
            : "Hacer principal"}
        </button>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={handleDelete}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={16} />

        {loadingAction === "delete"
          ? "Eliminando..."
          : "Eliminar"}
      </button>
    </div>
  );
}