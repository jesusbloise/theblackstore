import {
  ProductCatalog,
  type CatalogProduct,
} from "@/components/products/ProductCatalog";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { listPublishedProductsByParentCategory } from "@/services/catalog";

export const dynamic = "force-dynamic";

function mapProductType(
  type: "STANDARD" | "CUSTOM_MATTRESS",
  category: string,
): CatalogProduct["type"] {
  if (type === "CUSTOM_MATTRESS") {
    return "a-medida";
  }

  if (
    category
      .toLowerCase()
      .includes("resortes")
  ) {
    return "resortes";
  }

  return "espuma";
}

export default async function ColchonesPage() {
  let products: CatalogProduct[] = [];
  let connectionError = false;

  try {
    const databaseProducts =
      await listPublishedProductsByParentCategory(
        "colchones",
      );

    products = databaseProducts.map(
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
          product.category,
        ),
        sizes: product.sizes,
        relevance: 100 - index,
        sales: 0,
        createdAt:
          product.createdAt.toISOString(),
      }),
    );
  } catch (error) {
    connectionError = true;

    console.error(
      "ERROR AL CONSULTAR EL CATÁLOGO PROPIO:",
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
              No fue posible consultar el catálogo.
              Revisa la terminal para ver el error
              exacto.
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
              La conexión con la base funcionó, pero
              todavía no hay productos publicados.
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