import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, categories] = await Promise.all([
    prisma.category.findUnique({ where: { id }, select: { id: true, name: true, slug: true, description: true, parentId: true, isActive: true } }),
    prisma.category.findMany({ where: { parentId: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
  ]);
  if (!category) notFound();
  return (
    <div>
      <PageHeader title={`Editar: ${category.name}`} description="Actualiza los datos, la visibilidad y la categoría superior." />
      <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <CategoryForm initialCategory={category} parentCategories={categories.filter((item) => item.id !== category.id)} />
      </div>
    </div>
  );
}
