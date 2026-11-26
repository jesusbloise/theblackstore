import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { ADMIN_PERMISSIONS } from "@/lib/auth/admin-permissions";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/PageHeader";
import { VariantForm } from "@/components/admin/VariantForm";
import { getAdminProductById } from "@/services/admin/products";

export const dynamic = "force-dynamic";

type NewVariantPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NewVariantPage({
  params,
}: NewVariantPageProps) {
  await requireAdminPage(ADMIN_PERMISSIONS.INVENTORY_MANAGE);

  const { id } = await params;

  const product =
    await getAdminProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Nueva variante"
        description={`Agrega precio, SKU y stock para ${product.name}.`}
      />

      <div className="max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <VariantForm
          productId={product.id}
        />
      </div>
    </div>
  );
}