import { CategoryForm } from "@/components/admin/CategoryForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { getCategories } from "@/services/admin/categories";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const categories =
    await getCategories();

  const parentCategories = categories
    .filter(
      (category) =>
        category.parentId === null &&
        category.isActive,
    )
    .map((category) => ({
      id: category.id,
      name: category.name,
    }));

  return (
    <div>
      <PageHeader
        title="Nueva categoría"
        description="Crea una categoría principal o una subcategoría para el catálogo."
      />

      <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <CategoryForm
          parentCategories={
            parentCategories
          }
        />
      </div>
    </div>
  );
}