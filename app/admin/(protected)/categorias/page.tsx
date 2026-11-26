import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { ADMIN_PERMISSIONS } from "@/lib/auth/admin-permissions";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";
import { getCategories } from "@/services/admin/categories";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireAdminPage(ADMIN_PERMISSIONS.CATEGORIES_MANAGE);

  const categories = await getCategories();
  const roots = categories.filter((category) => !category.parentId);
  const childrenByParent = new Map<string, typeof categories>();

  for (const category of categories) {
    if (!category.parentId) continue;
    const siblings = childrenByParent.get(category.parentId) ?? [];
    siblings.push(category);
    childrenByParent.set(category.parentId, siblings);
  }

  const rows: { category: (typeof categories)[number]; depth: number }[] = [];
  const visited = new Set<string>();
  function appendBranch(category: (typeof categories)[number], depth: number) {
    if (visited.has(category.id)) return;
    visited.add(category.id);
    rows.push({ category, depth });
    for (const child of childrenByParent.get(category.id) ?? []) {
      appendBranch(child, depth + 1);
    }
  }
  for (const category of roots) appendBranch(category, 0);
  for (const category of categories) appendBranch(category, 0);

  return (
    <div>
      <PageHeader
        title="Categorías y subcategorías"
        description="Organiza el catálogo por niveles. Las categorías principales agrupan sus subcategorías."
        actions={
          <Link href="/admin/categorias/nueva" className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white">
            + Nueva categoría
          </Link>
        }
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-slate-700">
            <tr>
              <th className="p-4 text-left">Categoría / Subcategoría</th>
              <th className="p-4 text-left">Slug</th>
              <th className="p-4 text-left">Nivel</th>
              <th className="p-4 text-left">Estado</th>
              <th className="p-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ category, depth }) => (
              <tr key={category.id} className="border-b border-slate-100 last:border-0">
                <td className="p-4 font-medium text-slate-900">
                  <div className="flex items-center gap-2" style={{ paddingLeft: `${Math.min(depth, 8) * 20}px` }}>
                    {depth > 0 && <span aria-hidden="true" className="text-amber-700">↳</span>}
                    <span>{category.name}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-600">{category.slug}</td>
                <td className="p-4 text-slate-600">{depth === 0 ? "Principal" : `Subcategoría · nivel ${depth}`}</td>
                <td className="p-4">
                  <span className={category.isActive ? "text-emerald-700" : "text-slate-500"}>
                    {category.isActive ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap items-start gap-2">
                    <Link href={`/admin/categorias/${category.id}/editar`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50">Editar</Link>
                    <DeleteCategoryButton id={category.id} name={category.name} />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Todavía no hay categorías. Crea la primera para organizar tu tienda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        Para crear una subcategoría, selecciona su categoría superior en el formulario «Nueva categoría».
      </p>
    </div>
  );
}
