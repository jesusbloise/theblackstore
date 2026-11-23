import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { CartProvider } from "@/components/cart/CartProvider";
import { StoreChrome } from "@/components/layout/StoreChrome";
import { getNavigationCategories } from "@/lib/storefront";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
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
      lang="es"
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