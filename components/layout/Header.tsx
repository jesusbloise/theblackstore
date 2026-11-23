"use client";
import Link from "next/link";
import { Search, ShoppingBag, UserRound } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { CategoryDropdown } from "@/components/layout/CategoryDropdown";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Container } from "@/components/ui/Container";
export type StoreNavigationCategory = { id: string; name: string; slug: string; children: { id: string; name: string; slug: string }[] };
export function Header({ categories }: { categories: StoreNavigationCategory[] }) {
 const { itemCount, isHydrated } = useCart();
 return <header className="relative z-40 border-b border-[#e8e5df] bg-[#F7F6F3]">
  <div className="bg-[#101010] py-2 text-center text-[11px] tracking-wide text-[#F7F6F3] sm:text-xs">Despachos por Chilexpress a todo Chile · Retiro coordinado en Santiago</div>
  <Container><div className="flex min-h-20 items-center gap-4">
   <Link href="/" className="shrink-0 text-lg font-semibold tracking-[.13em] text-[#101010] sm:text-2xl">THE BLACK STORE</Link>
   <form action="/productos" className="ml-auto hidden max-w-lg flex-1 items-center gap-2 rounded-full border border-[#ded6c9] bg-white px-4 md:flex"><Search size={18}/><input name="q" type="search" placeholder="Buscar productos" aria-label="Buscar productos" className="h-11 w-full bg-transparent text-sm outline-none"/></form>
   <div className="ml-auto flex items-center gap-4 md:ml-0"><Link href="/carrito" className="inline-flex items-center gap-2 text-sm" aria-label="Ver carrito"><ShoppingBag size={21}/><span>{isHydrated ? itemCount : 0}</span></Link><MobileMenu categories={categories}/></div>
  </div><nav className="hidden flex-wrap items-center gap-x-8 border-t border-[#e8e5df] text-sm lg:flex">
   <Link href="/productos" className="py-4 font-medium">Todos los productos</Link>
   {categories.map(c=><CategoryDropdown key={c.id} label={c.name} href={`/categoria/${c.slug}`} links={c.children.map(s=>({label:s.name,href:`/categoria/${s.slug}`}))}/>)}
  </nav></Container>
 </header>;
}
