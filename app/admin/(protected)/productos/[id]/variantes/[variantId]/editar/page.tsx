import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/PageHeader";
import { VariantForm } from "@/components/admin/VariantForm";
import {
  getAdminProductById,
  getAdminVariantById,
} from "@/services/admin/products";

export const dynamic = "force-dynamic";

type EditVariantPageProps = {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
};

function getAttributeValue(
  attributes: {
    name: string;
    value: string;
  }[],
  name: string,
) {
  return (
    attributes.find(
      (attribute) =>
        attribute.name === name,
    )?.value ?? ""
  );
}

export default async function EditVariantPage({
  params,
}: EditVariantPageProps) {
  const {
    id,
    variantId,
  } = await params;

  const [product, variant] =
    await Promise.all([
      getAdminProductById(id),
      getAdminVariantById(
        id,
        variantId,
      ),
    ]);

  if (!product || !variant) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={`Editar ${variant.name}`}
        description={`Modifica precio, stock, medidas y opciones de ${product.name}.`}
      />

      <div className="max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <VariantForm
          productId={product.id}
          initialData={{
            id: variant.id,
            name: variant.name,
            sku: variant.sku,

            price: variant.price,

            compareAtPrice:
              variant.compareAtPrice,

            stock: variant.stock,

            measure:
              getAttributeValue(
                variant.attributes,
                "Medida",
              ),

            density:
              getAttributeValue(
                variant.attributes,
                "Densidad",
              ),

            height:
              getAttributeValue(
                variant.attributes,
                "Altura",
              ),

            lengthCm:
              variant.lengthCm,

            widthCm:
              variant.widthCm,

            heightCm:
              variant.heightCm,

            manageInventory:
              variant.manageInventory,

            allowBackorder:
              variant.allowBackorder,

            isActive:
              variant.isActive,
          }}
        />
      </div>
    </div>
  );
}