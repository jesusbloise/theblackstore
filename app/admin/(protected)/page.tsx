
import Link from "next/link";

import { ProductStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [
    totalProducts,
    publishedProducts,
    draftProducts,
    archivedProducts,
    totalCategories,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({
      where: { status: ProductStatus.PUBLISHED },
    }),
    prisma.product.count({
      where: { status: ProductStatus.DRAFT },
    }),
    prisma.product.count({
      where: { status: ProductStatus.ARCHIVED },
    }),
    prisma.category.count(),
  ]);

  const stats = [
    { label: "Total de productos", value: totalProducts },
    { label: "Publicados", value: publishedProducts },
    { label: "Borradores", value: draftProducts },
    { label: "Archivados", value: archivedProducts },
    { label: "Categorías", value: totalCategories },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-600">
          Resumen general de The Black Store.
        </p>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">
              {stat.label}
            </p>

            <p className="mt-3 text-4xl font-bold text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Accesos rápidos
        </h2>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/admin/productos"
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Administrar productos
          </Link>

          <Link
            href="/admin/productos/nuevo"
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Nuevo producto
          </Link>

          <Link
            href="/admin/categorias"
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Administrar categorías
          </Link>
        </div>
      </section>
    </div>
  );
}
