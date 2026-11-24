import { ProductSection } from "@/components/home/CommercialHome";
import { getStoreProducts } from "@/lib/storefront";
import { getMediaUrl } from "@/lib/media-url";
import {
  Check,
  PackageCheck,
  Truck,
} from "lucide-react";
import { notFound } from "next/navigation";

import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { ProductPurchasePanel } from "@/components/products/ProductPurchasePanel";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
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

  const categoryName = product.category?.name ?? "Productos";
  const categoryHref = product.category ? `/categoria/${product.category.slug}` : "/productos";
  const related = (await getStoreProducts()).filter(p => p.id !== product.id && p.type !== "CUSTOM_MATTRESS").sort((a,b) => Number(b.categories.some(c => c.category.id === product.category?.id)) - Number(a.categories.some(c => c.category.id === product.category?.id))).slice(0,8);
  return (
    <main className="bg-white text-[#101010]">
      <section className="border-b border-[#e5dfd6] bg-[#F7F6F3] py-4"><Container><Breadcrumb items={[{label:"Inicio",href:"/"},{label:"Productos",href:"/productos"},{label:categoryName,href:categoryHref},{label:product.name}]}/></Container></section>
      <section className="py-8 lg:py-14"><Container><div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <ProductImageGallery key={product.id} images={product.images} productName={product.name}/>
        <div><p className="text-xs uppercase tracking-[.22em] text-[#927451]">{categoryName}</p><h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-5xl">{product.name}</h1>
        {product.brand && <p className="mt-3 text-sm text-neutral-600">{product.brand}</p>}
        {product.shortDescription && <p className="mt-4 leading-7 text-neutral-600">{product.shortDescription}</p>}
        <ProductPurchasePanel key={product.id} productId={product.id} productName={product.name} productHref={`/producto/${product.slug}`} productImage={getMediaUrl(product.images[0]) ?? undefined} variants={product.variants} dimensioned/>
        <div className="mt-8 grid gap-4 border-y border-[#e5dfd6] py-5 sm:grid-cols-2"><div className="flex gap-3"><Truck size={22}/><div><p className="text-sm font-medium">Despacho a Chile</p><p className="text-xs text-neutral-600">Consulta cobertura y plazos.</p></div></div><div className="flex gap-3"><PackageCheck size={22}/><div><p className="text-sm font-medium">Retiro coordinado</p><p className="text-xs text-neutral-600">Retiro personal en Santiago.</p></div></div></div>
        <div className="mt-5 divide-y divide-[#e5dfd6]">
          {product.description && <details open className="py-4"><summary className="cursor-pointer font-medium">Descripción</summary><p className="mt-4 whitespace-pre-line text-sm leading-7 text-neutral-600">{product.description}</p></details>}
          {product.features.length>0 && <details className="py-4"><summary className="cursor-pointer font-medium">Características</summary><ul className="mt-4 space-y-2 text-sm text-neutral-600">{product.features.map((f,i)=><li key={i} className="flex gap-2"><Check size={16}/>{f}</li>)}</ul></details>}
          {product.specifications.length>0 && <details className="py-4"><summary className="cursor-pointer font-medium">Especificaciones</summary><dl className="mt-4 divide-y divide-[#e5dfd6]">{product.specifications.map((s,i)=><div key={i} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-neutral-600">{s.label}</dt><dd className="text-right">{s.value}</dd></div>)}</dl></details>}
          <details className="py-4"><summary className="cursor-pointer font-medium">Preparación y entrega</summary><p className="mt-4 text-sm leading-6 text-neutral-600">{product.manufacturingDays ? `Preparación estimada: ${product.manufacturingDays} días hábiles.` : "Consulta los plazos de preparación y entrega según tu comuna."}</p></details>
          {product.warranty && <details className="py-4"><summary className="cursor-pointer font-medium">Garantía</summary><p className="mt-4 text-sm text-neutral-600">{product.warranty}</p></details>}
        </div></div></div></Container></section>
      <ProductSection products={related} title="También te puede interesar" kicker="Completa tu selección" muted/>
    </main>
  );
}
