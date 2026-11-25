import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { CartProvider } from "@/components/cart/CartProvider";
import { StoreChrome } from "@/components/layout/StoreChrome";
import { getNavigationCategories } from "@/lib/storefront";

import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  robots: { index: Boolean(getSiteUrl()), follow: Boolean(getSiteUrl()) },
  icons: { icon: "/brand-icon.svg" },
  title: {
    default: "The Black Store",
    template: "%s | The Black Store",
  },
  description:
    "Una selección de productos para tu estilo. Compra online con despacho por Chilexpress o retiro coordinado en Santiago.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getNavigationCategories();

  return (
    <html
      lang="es-CL"
      className={manrope.variable}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-[#F7F6F3] text-[#101010] antialiased">
        <CartProvider>
          <StoreChrome categories={categories}>{children}</StoreChrome>
        </CartProvider>
      </body>
    </html>
  );
}