
import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth/admin-session";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <aside className="min-h-screen w-64 shrink-0 bg-slate-900 p-6 text-white">
          <h1 className="text-2xl font-black">
            The Black Store
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Panel de administración
          </p>

          <nav className="mt-8 space-y-2">
            <Link
              href="/admin"
              className="block rounded-lg px-3 py-2 hover:bg-slate-800"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/productos"
              className="block rounded-lg px-3 py-2 hover:bg-slate-800"
            >
              Productos
            </Link>

            <Link
              href="/admin/categorias"
              className="block rounded-lg px-3 py-2 hover:bg-slate-800"
            >
              Categorías
            </Link>

            <Link
              href="/admin/pedidos"
              className="block rounded-lg px-3 py-2 hover:bg-slate-800"
            >
              Pedidos
            </Link>

            <Link
              href="/admin/clientes"
              className="block rounded-lg px-3 py-2 hover:bg-slate-800"
            >
              Clientes
            </Link>

            <Link
              href="/admin/configuracion"
              className="block rounded-lg px-3 py-2 hover:bg-slate-800"
            >
              Configuración
            </Link>
          </nav>

          <div className="mt-10 border-t border-slate-700 pt-5">
            <p className="text-sm font-semibold">
              {admin.name}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {admin.role}
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
