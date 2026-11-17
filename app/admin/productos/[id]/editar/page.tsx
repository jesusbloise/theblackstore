import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteVariantButton } from "@/components/admin/DeleteVariantButton";
import {
  ImageGallery,
  ImageUploader,
} from "@/components/admin/media";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories } from "@/services/admin/categories";
import { getAdminProductById } from "@/services/admin/products";
import { ProductFeaturesEditor } from "@/components/admin/ProductFeaturesEditor";
import { ProductSpecificationsEditor } from "@/components/admin/ProductSpecificationsEditor";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] =
    await Promise.all([
      getAdminProductById(id),
      getCategories(),
    ]);

  if (!product) {
    notFound();
  }

  const category =
    product.categories[0]?.category;

  const categoryOptions = categories
    .filter(
      (item) => item.isActive,
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      parentName:
        item.parent?.name ??
        undefined,
    }));

  return (
    <div>
      <PageHeader
        title={product.name}
        description="Edita la información, variantes, precios e inventario del producto."
        actions={
          <Link
            href="/admin/productos"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Volver a productos
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {/* INFORMACIÓN GENERAL */}

          <section className="rounded-2xl border border-slate-200 bg-white p-7">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900">
                Información general
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Edita los datos principales y el estado público del producto.
              </p>
            </div>

            <ProductForm
              categories={categoryOptions}
              initialData={{
                id: product.id,
                name: product.name,
                slug: product.slug,

                description:
                  product.description ??
                  undefined,

                brand:
                  product.brand ??
                  "Incal",

                categoryId:
                  category?.id ?? "",

                status:
                  product.status,
              }}
            />
          </section>

          {/* VARIANTES */}

          <section className="rounded-2xl border border-slate-200 bg-white p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Variantes
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Medidas, SKU, precios, dimensiones y stock del producto.
                </p>
              </div>

              <Link
                href={`/admin/productos/${product.id}/variantes/nueva`}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                + Nueva variante
              </Link>
            </div>

            {product.variants.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-bold text-slate-700">
                  Este producto todavía no tiene variantes.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Agrega una variante para definir SKU, precio, medidas y stock.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[850px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-extrabold text-slate-800">
                        Variante
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-extrabold text-slate-800">
                        SKU
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-extrabold text-slate-800">
                        Precio
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-extrabold text-slate-800">
                        Stock
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-extrabold text-slate-800">
                        Estado
                      </th>

                      <th className="px-4 py-3 text-right text-sm font-extrabold text-slate-800">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {product.variants.map(
                      (variant) => (
                        <tr
                          key={variant.id}
                          className="border-b border-slate-200 last:border-b-0"
                        >
                          <td className="px-4 py-4">
                            <p className="font-bold text-slate-900">
                              {variant.name}
                            </p>

                            {variant.attributes.length > 0 && (
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {variant.attributes
                                  .map(
                                    (attribute) =>
                                      `${attribute.name}: ${attribute.value}`,
                                  )
                                  .join(" · ")}
                              </p>
                            )}

                            {(variant.lengthCm ||
                              variant.widthCm ||
                              variant.heightCm) && (
                              <p className="mt-1 text-xs text-slate-500">
                                Dimensiones:{" "}
                                {variant.lengthCm ??
                                  "—"}{" "}
                                ×{" "}
                                {variant.widthCm ??
                                  "—"}{" "}
                                ×{" "}
                                {variant.heightCm ??
                                  "—"}{" "}
                                cm
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-4 font-mono text-sm text-slate-700">
                            {variant.sku}
                          </td>

                          <td className="px-4 py-4 font-bold text-slate-900">
                            {formatPrice(
                              variant.price,
                            )}
                          </td>

                          <td className="px-4 py-4 font-bold text-slate-900">
                            {variant.stock}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={[
                                "inline-flex rounded-full px-3 py-1 text-xs font-extrabold",
                                variant.isActive
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-200 text-slate-600",
                              ].join(" ")}
                            >
                              {variant.isActive
                                ? "Activa"
                                : "Inactiva"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-4">
                              <Link
                                href={`/admin/productos/${product.id}/variantes/${variant.id}/editar`}
                                className="text-sm font-bold text-slate-700 transition hover:text-slate-950"
                              >
                                Editar
                              </Link>

                              <DeleteVariantButton
                                productId={
                                  product.id
                                }
                                variantId={
                                  variant.id
                                }
                                variantName={
                                  variant.name
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* IMÁGENES */}

          <section className="rounded-2xl border border-slate-200 bg-white p-7">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900">
                Imágenes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sube hasta 5 imágenes, selecciona la principal y organiza el orden de la galería.
              </p>
            </div>

            <ImageUploader
              productId={product.id}
              productName={product.name}
              currentImageCount={
                product.images.length
              }
              maxImages={5}
            />

            <ImageGallery
              productId={product.id}
              productName={product.name}
              images={product.images.map(
                (image) => ({
                  id: image.id,
                  url: image.url,
                  alt: image.alt,
                  sortOrder:
                    image.sortOrder,
                  isPrimary:
                    image.isPrimary,
                }),
              )}
            />
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-7">
  <div className="mb-6">
    <h2 className="text-xl font-black text-slate-900">
      Características
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Agrega los atributos, beneficios y elementos destacados
      que se mostrarán en la ficha pública del producto.
    </p>
  </div>

  <ProductFeaturesEditor
    productId={product.id}
    features={product.features.map(
      (feature) => ({
        id: feature.id,
        text: feature.text,
        sortOrder:
          feature.sortOrder,
      }),
    )}
  />
</section>
<section className="rounded-2xl border border-slate-200 bg-white p-7">
  <div className="mb-6">
    <h2 className="text-xl font-black text-slate-900">
      Especificaciones
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Agrega la información técnica que se mostrará
      en la ficha pública del producto.
    </p>
  </div>

  <ProductSpecificationsEditor
    productId={product.id}
    specifications={product.specifications.map(
      (specification) => ({
        id: specification.id,
        label: specification.label,
        value: specification.value,
        sortOrder:
          specification.sortOrder,
      }),
    )}
  />
</section>
        </div>

        {/* SIDEBAR */}

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-black text-slate-900">
              Resumen
            </h2>

            <dl className="mt-5 space-y-4">
              <div className="flex justify-between gap-4">
                <dt className="text-sm text-slate-500">
                  Variantes
                </dt>

                <dd className="font-bold text-slate-900">
                  {product.variants.length}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-sm text-slate-500">
                  Stock total
                </dt>

                <dd className="font-bold text-slate-900">
                  {product.variants.reduce(
                    (
                      total,
                      variant,
                    ) =>
                      total +
                      variant.stock,
                    0,
                  )}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-sm text-slate-500">
                  Imágenes
                </dt>

                <dd className="font-bold text-slate-900">
                  {product.images.length}
                  /5
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-sm text-slate-500">
                  Estado
                </dt>

                <dd className="font-bold text-slate-900">
                  {product.status ===
                  "PUBLISHED"
                    ? "Publicado"
                    : product.status ===
                        "ARCHIVED"
                      ? "Archivado"
                      : "Borrador"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-black text-slate-900">
              Vista pública
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              El producto aparecerá en la tienda cuando esté publicado y tenga al menos una variante válida.
            </p>

            <Link
              href={`/producto/${product.slug}`}
              target="_blank"
              className="mt-5 inline-flex font-bold text-slate-700 transition hover:text-slate-950"
            >
              Ver producto en la tienda
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}