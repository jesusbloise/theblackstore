"use client";

import { usePathname } from "next/navigation";
import { Header, type StoreNavigationCategory } from "@/components/layout/Header";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/layout/Footer";

export function StoreChrome({ categories, children }: { categories: StoreNavigationCategory[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdmin) return <>{children}</>;
  return <div className="tbs-storefront"><Header categories={categories} />{children}<Footer categories={categories} /><CartDrawer /></div>;
}
