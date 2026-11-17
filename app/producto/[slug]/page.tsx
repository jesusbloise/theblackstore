import {
  Check,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { notFound } from "next/navigation";

import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { ProductPurchasePanel } from "@/components/products/ProductPurchasePanel";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { getPublishedProductBySlug } from "@/services/catalog";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    slug: string;
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

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product =
    await getPublishedProductBySlug(
      normalizeSlug(slug),
    );

  if (!product) {
    notFound();
  }

  /*
   * Los productos personalizados conservan su página
   * especial en /producto/colchon-a-medida.
   */
  if (product.type === "CUSTOM_MATTRESS") {
    notFound();
  }

  const firstVariant =
    product.variants[0];

  if (!firstVariant) {
    notFound();
  }

  const sizes = product.variants
    .map((variant) => {
      const measure =
        variant.attributes.find(
          (attribute) =>
            attribute.name === "Medida",
        );

      return measure?.value ?? variant.name;
    })
    .filter(
      (value, index, values) =>
        value.length > 0 &&
        values.indexOf(value) === index,
    );

  const features =
    product.features.length > 0
      ? product.features
      : [
        "Fabricación nacional",
        "Materiales seleccionados",
        "Diseñado para un descanso confortable",
        "Disponible en distintas medidas",
      ];

  const specifications =
    product.specifications.length > 0
      ? product.specifications
      : [
        {
          label: "Marca",
          value:
            product.brand ??
            "Incal",
        },
        {
          label: "Medidas disponibles",
          value:
            sizes.join(", ") ||
            "Consultar disponibilidad",
        },
        {
          label: "SKU",
          value: firstVariant.sku,
        },
        {
          label: "Garantía",
          value:
            product.warranty ??
            "Consultar",
        },
      ];

  const categoryName =
    product.category?.name ??
    "Colchones";

  const categoryHref =
    product.category
      ? `/colchones/${product.category.slug}`
      : "/colchones";

  const description =
    product.description ??
    product.shortDescription ??
    "Producto de descanso fabricado por Incal.";

  const manufacturingText =
    product.manufacturingDays
      ? `El plazo estimado de preparación o fabricación es de ${product.manufacturingDays} días hábiles.`
      : "Los tiempos definitivos de preparación y entrega se informarán durante el proceso de compra.";

  return (
    <main>
      <section className="border-b border-slate-200 bg-slate-50 py-6">
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
                label: categoryName,
                href: categoryHref,
              },
              {
                label: product.name,
              },
            ]}
          />
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <div className="relative">
                {firstVariant.compareAtPrice &&
                  firstVariant.compareAtPrice >
                  firstVariant.price && (
                    <Badge
                      variant="sale"
                      className="absolute left-5 top-5 z-10"
                    >
                      Oferta
                    </Badge>
                  )}

                <ProductImageGallery
                  images={product.images}
                  productName={product.name}
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-accent-600">
                {categoryName}
              </p>

              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-brand-950 sm:text-5xl">
                {product.name}
              </h1>

              <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
                {description}
              </p>git diff --cached --check
              <ProductPurchasePanel
                productId={product.id}
                productName={product.name}
                productHref={`/producto/${product.slug}`}
                productImage={product.images[0]}
                variants={product.variants}
                dimensioned
              />

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Card
                  variant="outlined"
                  padding="sm"
                >
                  <div className="flex gap-3">
                    <Truck className="mt-0.5 shrink-0 text-brand-950" />

                    <div>
                      <p className="font-bold text-brand-950">
                        Despacho disponible
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        Consulta cobertura y plazo
                        según tu comuna.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  variant="outlined"
                  padding="sm"
                >
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 shrink-0 text-brand-950" />

                    <div>
                      <p className="font-bold text-brand-950">
                        Compra protegida
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        Productos respaldados por
                        garantía.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-12 sm:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Características principales
                </CardTitle>
              </CardHeader>

              <CardContent>
                <ul className="space-y-4">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-3 text-slate-700"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check size={15} />
                      </span>

                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Especificaciones
                </CardTitle>
              </CardHeader>

              <CardContent>
                <dl className="divide-y divide-slate-200">
                  {specifications.map(
                    (specification) => (
                      <div
                        key={specification.label}
                        className="flex justify-between gap-6 py-4 first:pt-0 last:pb-0"
                      >
                        <dt className="text-sm font-semibold text-slate-500">
                          {specification.label}
                        </dt>

                        <dd className="text-right text-sm font-bold text-brand-950">
                          {specification.value}
                        </dd>
                      </div>
                    ),
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
                <PackageCheck size={27} />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-brand-950">
                  Preparación y despacho
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  {manufacturingText}
                </p>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </main>
  );
}