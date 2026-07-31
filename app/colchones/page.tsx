import {
  ProductCatalog,
  type CatalogProduct,
} from "@/components/products/ProductCatalog";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { sdk } from "@/lib/medusa";

export const dynamic = "force-dynamic";

type MedusaRegion = {
  id: string;
  currency_code: string;
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

function normalizeHandle(value?: string | null) {
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

export default async function ColchonesPage() {
  let products: CatalogProduct[] = [];
  let connectionError = false;

  try {
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
        "No se encontró la región Chile en Medusa",
      );
    }

    const response =
      await sdk.store.product.list({
        limit: 20,
        region_id: chileRegion.id,
        fields:
          "*variants.calculated_price,*variants.options",
      });

    const medusaProducts =
      response.products as MedusaProduct[];

    products = medusaProducts.map(
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

        const handle =
          normalizeHandle(product.handle) ||
          product.id;

        return {
          id: product.id,
          name: product.title,
          category: "Colchones",
          price,
          href: `/producto/${handle}`,
          type: "espuma",
          sizes,
          relevance: 100 - index,
          sales: 0,
          createdAt:
            product.created_at ??
            new Date().toISOString(),
        };
      },
    );
  } catch (error) {
    connectionError = true;

    console.error(
      "ERROR REAL AL CONECTAR CON MEDUSA:",
      error,
    );
  }

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
              },
            ]}
          />

          <div className="mt-5 max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-brand-950 sm:text-5xl">
              Colchones
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              Encuentra colchones de espuma,
              resortes, alta densidad y opciones
              fabricadas a medida para distintas
              necesidades de descanso.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          {connectionError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              No fue posible conectar con Medusa.
              Revisa la terminal del frontend para
              ver el error exacto.
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
              La conexión con Medusa funcionó, pero
              no se encontraron productos publicados.
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