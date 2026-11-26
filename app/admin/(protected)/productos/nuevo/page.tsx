import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { ADMIN_PERMISSIONS } from "@/lib/auth/admin-permissions";
import { PageHeader } from "@/components/admin/PageHeader";
import { NewProductCompleteForm } from "@/components/admin/NewProductCompleteForm";
import { getCategories } from "@/services/admin/categories";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdminPage(ADMIN_PERMISSIONS.PRODUCTS_MANAGE);

  const categories =
    await getCategories();

  const categoryOptions = categories
    .filter(
      (category) =>
        category.isActive,
    )
    .map((category) => ({
      id: category.id,
      name: category.name,
      parentName:
        category.parent?.name ??
        undefined,
    }));

  return (
    <div>
      <PageHeader
        title="Nuevo producto"
        description="Completa información, variantes, precios e imágenes en una sola pantalla."
      />

      <div className="max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <NewProductCompleteForm categories={categoryOptions} />
      </div>
    </div>
  );
}