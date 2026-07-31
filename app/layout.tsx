import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Incal",
    template: "%s | Incal",
  },
  description:
    "Colchones, camas, camarotes, espumas dimensionadas y soluciones para el descanso.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={manrope.variable}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-white text-slate-950 antialiased">
        <CartProvider>
          <Header />

          {children}

          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}