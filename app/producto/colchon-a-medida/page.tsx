import {
  Check,
  PackageCheck,
  Ruler,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { notFound } from "next/navigation";

import { CustomMattressConfigurator } from "@/components/products/CustomMattressConfigurator";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
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

export default async function CustomMattressPage() {
  const product =
    await getPublishedProductBySlug(
      "colchon-a-medida",
    );

  if (
    !product ||
    product.type !== "CUSTOM_MATTRESS" ||
    !product.customMattress
  ) {
    notFound();
  }

  const customConfig =
    product.customMattress;

  const categoryName =
    product.category?.name ??
    "Colchones a medida";

  const categoryHref =
    product.category
      ? `/colchones/${product.category.slug}`
      : "/colchones/a-medida";

  const description =
    product.description ??
    product.shortDescription ??
    "Colchón personalizado fabricado según las dimensiones requeridas.";

  const features =
    product.features.length > 0
      ? product.features
      : [
          "Fabricación personalizada",
          `Espuma de densidad ${customConfig.density}`,
          "Disponible en distintas dimensiones",
          "Fabricación nacional",
        ];

  const specifications =
    product.specifications.length > 0
      ? product.specifications
      : [
          {
            label: "Estructura",
            value: "Espuma",
          },
          {
            label: "Densidad",
            value: customConfig.density,
          },
          {
            label: "Espesores disponibles",
            value:
              customConfig.allowedThicknessCm
                .map(
                  (thickness) =>
                    `${thickness} cm`,
                )
                .join(", "),
          },
          {
            label: "Fabricación",
            value: product.manufacturingDays
              ? `${product.manufacturingDays} días hábiles`
              : "Consultar",
          },
        ];

  const manufacturingText =
    product.manufacturingDays
      ? `El producto se fabrica según las dimensiones ingresadas. El plazo estimado es de ${product.manufacturingDays} días hábiles, aunque podría variar según la carga de producción.`
      : "El producto se fabrica especialmente según las dimensiones ingresadas. El plazo definitivo se informará durante el proceso de compra.";

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
              <ProductImageGallery
                images={product.images}
                productName={product.name}
              />
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
              </p>

              <CustomMattressConfigurator
                productId={product.id}
                productName={product.name}
                productImage={
                  product.images[0]
                }
                density={
                  customConfig.density
                }
                minimumLengthCm={
                  customConfig.minimumLengthCm
                }
                maximumLengthCm={
                  customConfig.maximumLengthCm
                }
                minimumWidthCm={
                  customConfig.minimumWidthCm
                }
                maximumWidthCm={
                  customConfig.maximumWidthCm
                }
                allowedThicknessCm={
                  customConfig.allowedThicknessCm
                }
                basePricePerSquareM={
                  customConfig.basePricePerSquareM
                }
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
                        Fabricación respaldada
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        Producto fabricado según las
                        medidas seleccionadas.
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

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
                  <Ruler size={24} />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-brand-950">
                    Cómo ingresar las medidas
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Ingresa un largo entre{" "}
                    {customConfig.minimumLengthCm} y{" "}
                    {customConfig.maximumLengthCm} cm,
                    y un ancho entre{" "}
                    {customConfig.minimumWidthCm} y{" "}
                    {customConfig.maximumWidthCm} cm.
                    Verifica las medidas antes de
                    agregar el producto al carrito.
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
                  <PackageCheck size={24} />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-brand-950">
                    Fabricación especial
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {manufacturingText}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </main>
  );
}