"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

type CategoryOption = {
  id: string;
  name: string;
  parentName?: string;
};

type ProductFormInitialData = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  categoryId: string;
  status:
    | "DRAFT"
    | "PUBLISHED"
    | "ARCHIVED";
};

type ProductFormProps = {
  categories: CategoryOption[];
  initialData?: ProductFormInitialData;
};

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({
  categories,
  initialData,
}: ProductFormProps) {
  const router = useRouter();

  const isEditing =
    Boolean(initialData?.id);

  const [name, setName] = useState(
    initialData?.name ?? "",
  );

  const [slug, setSlug] = useState(
    initialData?.slug ?? "",
  );

  const [slugEdited, setSlugEdited] =
    useState(Boolean(initialData));

  const [description, setDescription] =
    useState(
      initialData?.description ?? "",
    );

  const [brand, setBrand] = useState(
    initialData?.brand ?? "",
  );

  const [categoryId, setCategoryId] =
    useState(
      initialData?.categoryId ?? "",
    );

  const [status, setStatus] = useState<
    "DRAFT" | "PUBLISHED" | "ARCHIVED"
  >(
    initialData?.status ?? "DRAFT",
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!slugEdited) {
      setSlug(createSlug(name));
    }
  }, [name, slugEdited]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const endpoint = isEditing
        ? `/api/admin/products/${initialData?.id}`
        : "/api/admin/products";

      const response = await fetch(
        endpoint,
        {
          method: isEditing
            ? "PATCH"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            slug: createSlug(slug),
            description:
              description.trim(),
            brand: brand.trim(),
            categoryId,
            status,
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
            "No fue posible guardar el producto.",
        );
      }

      if (initialData?.id) {
        router.push(
          `/admin/productos/${initialData.id}/editar`,
        );
      } else {
        router.push(
          "/admin/productos",
        );
      }

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No fue posible guardar el producto.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <label
          htmlFor="product-name"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Nombre del producto
        </label>

        <input
          id="product-name"
          value={name}
          required
          placeholder="Ej: Camisa de lino negra"
          onChange={(event) => {
            setName(
              event.target.value,
            );
            setError("");
          }}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      <div>
        <label
          htmlFor="product-slug"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Slug
        </label>

        <input
          id="product-slug"
          value={slug}
          required
          placeholder="camisa-de-lino-negra"
          onChange={(event) => {
            setSlug(
              createSlug(
                event.target.value,
              ),
            );
            setSlugEdited(true);
            setError("");
          }}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />

        <p className="mt-2 text-xs text-slate-500">
          Dirección pública: /producto/
          {slug ||
            "nombre-del-producto"}
        </p>
      </div>

      <div>
        <label
          htmlFor="product-category"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Categoría
        </label>

        <select
          id="product-category"
          value={categoryId}
          required
          onChange={(event) => {
            setCategoryId(
              event.target.value,
            );
            setError("");
          }}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        >
          <option value="">
            Selecciona una categoría
          </option>

          {categories.map(
            (category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.parentName
                  ? `${category.parentName} → ${category.name}`
                  : category.name}
              </option>
            ),
          )}
        </select>
      </div>

      <div>
        <label
          htmlFor="product-brand"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Marca
        </label>

        <input
          id="product-brand"
          value={brand}
          onChange={(event) =>
            setBrand(
              event.target.value,
            )
          }
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      <div>
        <label
          htmlFor="product-description"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Descripción
        </label>

        <textarea
          id="product-description"
          value={description}
          placeholder="Describe las características principales del producto."
          onChange={(event) =>
            setDescription(
              event.target.value,
            )
          }
          className="min-h-40 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      <div>
        <label
          htmlFor="product-status"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          Estado
        </label>

        <select
          id="product-status"
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value as
                | "DRAFT"
                | "PUBLISHED"
                | "ARCHIVED",
            )
          }
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        >
          <option value="DRAFT">
            Borrador
          </option>

          <option value="PUBLISHED">
            Publicado
          </option>

          <option value="ARCHIVED">
            Archivado
          </option>
        </select>

        <p className="mt-2 text-xs text-slate-500">
          Publica el producto cuando tenga
          precio, stock e información
          completa.
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

      <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear producto"}
        </button>

        <Link
          href={
            initialData
              ? `/admin/productos/${initialData.id}/editar`
              : "/admin/productos"
          }
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}