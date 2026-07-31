
import { sdk } from "@/lib/medusa";
import { notFound } from "next/navigation";
import {
    Check,
    PackageCheck,
    ShieldCheck,
    Truck,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Price } from "@/components/ui/Price";

import { ProductPurchasePanel } from "@/components/products/ProductPurchasePanel";

type ProductPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

type ProductDetail = {
    slug: string;
    name: string;
    category: string;
    categoryHref: string;
    description: string;
    price: number;
    originalPrice?: number;
    sizes: string[];
    features: string[];
    specifications: {
        label: string;
        value: string;
    }[];
};
type MedusaVariant = {
    id: string;
    title?: string | null;
    sku?: string | null;
    options?: Array<{
        value?: string | null;
    }> | null;
    calculated_price?: {
        calculated_amount?: number | null;
        original_amount?: number | null;
    } | null;
};

type MedusaProduct = {
    id: string;
    title: string;
    handle?: string | null;
    description?: string | null;
    variants?: MedusaVariant[] | null;
};


export const dynamic = "force-dynamic";

export default async function ProductPage({
    params,
}: ProductPageProps) {
    const { slug } = await params;

const { regions } = await sdk.store.region.list();

const chileRegion = regions.find(
    (region: { currency_code: string }) =>
        region.currency_code.toLowerCase() === "clp",
);

if (!chileRegion) {
    throw new Error(
        "No se encontró la región Chile en Medusa",
    );
}

const response = await sdk.store.product.list({
    limit: 100,
    region_id: chileRegion.id,
    fields:
        "*variants.calculated_price,*variants.options",
});

const normalizeHandle = (value?: string | null) => {
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
};

const medusaProduct = (
    response.products as MedusaProduct[]
).find(
    (item) =>
        normalizeHandle(item.handle) ===
        normalizeHandle(slug),
);

if (!medusaProduct) {
   console.error(
    "Producto no encontrado. Slug solicitado:",
    slug,
);

console.error(
    "Handles disponibles:",
    response.products.map(
        (item: { handle?: string | null }) =>
            item.handle,
    ),
);

    notFound();
}

const variants = medusaProduct.variants ?? [];
const firstVariant = variants[0];

if (!firstVariant) {
    notFound();
}

const currentPrice =
    firstVariant.calculated_price
        ?.calculated_amount ?? 0;

const originalAmount =
    firstVariant.calculated_price
        ?.original_amount ?? null;

const sizes = variants
    .map((variant: MedusaVariant) => {
        const optionValues =
            variant.options
                ?.map(
                    (option: {
                        value?: string | null;
                    }) => option.value,
                )
                .filter(
                    (value): value is string =>
                        typeof value === "string" &&
                        value.length > 0,
                ) ?? [];

        return (
            optionValues.join(" / ") ||
            variant.title ||
            ""
        );
    })
    .filter(
        (value): value is string =>
            value.length > 0,
    );

   const product: ProductDetail = {
    slug:
        normalizeHandle(
            medusaProduct.handle,
        ) || slug,
    name: medusaProduct.title,
    category: "Colchones",
        categoryHref: "/colchones",
        description:
            medusaProduct.description ??
            "Producto de descanso fabricado por Incal.",
        price: currentPrice,
        originalPrice:
            originalAmount &&
                originalAmount > currentPrice
                ? originalAmount
                : undefined,
        sizes,
        features: [
            "Fabricación nacional",
            "Materiales seleccionados",
            "Diseñado para un descanso confortable",
            "Disponible en distintas medidas",
        ],
        specifications: [
            {
                label: "Marca",
                value: "Incal",
            },
            {
                label: "Medidas disponibles",
                value:
                    sizes.join(", ") ||
                    "Consultar disponibilidad",
            },
            {
                label: "SKU",
                value:
                    firstVariant.sku ??
                    "Sin especificar",
            },
            {
                label: "Garantía",
                value: "Consultar",
            },
        ],
    };

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
                                label: product.category,
                                href: product.categoryHref,
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
                            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                                {product.originalPrice && (
                                    <Badge
                                        variant="sale"
                                        className="absolute left-5 top-5"
                                    >
                                        Oferta
                                    </Badge>
                                )}

                                <div className="px-8 text-center">
                                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                                        Imagen referencial
                                    </p>

                                    <p className="mt-3 text-2xl font-extrabold text-slate-500">
                                        {product.name}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-4 gap-3">
                                {Array.from(
                                    { length: 4 },
                                    (_, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            aria-label={`Ver imagen ${index + 1}`}
                                            className={[
                                                "aspect-square rounded-2xl border bg-slate-100 transition",
                                                index === 0
                                                    ? "border-brand-950 ring-2 ring-brand-950/10"
                                                    : "border-slate-200 hover:border-brand-400",
                                            ].join(" ")}
                                        />
                                    ),
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-accent-600">
                                {product.category}
                            </p>

                            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-brand-950 sm:text-5xl">
                                {product.name}
                            </h1>

                            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
                                {product.description}
                            </p>

                            <div className="mt-7">
                                <Price
                                    price={product.price}
                                    originalPrice={product.originalPrice}
                                    size="lg"
                                />
                            </div>

                            <ProductPurchasePanel
                                productId={product.slug}
                                productName={product.name}
                                productPrice={product.price}
                                productHref={`/producto/${product.slug}`}
                                sizes={product.sizes}
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
                                                Consulta cobertura y plazo según tu comuna.
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
                                                Productos respaldados por garantía.
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
                                    {product.features.map(
                                        (feature) => (
                                            <li
                                                key={feature}
                                                className="flex gap-3 text-slate-700"
                                            >
                                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                                    <Check size={15} />
                                                </span>

                                                <span>{feature}</span>
                                            </li>
                                        ),
                                    )}
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
                                    {product.specifications.map(
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
                                    Fabricación y despacho
                                </h2>

                                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                    Algunos productos se fabrican o preparan según la medida seleccionada. Los tiempos definitivos de entrega se informarán durante el proceso de compra.
                                </p>
                            </div>
                        </div>
                    </Card>
                </Container>
            </section>
        </main>
    );
}