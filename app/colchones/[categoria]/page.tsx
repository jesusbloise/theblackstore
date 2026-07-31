import { notFound } from "next/navigation";

import {
  ProductCatalog,
  type CatalogProduct,
} from "@/components/products/ProductCatalog";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { sdk } from "@/lib/medusa";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{
    categoria: string;
  }>;
};

type MedusaRegion = {
  id: string;
  currency_code: string;
};

type MedusaCategory = {
  id: string;
  name: string;
  handle: string;
  description?: string | null;
};

type MedusaVariantOption = {
  value?: string | null;
};

type MedusaCalculatedPrice = {
  calculated_amount?: number | null;
};

type MedusaVariant = {
  options?: MedusaVariantOption[] | null;
  calculated_price?: MedusaCalculatedPrice | null;
};

type MedusaProduct = {
  id: string;
  title: string;
  handle?: string | null;
  created_at?: string | null;
  variants?: MedusaVariant[] | null;
};

function normalizeHandle(
  value?: string | null,
) {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

export default async function MattressCategoryPage({
  params,
}: CategoryPageProps) {
  const { categoria } = await params;

  const normalizedCategoryHandle =
    normalizeHandle(categoria);

  const categoryResponse =
    await sdk.store.category.list({
      handle: normalizedCategoryHandle,
      limit: 1,
    });

  const category = (
    categoryResponse.product_categories as MedusaCategory[]
  )[0];

  if (!category) {
    notFound();
  }

  const regionResponse =
    await sdk.store.region.list();

  const regions =
    regionResponse.regions as MedusaRegion[];

  const chileRegion = regions.find(
    (region) =>
      region.currency_code.toLowerCase() ===
      "clp",
  );

  if (!chileRegion) {
    throw new Error(
      "No se encontró la región Chile en Medusa.",
    );
  }

  const productsResponse =
    await sdk.store.product.list({
      limit: 50,
      category_id: category.id,
      region_id: chileRegion.id,
      fields:
        "*variants.calculated_price,*variants.options",
    });

  const medusaProducts =
    productsResponse.products as MedusaProduct[];

  const products: CatalogProduct[] =
    medusaProducts.map(
      (product, index) => {
        const firstVariant =
          product.variants?.[0];

        const price =
          firstVariant?.calculated_price
            ?.calculated_amount ?? 0;

        const sizes =
          firstVariant?.options
            ?.map((option) => option.value)
            .filter(
              (value): value is string =>
                typeof value === "string" &&
                value.length > 0,
            ) ?? [];

        const productHandle =
          normalizeHandle(product.handle) ||
          product.id;

        return {
          id: product.id,
          name: product.title,
          category: category.name,
          price,
          href: `/producto/${productHandle}`,
          type: normalizedCategoryHandle,
          sizes,
          relevance: 100 - index,
          sales: 0,
          createdAt:
            product.created_at ??
            new Date().toISOString(),
        };
      },
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
                label: category.name,
              },
            ]}
          />

          <div className="mt-5 max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-brand-950 sm:text-5xl">
              {category.name}
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              {category.description ??
                `Explora los productos disponibles en ${category.name.toLowerCase()}.`}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          {products.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
              Todavía no hay productos publicados en esta subcategoría.
            </div>
          ) : (
            <ProductCatalog products={products} />
          )}
        </Container>
      </section>
    </main>
  );
}