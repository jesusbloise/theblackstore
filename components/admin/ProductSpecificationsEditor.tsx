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

type Specification = {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
};

type ProductSpecificationsEditorProps = {
  productId: string;
  specifications: Specification[];
};

export function ProductSpecificationsEditor({
  productId,
  specifications,
}: ProductSpecificationsEditorProps) {
  const router = useRouter();

  const [newLabel, setNewLabel] =
    useState("");

  const [newValue, setNewValue] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingLabel, setEditingLabel] =
    useState("");

  const [editingValue, setEditingValue] =
    useState("");

  const [loadingAction, setLoadingAction] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  async function handleCreate() {
    const label = newLabel.trim();
    const value = newValue.trim();

    if (label.length < 2) {
      setError(
        "Escribe un nombre de especificación válido.",
      );
      return;
    }

    if (!value) {
      setError(
        "Escribe el valor de la especificación.",
      );
      return;
    }

    setLoadingAction("create");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/specifications`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            label,
            value,
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
            "No fue posible crear la especificación.",
        );
      }

      setNewLabel("");
      setNewValue("");
      router.refresh();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "No fue posible crear la especificación.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  function startEditing(
    specification: Specification,
  ) {
    setEditingId(
      specification.id,
    );

    setEditingLabel(
      specification.label,
    );

    setEditingValue(
      specification.value,
    );

    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingLabel("");
    setEditingValue("");
  }

  async function handleUpdate(
    specificationId: string,
  ) {
    const label =
      editingLabel.trim();

    const value =
      editingValue.trim();

    if (label.length < 2) {
      setError(
        "Escribe un nombre de especificación válido.",
      );
      return;
    }

    if (!value) {
      setError(
        "Escribe el valor de la especificación.",
      );
      return;
    }

    setLoadingAction(
      `update-${specificationId}`,
    );
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/specifications/${specificationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            label,
            value,
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
            "No fue posible actualizar la especificación.",
        );
      }

      cancelEditing();
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "No fue posible actualizar la especificación.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleDelete(
    specification: Specification,
  ) {
    const confirmed =
      window.confirm(
        `¿Seguro que quieres eliminar "${specification.label}: ${specification.value}"?`,
      );

    if (!confirmed) {
      return;
    }

    setLoadingAction(
      `delete-${specification.id}`,
    );
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/specifications/${specification.id}`,
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
            "No fue posible eliminar la especificación.",
        );
      }

      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No fue posible eliminar la especificación.",
      );
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto]">
          <input
            value={newLabel}
            placeholder="Ej: Garantía"
            onChange={(event) => {
              setNewLabel(
                event.target.value,
              );
              setError("");
            }}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />

          <input
            value={newValue}
            placeholder="Ej: 10 años"
            onChange={(event) => {
              setNewValue(
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
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />

            {loadingAction ===
            "create"
              ? "Agregando..."
              : "Agregar"}
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Carga los datos técnicos que
          aparecerán en la ficha pública.
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

      {specifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="font-bold text-slate-700">
            Este producto todavía no tiene
            especificaciones.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Agrega información como
            estructura, materiales, garantía,
            fabricación o procedencia.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          {specifications.map(
            (specification) => {
              const isEditing =
                editingId ===
                specification.id;

              const isUpdating =
                loadingAction ===
                `update-${specification.id}`;

              const isDeleting =
                loadingAction ===
                `delete-${specification.id}`;

              return (
                <div
                  key={
                    specification.id
                  }
                  className="grid gap-4 border-b border-slate-200 p-4 last:border-b-0 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] md:items-center"
                >
                  {isEditing ? (
                    <>
                      <input
                        value={
                          editingLabel
                        }
                        autoFocus
                        onChange={(
                          event,
                        ) =>
                          setEditingLabel(
                            event.target
                              .value,
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-semibold outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                      />

                      <input
                        value={
                          editingValue
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditingValue(
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
                              specification.id,
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

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={
                            isUpdating
                          }
                          onClick={() =>
                            void handleUpdate(
                              specification.id,
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
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="font-bold text-slate-900">
                          {
                            specification.label
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Orden:{" "}
                          {
                            specification.sortOrder
                          }
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        {
                          specification.value
                        }
                      </p>

                      <div className="flex items-center justify-start gap-3 md:justify-end">
                        <button
                          type="button"
                          disabled={
                            isDeleting
                          }
                          onClick={() =>
                            startEditing(
                              specification,
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
                              specification,
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
                      </div>
                    </>
                  )}
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
