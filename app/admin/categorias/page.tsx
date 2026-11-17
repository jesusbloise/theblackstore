import { PageHeader } from "@/components/admin/PageHeader";
import { getCategories } from "@/services/admin/categories";
import Link from "next/link";

export default async function CategoriesPage() {
  const categories =
    await getCategories();

  return (
    <div>
      <PageHeader
        title="Categorías"
        description="Administra las categorías del catálogo."
        actions={
          <Link
  href="/admin/categorias/nueva"
  className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
>
  + Nueva categoría
</Link>
        }
      />

      <div className="rounded-2xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="p-4 text-left">
                Nombre
              </th>

              <th className="p-4 text-left">
                Slug
              </th>

              <th className="p-4 text-left">
                Estado
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.map(
              (category) => (
                <tr
                  key={category.id}
                  className="border-b"
                >
                  <td className="p-4">
                    {category.name}
                  </td>

                  <td className="p-4">
                    {category.slug}
                  </td>

                  <td className="p-4">
                    {category.isActive
                      ? "Activa"
                      : "Inactiva"}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}