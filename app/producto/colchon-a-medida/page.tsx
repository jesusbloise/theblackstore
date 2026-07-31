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
import { sdk } from "@/lib/medusa";

type MedusaImage = {
  url?: string | null;
};
type MedusaVariant = {
  id: string;
};
type MedusaProduct = {
  id: string;
  title: string;
  handle?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  images?: MedusaImage[] | null;
  variants?: MedusaVariant[] | null;
  metadata?: Record<string, unknown> | null;
};

function normalizeHandle(
  value?: string | null,
) {
  if (!value) {
    return "";
  }

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

export const dynamic = "force-dynamic";

export default async function CustomMattressPage() {
  const response =
    await sdk.store.product.list({
      limit: 100,
      fields:
        "*images,+thumbnail,+variants,+metadata",
    });

  const medusaProduct = (
    response.products as MedusaProduct[]
  ).find(
    (product) =>
      normalizeHandle(product.handle) ===
      "colchon-a-medida",
  );

  if (!medusaProduct) {
    notFound();
  }
const mattressVariant =
  medusaProduct.variants?.[0];

if (!mattressVariant?.id) {
  throw new Error(
    "El producto Colchón a medida no tiene una variante configurada en Medusa.",
  );
}
  const images = Array.from(
    new Set(
      [
        medusaProduct.thumbnail,
        ...(medusaProduct.images?.map(
          (image) => image.url,
        ) ?? []),
      ].filter(
        (url): url is string =>
          typeof url === "string" &&
          url.trim().length > 0,
      ),
    ),
  );

  const metadata =
    medusaProduct.metadata ?? {};

  const getMetadataString = (
    key: string,
    fallback = "",
  ) => {
    const value = metadata[key];

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      const normalizedValue =
        String(value).trim();

      return normalizedValue || fallback;
    }

    return fallback;
  };

  const features = [
    getMetadataString("feature_1"),
    getMetadataString("feature_2"),
    getMetadataString("feature_3"),
    getMetadataString("feature_4"),
  ].filter(
    (feature): feature is string =>
      feature.length > 0,
  );

  const manufacturingDays =
    getMetadataString(
      "manufacturing_days",
    );

  const specifications = [
    {
      label: "Estructura",
      value: getMetadataString(
        "structure",
        "Consultar",
      ),
    },
    {
      label: "Relleno",
      value: getMetadataString(
        "filling",
        "Consultar",
      ),
    },
    {
      label: "Tapiz",
      value: getMetadataString(
        "upholstery",
        "Consultar",
      ),
    },
    {
      label: "Fabricación",
      value: manufacturingDays
        ? `${manufacturingDays} días hábiles`
        : "Consultar",
    },
  ];

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
                label: medusaProduct.title,
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
                images={images}
                productName={
                  medusaProduct.title
                }
              />
            </div>

            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-accent-600">
                Colchones a medida
              </p>

              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-brand-950 sm:text-5xl">
                {medusaProduct.title}
              </h1>

              <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
                {medusaProduct.description ??
                  "Colchón personalizado fabricado según las dimensiones requeridas."}
              </p>

              <CustomMattressConfigurator
  productId={medusaProduct.id}
  productName={medusaProduct.title}
  productImage={images[0]}
  variantId={mattressVariant.id}
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
                {features.length > 0 ? (
                  <ul className="space-y-4">
                    {features.map(
                      (feature) => (
                        <li
                          key={feature}
                          className="flex gap-3 text-slate-700"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check size={15} />
                          </span>

                          <span>
                            {feature}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="text-sm leading-6 text-slate-500">
                    Las características de este
                    producto se encuentran en
                    actualización.
                  </p>
                )}
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
                        key={
                          specification.label
                        }
                        className="flex justify-between gap-6 py-4 first:pt-0 last:pb-0"
                      >
                        <dt className="text-sm font-semibold text-slate-500">
                          {
                            specification.label
                          }
                        </dt>

                        <dd className="text-right text-sm font-bold text-brand-950">
                          {
                            specification.value
                          }
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
                    Ingresa el largo, ancho y alto
                    requerido en centímetros. Usa
                    solamente números y verifica las
                    medidas antes de agregar el
                    producto al carrito.
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
                    El producto se fabrica según las
                    dimensiones ingresadas.{" "}
                    {manufacturingDays
                      ? `El plazo estimado es de ${manufacturingDays} días hábiles`
                      : "El plazo de fabricación será informado por Incal"}
                    , aunque podría variar según la
                    carga de producción.
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