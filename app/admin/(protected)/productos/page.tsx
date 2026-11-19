import Link from "next/link";

import { PageHeader } from "@/components/admin/PageHeader";
import { getAdminProducts } from "@/services/admin/products";

export const dynamic = "force-dynamic";

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminProductsPage() {
  const products =
    await getAdminProducts();

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Administra el catálogo completo de Incal."
        actions={
          <Link
            href="/admin/productos/nuevo"
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            + Nuevo producto
          </Link>
        }
      />

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-semibold text-slate-700">
            Todavía no hay productos.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Crea el primer producto desde el panel.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-extrabold text-slate-800">
                    Producto
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-extrabold text-slate-800">
                    Categoría
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-extrabold text-slate-800">
                    Precio
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-extrabold text-slate-800">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-extrabold text-slate-800">
                    Estado
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-extrabold text-slate-800">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const firstVariant =
                    product.variants[0];

                  const totalStock =
                    product.variants.reduce(
                      (total, variant) =>
                        total + variant.stock,
                      0,
                    );

                  const categoryNames =
                    product.categories
                      .map(
                        ({ category }) =>
                          category.name,
                      )
                      .join(", ");

                  const image =
                    product.images[0]?.url;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-slate-200 last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            {image ? (
  <img
    src={`/api/media?key=${encodeURIComponent(
      image,
    )}`}
    alt={product.name}
    className="h-full w-full object-cover"
  />
) : (
  <span className="text-xs font-bold text-slate-400">
    Sin foto
  </span>
)}
                          </div>

                          <div>
                            <p className="font-extrabold text-slate-900">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              /producto/{product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {categoryNames ||
                          "Sin categoría"}
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-900">
                        {firstVariant
                          ? formatPrice(
                              firstVariant.price,
                            )
                          : "Sin precio"}
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-900">
                        {product.variants.length > 0
                          ? totalStock
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-xs font-extrabold",
                            product.status ===
                            "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-700"
                              : product.status ===
                                  "ARCHIVED"
                                ? "bg-slate-200 text-slate-600"
                                : "bg-amber-100 text-amber-700",
                          ].join(" ")}
                        >
                          {product.status ===
                          "PUBLISHED"
                            ? "Publicado"
                            : product.status ===
                                "ARCHIVED"
                              ? "Archivado"
                              : "Borrador"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/productos/${product.id}/editar`}
                          className="text-sm font-bold text-slate-700 hover:text-slate-950"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}