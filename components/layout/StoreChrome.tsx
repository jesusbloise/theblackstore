"use client";

import { usePathname } from "next/navigation";
import { Header, type StoreNavigationCategory } from "@/components/layout/Header";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/layout/Footer";

export function StoreChrome({ categories, children }: { categories: StoreNavigationCategory[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdmin) return <>{children}</>;
  return <div className="tbs-storefront"><a href="#store-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:p-3">Saltar al contenido</a><Header categories={categories} /><div id="store-content" tabIndex={-1}>{children}</div><Footer categories={categories} /><CartDrawer /></div>;
}
