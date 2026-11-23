"use client";

import { usePathname } from "next/navigation";
import { Header, type StoreNavigationCategory } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function StoreChrome({ categories, children }: { categories: StoreNavigationCategory[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdmin) return <>{children}</>;
  return <><Header categories={categories} />{children}<Footer /></>;
}
