import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">
          <h1 className="text-2xl font-black">
            INCAL Admin
          </h1>

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
        </aside>

        <main className="flex-1 p-10">
          {children}
        </main>
      </div>
    </div>
  );
}