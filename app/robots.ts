import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  if (!site) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin", "/api/auth", "/api/cart", "/carrito", "/checkout"] }, sitemap: new URL("/sitemap.xml", site).href };
}
