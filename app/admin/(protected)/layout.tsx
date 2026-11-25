import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ImageIcon,
  ShoppingBag,
  Users,
  Settings,
  ExternalLink,
} from "lucide-react";

import LogoutButton from "./LogoutButton";
import { getAdminSession } from "@/lib/auth/admin-session";

const navigation = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Productos", href: "/admin/productos", icon: Package },
  { label: "Categorías", href: "/admin/categorias", icon: Layers },
  { label: "Banners y campañas", href: "/admin/banners", icon: ImageIcon },
  { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingBag },
  { label: "Clientes", href: "/admin/clientes", icon: Users },
  { label: "Configuración", href: "/admin/configuracion", icon: Settings },
];

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
    <div className="min-h-screen bg-[#F7F6F3] text-[#101010]">
      <div className="flex min-h-screen flex-col lg:flex-row">

        <aside className="flex w-full shrink-0 flex-col border-r border-white/10 bg-[#101010] px-5 py-7 text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:overflow-y-auto">

          <div className="px-3">
            <h1 className="text-xl font-black tracking-tight">
              THE BLACK STORE
            </h1>

            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C3AA84]">
              Administración
            </p>
          </div>

          <div className="my-7 h-px bg-white/10" />

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            Gestión comercial
          </p>

          <nav className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
            {navigation.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-md px-3 py-3 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-[#C3AA84]"
              >
                <Icon
                  size={18}
                  strokeWidth={1.7}
                  className="shrink-0"
                />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 border-t border-white/10 pt-5">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-[#C3AA84] transition hover:bg-white/5"
            >
              <ExternalLink size={17} />
              Ver tienda
            </Link>
          </div>

          <div className="mt-auto pt-10">
            <div className="border-t border-white/10 pt-5">

              <div className="mb-5 flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#C3AA84]/30 bg-[#C3AA84]/10 font-semibold text-[#C3AA84]">
                  {admin.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {admin.name}
                  </p>

                  <p className="mt-1 text-[10px] uppercase tracking-wider text-neutral-500">
                    {admin.role}
                  </p>
                </div>
              </div>

              <LogoutButton />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-5 sm:p-8 xl:p-10">
          {children}
        </main>

      </div>
    </div>
  );
}