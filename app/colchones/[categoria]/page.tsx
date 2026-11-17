import { notFound } from "next/navigation";

import {
  ProductCatalog,
  type CatalogProduct,
} from "@/components/products/ProductCatalog";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import {
  listPublishedProductsByCategorySlug,
} from "@/services/catalog";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    categoria: string;
  }>;
};

function normalizeSlug(value: string) {
  let decodedValue = value;

  try {
    decodedValue = decodeURIComponent(value);
  } catch {
    decodedValue = value;
  }

  return decodedValue
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function mapProductType(
  type: "STANDARD" | "CUSTOM_MATTRESS",
  categorySlug: string,
): CatalogProduct["type"] {
  if (
    type === "CUSTOM_MATTRESS" ||
    categorySlug === "a-medida"
  ) {
    return "a-medida";
  }

  if (categorySlug === "resortes") {
    return "resortes";
  }

  return "espuma";
}

export default async function MattressCategoryPage({
  params,
}: CategoryPageProps) {
  const { categoria } = await params;

  const categorySlug =
    normalizeSlug(categoria);

  const result =
    await listPublishedProductsByCategorySlug(
      categorySlug,
    );

  if (!result) {
    notFound();
  }

  const products: CatalogProduct[] =
    result.products.map(
      (product, index) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        originalPrice:
          product.compareAtPrice,
        image: product.image,
        href: `/producto/${product.slug}`,
        type: mapProductType(
          product.type,
          result.category.slug,
        ),
        sizes: product.sizes,
        relevance: 100 - index,
        sales: 0,
        createdAt:
          product.createdAt.toISOString(),
      }),
    );

  return (
    <main>
      <section className="border-b border-slate-200 bg-slate-50 py-10">
        <Container>
          <Breadcrumb
            items={[
              {
                label: "Inicio",
                href: "/",
              },
              {
                label: "Colchones",
                href: "/colchones",
              },
              {
                label: result.category.name,
              },
            ]}
          />

          <div className="mt-5 max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-brand-950 sm:text-5xl">
              {result.category.name}
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              {result.category.description ??
                `Explora los productos disponibles en ${result.category.name.toLowerCase()}.`}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          {products.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
              Todavía no hay productos publicados
              en esta subcategoría.
            </div>
          ) : (
            <ProductCatalog
              products={products}
            />
          )}
        </Container>
      </section>
    </main>
  );
}