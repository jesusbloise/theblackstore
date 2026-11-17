"use client";

import {
  Check,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Feature = {
  id: string;
  text: string;
  sortOrder: number;
};

type ProductFeaturesEditorProps = {
  productId: string;
  features: Feature[];
};

export function ProductFeaturesEditor({
  productId,
  features,
}: ProductFeaturesEditorProps) {
  const router = useRouter();

  const [newText, setNewText] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingText, setEditingText] =
    useState("");

  const [loadingAction, setLoadingAction] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  async function handleCreate() {
    const text = newText.trim();

    if (text.length < 2) {
      setError(
        "Escribe una característica válida.",
      );
      return;
    }

    setLoadingAction("create");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/features`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            text,
          }),
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
            "No fue posible crear la característica.",
        );
      }

      setNewText("");
      router.refresh();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "No fue posible crear la característica.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  function startEditing(
    feature: Feature,
  ) {
    setEditingId(feature.id);
    setEditingText(feature.text);
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingText("");
  }

  async function handleUpdate(
    featureId: string,
  ) {
    const text =
      editingText.trim();

    if (text.length < 2) {
      setError(
        "Escribe una característica válida.",
      );
      return;
    }

    setLoadingAction(
      `update-${featureId}`,
    );
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/features/${featureId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            text,
          }),
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
            "No fue posible actualizar la característica.",
        );
      }

      cancelEditing();
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "No fue posible actualizar la característica.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleDelete(
    feature: Feature,
  ) {
    const confirmed =
      window.confirm(
        `¿Seguro que quieres eliminar "${feature.text}"?`,
      );

    if (!confirmed) {
      return;
    }

    setLoadingAction(
      `delete-${feature.id}`,
    );
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/features/${feature.id}`,
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
            "No fue posible eliminar la característica.",
        );
      }

      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No fue posible eliminar la característica.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex gap-3">
          <input
            value={newText}
            placeholder="Ej: Tela Jacquard acolchada"
            onChange={(event) => {
              setNewText(
                event.target.value,
              );
              setError("");
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                event.preventDefault();
                void handleCreate();
              }
            }}
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />

          <button
            type="button"
            disabled={
              loadingAction ===
              "create"
            }
            onClick={() =>
              void handleCreate()
            }
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />

            {loadingAction ===
            "create"
              ? "Agregando..."
              : "Agregar"}
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Agrega beneficios o características
          comerciales que quieras destacar en
          la ficha pública.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      {features.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="font-bold text-slate-700">
            Este producto todavía no tiene
            características.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Puedes agregar elementos como
            material, tecnología, confort o
            beneficios del producto.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
          {features.map(
            (feature) => {
              const isEditing =
                editingId ===
                feature.id;

              const isUpdating =
                loadingAction ===
                `update-${feature.id}`;

              const isDeleting =
                loadingAction ===
                `delete-${feature.id}`;

              return (
                <div
                  key={feature.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check
                        size={15}
                      />
                    </span>

                    {isEditing ? (
                      <input
                        value={
                          editingText
                        }
                        autoFocus
                        onChange={(
                          event,
                        ) =>
                          setEditingText(
                            event.target
                              .value,
                          )
                        }
                        onKeyDown={(
                          event,
                        ) => {
                          if (
                            event.key ===
                            "Enter"
                          ) {
                            event.preventDefault();

                            void handleUpdate(
                              feature.id,
                            );
                          }

                          if (
                            event.key ===
                            "Escape"
                          ) {
                            cancelEditing();
                          }
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />
                    ) : (
                      <div>
                        <p className="font-semibold text-slate-800">
                          {feature.text}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Orden:{" "}
                          {
                            feature.sortOrder
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          disabled={
                            isUpdating
                          }
                          onClick={() =>
                            void handleUpdate(
                              feature.id,
                            )
                          }
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 transition hover:text-emerald-800 disabled:opacity-50"
                        >
                          <Check
                            size={16}
                          />

                          {isUpdating
                            ? "Guardando..."
                            : "Guardar"}
                        </button>

                        <button
                          type="button"
                          disabled={
                            isUpdating
                          }
                          onClick={
                            cancelEditing
                          }
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-slate-700"
                        >
                          <X
                            size={16}
                          />
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={
                            isDeleting
                          }
                          onClick={() =>
                            startEditing(
                              feature,
                            )
                          }
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 transition hover:text-slate-950 disabled:opacity-50"
                        >
                          <Pencil
                            size={15}
                          />
                          Editar
                        </button>

                        <button
                          type="button"
                          disabled={
                            isDeleting
                          }
                          onClick={() =>
                            void handleDelete(
                              feature,
                            )
                          }
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 transition hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2
                            size={15}
                          />

                          {isDeleting
                            ? "Eliminando..."
                            : "Eliminar"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}