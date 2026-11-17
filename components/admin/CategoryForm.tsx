"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

type ParentCategoryOption = {
  id: string;
  name: string;
};

type CategoryFormProps = {
  parentCategories: ParentCategoryOption[];
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

export function CategoryForm({
  parentCategories,
}: CategoryFormProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [slugEdited, setSlugEdited] =
    useState(false);

  const [description, setDescription] =
    useState("");

  const [parentId, setParentId] =
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

    if (!name.trim()) {
      setError(
        "Debes ingresar el nombre de la categoría.",
      );
      return;
    }

    if (!slug.trim()) {
      setError(
        "No fue posible generar un slug válido.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/categories",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            slug: createSlug(slug),
            description:
              description.trim() ||
              undefined,
            parentId:
              parentId || null,
          }),
        },
      );

      const result = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message ??
            "No fue posible guardar la categoría.",
        );
      }

      router.push(
        "/admin/categorias",
      );
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No fue posible guardar la categoría.",
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
          htmlFor="category-name"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Nombre
        </label>

        <input
          id="category-name"
          value={name}
          required
          placeholder="Ej: Camas europeas"
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      <div>
        <label
          htmlFor="category-slug"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Slug
        </label>

        <input
          id="category-slug"
          value={slug}
          required
          placeholder="camas-europeas"
          onChange={(event) => {
            setSlug(
              createSlug(event.target.value),
            );
            setSlugEdited(true);
            setError("");
          }}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />

        <p className="mt-2 text-xs text-slate-500">
          Se genera automáticamente y se usa en
          la dirección web.
        </p>
      </div>

      <div>
        <label
          htmlFor="category-parent"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Categoría superior
        </label>

        <select
          id="category-parent"
          value={parentId}
          onChange={(event) =>
            setParentId(
              event.target.value,
            )
          }
          className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        >
          <option value="">
            Ninguna — categoría principal
          </option>

          {parentCategories.map(
            (category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ),
          )}
        </select>

        <p className="mt-2 text-xs text-slate-500">
          Selecciona una categoría superior para
          crear una subcategoría.
        </p>
      </div>

      <div>
        <label
          htmlFor="category-description"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Descripción
        </label>

        <textarea
          id="category-description"
          value={description}
          placeholder="Descripción breve para el catálogo."
          onChange={(event) =>
            setDescription(
              event.target.value,
            )
          }
          className="h-32 w-full resize-y rounded-xl border border-slate-300 bg-white p-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Guardando..."
            : "Guardar categoría"}
        </button>

        <Link
          href="/admin/categorias"
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}