"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";

import {
  VariantOptionsBuilder,
  type StoreVariantDraft,
} from "@/components/admin/VariantOptionsBuilder";

type ExistingVariant = StoreVariantDraft;

type Props = {
  productId: string;
  initialVariants: (
    Omit<
      StoreVariantDraft,
      "price" | "stock" | "updatedAt"
    > & {
      id: string;
      price: number;
      stock: number;
      updatedAt: string;
    }
  )[];
  prefix: string;
};

export function InventoryVariantsEditor({
  productId,
  initialVariants,
  prefix,
}: Props) {
  const router = useRouter();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const operationLock = useRef(false);
  const originalVariants = useRef(
  new Map(
    initialVariants.map((variant) => [
      variant.id,
      {
        ...variant,
        price: String(variant.price),
        stock: String(variant.stock),
      },
    ]),
  ),
);

  const [rows, setRows] = useState<ExistingVariant[]>(
    initialVariants.map((v) => ({
      ...v,
      price: String(v.price),
      stock: String(v.stock),
    })),
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [selectedVariant, setSelectedVariant] =
    useState<ExistingVariant | null>(null);

  const [deleteError, setDeleteError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const busy = saving || deleting;

  const input =
    "w-full min-w-20 rounded-lg border border-[#E8E5DF] px-3 py-2 text-sm outline-none focus:border-[#C3AA84] disabled:opacity-60";

  function change(
    i: number,
    patch: Partial<ExistingVariant>,
  ) {
    setRows((prev) =>
      prev.map((v, j) =>
        i === j ? { ...v, ...patch } : v,
      ),
    );
  }

  function openDelete(row: ExistingVariant) {
    if (operationLock.current) return;

    setDeleteError("");
    setSelectedVariant(row);
    dialogRef.current?.showModal();
  }

  function closeDelete() {
    if (operationLock.current) return;

    dialogRef.current?.close();
    setSelectedVariant(null);
    setDeleteError("");
  }

  async function deleteVariant() {
    if (
      !selectedVariant?.id ||
      operationLock.current
    ) {
      return;
    }

    const variantId = selectedVariant.id;

    operationLock.current = true;
    setDeleting(true);
    setDeleteError("");
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/variants/${variantId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json().catch(
        () => null,
      );

      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.message ||
            "No fue posible eliminar la variante.",
        );
      }

      originalVariants.current.delete(variantId);

setRows((prev) =>
  prev.filter((row) => row.id !== variantId),
);

      dialogRef.current?.close();
      setSelectedVariant(null);

      setMessage("Variante eliminada correctamente.");

      router.refresh();
    } catch (e) {
      setDeleteError(
        e instanceof Error
          ? e.message
          : "Ocurrió un error inesperado.",
      );
    } finally {
      operationLock.current = false;
      setDeleting(false);
    }
  }

 async function save() {
  if (operationLock.current) return;

  setError("");
  setMessage("");

  // Detectar las variantes nuevas o modificadas.

  const changedRows = rows.filter((row) => {
    if (!row.id) return true;

    const original = originalVariants.current.get(row.id);

    if (!original) return true;

    return (
      row.name.trim() !== original.name.trim() ||
      row.sku.trim().toUpperCase() !==
        original.sku.trim().toUpperCase() ||
      Number(row.price) !== Number(original.price) ||
      Number(row.stock) !== Number(original.stock) ||
      row.isActive !== original.isActive ||
      JSON.stringify(row.attributes) !==
        JSON.stringify(original.attributes)
    );
  });

  if (changedRows.length === 0) {
    setMessage("No hay cambios pendientes por guardar.");
    return;
  }

  // Validar las variantes modificadas.

  if (
    changedRows.some(
      (v) =>
        v.name.trim().length < 2 ||
        v.sku.trim().length < 2 ||
        !v.price.trim() ||
        !v.stock.trim() ||
        !Number.isInteger(Number(v.price)) ||
        Number(v.price) < 0 ||
        Number(v.price) > 2147483647 ||
        !Number.isInteger(Number(v.stock)) ||
        Number(v.stock) < 0 ||
        Number(v.stock) > 2147483647,
    )
  ) {
    setError("Revisa nombre, SKU, precio y stock.");
    return;
  }

  if (
    new Set(
      rows.map((v) => v.sku.trim().toUpperCase()),
    ).size !== rows.length
  ) {
    setError("Los SKU no pueden repetirse.");
    return;
  }

  if (changedRows.length > 100) {
    setError(
      "Puedes guardar un máximo de 100 variantes modificadas por operación.",
    );
    return;
  }

  if (
    changedRows.some(
      (row) =>
        row.id &&
        !originalVariants.current.get(row.id)?.updatedAt,
    )
  ) {
    setError(
      "Falta la versión original de una variante. Recarga la página.",
    );
    return;
  }

  operationLock.current = true;
  setSaving(true);

  try {
    const response = await fetch(
      `/api/admin/products/${productId}/variants/bulk`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          variants: changedRows.map((row) => ({
            id: row.id,

            updatedAt: row.id
              ? originalVariants.current.get(row.id)?.updatedAt
              : undefined,

            name: row.name.trim(),
            sku: row.sku.trim().toUpperCase(),
            price: Number(row.price),
            stock: Number(row.stock),
            isActive: row.isActive,
            attributes: row.attributes,
          })),
        }),
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.ok) {
      throw new Error(
        data?.message ||
          "No fue posible guardar el inventario.",
      );
    }

    if (!Array.isArray(data.variants)) {
      throw new Error(
        "No se recibió el inventario actualizado. Recarga la página.",
      );
    }

    const savedRows = data.variants.map(
      (variant: Props["initialVariants"][number]) => ({
        ...variant,
        price: String(variant.price),
        stock: String(variant.stock),
      }),
    ) as (
      ExistingVariant & {
        id: string;
        updatedAt: string;
      }
    )[];

    // Sincronizar las variantes y sus versiones originales.

    originalVariants.current = new Map(
      savedRows.map((variant) => [
        variant.id,
        variant,
      ]),
    );

    setRows(savedRows);

    setMessage(
      data.message ||
        "Inventario guardado correctamente.",
    );

    router.refresh();
 } catch (e) {
  setError(
    e instanceof Error
      ? e.message
      : "Ocurrió un error inesperado. Recarga la página antes de reintentar.",
  );
} finally {
    operationLock.current = false;
    setSaving(false);
  }
}
  return (
    <div className="space-y-4">
      <fieldset
        disabled={busy}
        className="min-w-0 space-y-4"
      >
        <VariantOptionsBuilder
  variants={rows}
  onChange={setRows}
  defaultSkuPrefix={prefix}
/>

        <div className="overflow-x-auto rounded-xl border border-[#E8E5DF]">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-[#F7F6F3]">
              <tr className="border-b border-[#E8E5DF] text-left">
                <th className="p-3">Variante</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Precio CLP</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Activa</th>
                <th className="p-3 text-right">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id ?? `new-${i}`}
                  className="border-b border-[#E8E5DF] align-top last:border-b-0"
                >
                  <td className="p-3">
                    <input
                      className={input}
                      value={row.name}
                      onChange={(e) =>
                        change(i, {
                          name: e.target.value,
                        })
                      }
                    />

                    <span className="mt-1 block text-xs text-neutral-500">
                      {row.attributes
                        .map(
                          (a) =>
                            `${a.name}: ${a.value}`,
                        )
                        .join(" · ")}
                    </span>
                  </td>

                  <td className="p-3">
                    <input
                      className={input}
                      value={row.sku}
                      onChange={(e) =>
                        change(i, {
                          sku: e.target.value,
                        })
                      }
                    />
                  </td>

                  <td className="p-3">
                    <input
                      className={input}
                      type="number"
                      min="0"
                      value={row.price}
                      onChange={(e) =>
                        change(i, {
                          price: e.target.value,
                        })
                      }
                    />
                  </td>

                  <td className="p-3">
                    <input
                      className={input}
                      type="number"
                      min="0"
                      value={row.stock}
                      onChange={(e) =>
                        change(i, {
                          stock: e.target.value,
                        })
                      }
                    />
                  </td>

                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={row.isActive}
                      aria-label={`Activar variante ${row.name}`}
                      className="size-4 accent-[#101010]"
                      onChange={(e) =>
                        change(i, {
                          isActive: e.target.checked,
                        })
                      }
                    />
                  </td>

                  <td className="p-3 text-right">
                    {row.id ? (
                      <button
                        type="button"
                        title="Eliminar variante"
                        aria-label={`Eliminar variante ${row.name}`}
                        onClick={() => openDelete(row)}
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-[#E8E5DF] text-red-600 transition hover:border-red-300 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-sm font-medium text-red-600"
                        onClick={() =>
                          setRows((prev) =>
                            prev.filter(
                              (_, j) => j !== i,
                            ),
                          )
                        }
                      >
                        Quitar
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-neutral-500"
                  >
                    No hay variantes registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-600">
            Stock total:{" "}
            <strong>
              {rows
                .filter((r) => r.isActive)
                .reduce(
                  (n, r) =>
                    n + (Number(r.stock) || 0),
                  0,
                )}
            </strong>{" "}
            unidades
          </p>

          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="inline-flex items-center gap-2 rounded-lg bg-[#101010] px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {saving && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {saving
              ? "Guardando..."
              : "Guardar variantes e inventario"}
          </button>
        </div>
      </fieldset>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="text-sm text-emerald-700"
        >
          {message}
        </p>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-variant-title"
        onCancel={(event) => {
          event.preventDefault();
          closeDelete();
        }}
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[#E8E5DF] bg-white p-6 shadow-2xl backdrop:bg-black/60"
      >
        {selectedVariant && (
          <>
            <div className="mb-5 flex items-start justify-between">
              <div className="flex size-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle size={24} />
              </div>

              <button
                type="button"
                aria-label="Cerrar confirmación"
                disabled={deleting}
                onClick={closeDelete}
                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100"
              >
                <X size={20} />
              </button>
            </div>

            <h2
              id="delete-variant-title"
              className="text-xl font-bold text-[#101010]"
            >
              Eliminar variante
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              Esta acción es permanente. Las
              variantes con pedidos asociados no
              pueden eliminarse, pero pueden
              desactivarse.
            </p>

            <div className="mt-4 rounded-lg border border-[#E8E5DF] bg-[#F7F6F3] p-4">
              <p className="text-xs text-neutral-500">
                Variante seleccionada
              </p>

              <p className="mt-1 font-semibold">
                {selectedVariant.name}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                SKU: {selectedVariant.sku}
              </p>
            </div>

            {deleteError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={closeDelete}
                className="rounded-lg border border-[#E8E5DF] px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-[#F7F6F3]"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={deleteVariant}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {deleting
                  ? "Eliminando..."
                  : "Eliminar definitivamente"}
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}