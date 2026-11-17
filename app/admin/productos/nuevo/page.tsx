import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories } from "@/services/admin/categories";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
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
        description="Crea la información general del producto. Luego agregaremos precios, variantes, inventario e imágenes."
      />

      <div className="max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <ProductForm
          categories={categoryOptions}
        />
      </div>
    </div>
  );
}