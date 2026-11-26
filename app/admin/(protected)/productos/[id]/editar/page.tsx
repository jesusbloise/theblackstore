import Link from "next/link";
import { notFound } from "next/navigation";

import { InventoryVariantsEditor } from "@/components/admin/InventoryVariantsEditor";
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
                  "",

                categoryId:
                  category?.id ?? "",

                status:
                  product.status,
              }}
            />
          </section>

          {/* VARIANTES E INVENTARIO */}
          <section className="rounded-2xl border border-slate-200 bg-white p-7">
            <h2 className="mb-2 text-xl font-black text-slate-900">Variantes e inventario</h2>
            <p className="mb-5 text-sm text-slate-500">Edita tallas, colores, SKU, precio y existencias sin salir de esta página.</p>
            <InventoryVariantsEditor
              productId={product.id}
              prefix={product.slug.slice(0, 12)}
             initialVariants={product.variants.map((v) => ({
  id: v.id,
  name: v.name,
  sku: v.sku,
  price: v.price,
  stock: v.stock,
  isActive: v.isActive,
  updatedAt: v.updatedAt.toISOString(),
  attributes: v.attributes.map((a) => ({
    name: a.name,
    value: a.value,
  })),
}))}
            />
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