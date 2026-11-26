import { requireAdminPage } from "@/lib/auth/require-admin-page";
import {
  ADMIN_PERMISSIONS,
  hasAdminPermission,
} from "@/lib/auth/admin-permissions";

import Link from "next/link";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/admin/PageHeader";
import ProductCategoryFilters from "@/components/admin/ProductCategoryFilters";
import { getAdminProducts } from "@/services/admin/products";
import { getMediaUrl } from "@/lib/media-url";
import { prisma } from "@/lib/prisma";
import ProductActions from "@/components/admin/ProductActions";

import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  PackageSearch,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

const selectClass =
  "h-11 w-full rounded-lg border border-[#E8E5DF] bg-white px-3 text-sm outline-none focus:border-[#C3AA84]";

const headerClass =
  "px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-600";

type SearchParams = {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  status?: string;
  stock?: string;
  sort?: string;
  page?: string;
  pageSize?: string;
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const admin = await requireAdminPage(
  ADMIN_PERMISSIONS.PRODUCTS_VIEW,
);

const canDelete = hasAdminPermission(
  admin.role,
  ADMIN_PERMISSIONS.PRODUCTS_DELETE,
);

const params = await searchParams;

  const search =
    typeof params.search === "string"
      ? params.search.trim().slice(0, 200)
      : "";

  const categoryId =
    typeof params.categoryId === "string"
      ? params.categoryId
      : "";

  const subcategoryId =
    typeof params.subcategoryId === "string"
      ? params.subcategoryId
      : "";

  const status =
    params.status === "PUBLISHED" ||
    params.status === "DRAFT" ||
    params.status === "ARCHIVED"
      ? params.status
      : undefined;

  const stock =
    params.stock === "available" ||
    params.stock === "out" ||
    params.stock === "low"
      ? params.stock
      : undefined;

  const sort =
    params.sort === "newest" ||
    params.sort === "oldest" ||
    params.sort === "name-asc" ||
    params.sort === "name-desc"
      ? params.sort
      : "newest";

  const requestedPage = Number(params.page);

  const page =
    Number.isSafeInteger(requestedPage) &&
    requestedPage > 0
      ? Math.min(requestedPage, 100000)
      : 1;

  const pageSize = [20, 50, 100].includes(
    Number(params.pageSize),
  )
    ? Number(params.pageSize)
    : 20;

  const [result, categories] = await Promise.all([
    getAdminProducts({
      search,
      categoryId,
      subcategoryId,
      status,
      stock,
      sort,
      page,
      pageSize,
    }),

    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const { products, total, totalPages } = result;

  function getPageUrl(targetPage: number) {
    const query = new URLSearchParams();

    if (search) query.set("search", search);
    if (categoryId) query.set("categoryId", categoryId);
    if (subcategoryId)
      query.set("subcategoryId", subcategoryId);
    if (status) query.set("status", status);
    if (stock) query.set("stock", stock);

    query.set("sort", sort);
    query.set("pageSize", String(pageSize));
    query.set("page", String(targetPage));

    return `/admin/productos?${query.toString()}`;
  }

  if (page > totalPages) {
    redirect(getPageUrl(totalPages));
  }

  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) =>
      Math.max(1, Math.min(page - 2, totalPages - 4)) +
      index,
  );

  const hasFilters = Boolean(
    search ||
    categoryId ||
    subcategoryId ||
    status ||
    stock,
  );

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Administra el catálogo completo de The Black Store."
        actions={
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 rounded-xl bg-[#101010] px-5 py-3 font-semibold text-white transition hover:bg-neutral-800"
          >
            <Plus size={18} />
            Nuevo producto
          </Link>
        }
      />

      {/* FILTROS */}

      <section className="mb-6 rounded-xl border border-[#E8E5DF] bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal
            size={18}
            className="text-[#C3AA84]"
          />

          <h2 className="font-semibold text-[#101010]">
            Buscar y filtrar productos
          </h2>
        </div>

        <form
          action="/admin/productos"
          method="GET"
          className="space-y-4"
        >
          <div className="relative">
            <Search
              size={19}
              className="absolute left-3 top-3.5 text-neutral-400"
            />

            <input
              name="search"
              aria-label="Buscar productos"
              defaultValue={search}
              placeholder="Buscar por nombre, SKU o código..."
              className="h-12 w-full rounded-lg border border-[#E8E5DF] bg-[#F7F6F3] pl-10 pr-4 text-sm outline-none focus:border-[#C3AA84]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            <ProductCategoryFilters
              key={`${categoryId}:${subcategoryId}`}
              categories={categories}
              initialCategoryId={categoryId}
              initialSubcategoryId={subcategoryId}
            />

            <select
              name="status"
              aria-label="Estado del producto"
              defaultValue={status ?? ""}
              className={selectClass}
            >
              <option value="">Todos los estados</option>
              <option value="PUBLISHED">Publicados</option>
              <option value="DRAFT">Borradores</option>
              <option value="ARCHIVED">Archivados</option>
            </select>

            <select
              name="stock"
              aria-label="Disponibilidad de inventario"
              defaultValue={stock ?? ""}
              className={selectClass}
            >
              <option value="">Todo el inventario</option>
              <option value="available">
                Con disponibilidad
              </option>
              <option value="out">
                Sin disponibilidad
              </option>
              <option value="low">Stock bajo</option>
            </select>

            <select
              name="sort"
              aria-label="Ordenar productos"
              defaultValue={sort}
              className={selectClass}
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="name-asc">Nombre: A - Z</option>
              <option value="name-desc">Nombre: Z - A</option>
            </select>

            <select
              name="pageSize"
              aria-label="Productos por página"
              defaultValue={pageSize}
              className={selectClass}
            >
              <option value="20">20 por página</option>
              <option value="50">50 por página</option>
              <option value="100">100 por página</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">
              <span className="font-semibold text-[#101010]">
                {total}
              </span>{" "}
              productos encontrados
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/productos"
                className="rounded-lg border border-[#E8E5DF] px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-[#F7F6F3]"
              >
                Limpiar filtros
              </Link>

              <button
                type="submit"
                className="rounded-lg bg-[#101010] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* TABLA DE PRODUCTOS */}

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E8E5DF] bg-white p-12 text-center">
          <PackageSearch
            size={42}
            className="mx-auto mb-4 text-neutral-400"
          />

          <p className="font-semibold text-[#101010]">
            {hasFilters
              ? "No encontramos productos."
              : "Todavía no hay productos."}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            {hasFilters
              ? "Prueba modificando los filtros de búsqueda."
              : "Crea el primer producto desde el panel."}
          </p>

          <Link
            href={
              hasFilters
                ? "/admin/productos"
                : "/admin/productos/nuevo"
            }
            className="mt-5 inline-flex rounded-lg bg-[#101010] px-4 py-2.5 text-sm font-semibold text-white"
          >
            {hasFilters
              ? "Limpiar filtros"
              : "Crear producto"}
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E8E5DF] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="border-b border-[#E8E5DF] bg-[#F7F6F3]">
                <tr>
                  <th className={headerClass}>Producto</th>
                  <th className={headerClass}>Categoría</th>
                  <th className={headerClass}>Precio</th>
                  <th className={headerClass}>Inventario</th>
                  <th className={headerClass}>Estado</th>
                  <th className={`${headerClass} text-right`}>
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map(product => {
                  const variants = product.variants;
                  const firstVariant = variants[0];

                  const trackedVariants = variants.filter(
                    variant => variant.manageInventory,
                  );

                  const totalStock = trackedVariants.reduce(
                    (total, variant) =>
                      total + Math.max(0, variant.stock),
                    0,
                  );

                  const sellableVariants = variants.filter(
                    variant => variant.price > 0,
                  );

                  const hasAvailability =
                    sellableVariants.some(
                      variant =>
                        !variant.manageInventory ||
                        variant.allowBackorder ||
                        variant.stock > 0,
                    );

                  const hasLowStock = trackedVariants.some(
                    variant =>
                      variant.stock >= 1 &&
                      variant.stock <= 5,
                  );

                  const hasBackorder =
                    sellableVariants.some(
                      variant =>
                        variant.manageInventory &&
                        variant.allowBackorder,
                    );

                  const hasUnlimitedStock =
                    sellableVariants.some(
                      variant => !variant.manageInventory,
                    );

                  const prices = sellableVariants.map(
                    variant => variant.price,
                  );

                  const minPrice = prices.length
                    ? Math.min(...prices)
                    : null;

                  const maxPrice = prices.length
                    ? Math.max(...prices)
                    : null;

                  const mainCategoryNames = [
                    ...new Set(
                      product.categories
                        .map(({ category }) =>
                          category.parentId
                            ? category.parent?.name
                            : category.name,
                        )
                        .filter(Boolean),
                    ),
                  ];

                  const subcategoryNames = [
                    ...new Set(
                      product.categories
                        .filter(
                          ({ category }) =>
                            category.parentId !== null,
                        )
                        .map(
                          ({ category }) => category.name,
                        ),
                    ),
                  ];

                  const image = getMediaUrl(
                    product.images[0]?.url,
                  );

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-[#E8E5DF] transition last:border-b-0 hover:bg-[#F7F6F3]/60"
                    >
                      {/* PRODUCTO */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E8E5DF] bg-[#F7F6F3]">
                            {image ? (
                              <img
                                src={image}
                                alt={product.name}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-neutral-400">
                                Sin foto
                              </span>
                            )}
                          </div>

                          <div>
                            <Link
                              href={`/admin/productos/${product.id}/editar`}
                              className="font-semibold text-[#101010] hover:underline"
                            >
                              {product.name}
                            </Link>

                            <p className="mt-1 text-xs text-neutral-500">
                              SKU: {firstVariant?.sku ?? "—"}
                            </p>

                            <p className="mt-1 text-xs text-neutral-400">
                              {variants.length}{" "}
                              {variants.length === 1
                                ? "variante activa"
                                : "variantes activas"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORÍA */}

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#101010]">
                          {mainCategoryNames.join(", ") ||
                            "Sin categoría"}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          {subcategoryNames.join(", ") ||
                            "Sin subcategoría"}
                        </p>
                      </td>

                      {/* PRECIO */}

                      <td className="px-5 py-4">
                        {minPrice === null ? (
                          <span className="text-sm text-neutral-400">
                            Sin precio
                          </span>
                        ) : (
                          <div className="whitespace-nowrap">
                            <p className="text-sm font-bold text-[#101010]">
                              {formatPrice(minPrice)}
                            </p>

                            {maxPrice !== null &&
                              maxPrice !== minPrice && (
                                <p className="mt-1 text-xs text-neutral-500">
                                  Hasta {formatPrice(maxPrice)}
                                </p>
                              )}
                          </div>
                        )}
                      </td>

                      {/* INVENTARIO */}

                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-1">
                          {trackedVariants.length > 0 && (
                            <p className="text-sm font-bold text-[#101010]">
                              {totalStock} uds.
                            </p>
                          )}

                          {variants.length === 0 ? (
                            <span className="text-xs text-neutral-400">
                              Sin variantes activas
                            </span>
                          ) : !hasAvailability ? (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                              Sin disponibilidad
                            </span>
                          ) : hasLowStock ? (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              Stock bajo
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              Disponible
                            </span>
                          )}

                          {hasBackorder && (
                            <span className="text-xs font-medium text-blue-700">
                              Permite pedidos sin stock
                            </span>
                          )}

                          {hasUnlimitedStock && (
                            <span className="text-xs text-neutral-500">
                              Sin control de stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ESTADO */}

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                            product.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-700"
                              : product.status === "ARCHIVED"
                                ? "bg-neutral-200 text-neutral-600"
                                : "bg-amber-100 text-amber-700",
                          ].join(" ")}
                        >
                          {product.status === "PUBLISHED"
                            ? "Publicado"
                            : product.status === "ARCHIVED"
                              ? "Archivado"
                              : "Borrador"}
                        </span>
                      </td>

                      {/* ACCIONES */}

<td className="px-5 py-4">
 <ProductActions
  productId={product.id}
  productName={product.name}
  status={product.status}
  canDelete={canDelete}
/>
</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINACIÓN */}

      {total > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E8E5DF] bg-white p-4">
          <p className="text-sm text-neutral-500">
            Mostrando{" "}
            <span className="font-semibold text-[#101010]">
              {(page - 1) * pageSize + 1}
              {" - "}
              {(page - 1) * pageSize + products.length}
            </span>
            {" de "}
            {total} productos
          </p>

          <nav
            aria-label="Paginación de productos"
            className="flex flex-wrap items-center gap-2"
          >
            {page > 1 && (
              <Link
                href={getPageUrl(page - 1)}
                className="flex h-9 items-center gap-1 rounded-lg border border-[#E8E5DF] px-3 text-sm hover:bg-[#F7F6F3]"
              >
                <ChevronLeft size={16} />
                Anterior
              </Link>
            )}

            {visiblePages.map(pageNumber => (
              <Link
                key={pageNumber}
                href={getPageUrl(pageNumber)}
                aria-current={
                  pageNumber === page ? "page" : undefined
                }
                className={[
                  "flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition",
                  pageNumber === page
                    ? "border-[#101010] bg-[#101010] text-white"
                    : "border-[#E8E5DF] bg-white text-neutral-600 hover:bg-[#F7F6F3]",
                ].join(" ")}
              >
                {pageNumber}
              </Link>
            ))}

            {page < totalPages && (
              <Link
                href={getPageUrl(page + 1)}
                className="flex h-9 items-center gap-1 rounded-lg border border-[#E8E5DF] px-3 text-sm hover:bg-[#F7F6F3]"
              >
                Siguiente
                <ChevronRight size={16} />
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
