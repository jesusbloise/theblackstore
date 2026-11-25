"use client";
import Link from "next/link";
import { Search, ShoppingBag, ArrowUpRight } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { CategoryDropdown } from "@/components/layout/CategoryDropdown";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Container } from "@/components/ui/Container";
export type StoreNavigationCategory = { id: string; name: string; slug: string; children: { id: string; name: string; slug: string }[] };
export function Header({ categories }: { categories: StoreNavigationCategory[] }) {
 const { itemCount, isHydrated, openCart } = useCart();
 return <header className="relative z-40 bg-[#101010] text-[#F7F6F3]">
  <div className="border-b border-white/10 bg-[#242424] px-4 py-2 text-center text-[11px] tracking-wide text-[#F7F6F3]">Despachos por Chilexpress a todo Chile · Retiro coordinado en Santiago</div>
  <Container><div className="grid min-h-20 grid-cols-[auto_1fr_auto] items-center gap-2 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
   <div className="lg:hidden"><MobileMenu categories={categories}/></div>
   <form action="/productos" className="hidden max-w-xs items-center gap-3 border-b border-white/30 lg:flex"><Search size={18}/><input name="q" type="search" placeholder="¿Qué estás buscando?" aria-label="Buscar productos" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/60"/><button type="submit" aria-label="Buscar" className="p-2"><ArrowUpRight size={16}/></button></form>
   <Link href="/" className="justify-self-center whitespace-nowrap text-center text-[11px] font-semibold tracking-[.08em] min-[380px]:text-sm min-[380px]:tracking-[.16em] sm:text-xl lg:text-2xl">THE BLACK STORE</Link>
   <button type="button" onClick={openCart} className="flex items-center gap-2 justify-self-end text-sm" aria-label={`Ver bolsa de compra, ${isHydrated ? itemCount : 0} artículos`}><ShoppingBag size={23}/><span className="hidden lg:inline">Mi bolsa</span><span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#C3AA84] px-1 text-xs font-semibold text-[#101010]">{isHydrated ? itemCount : 0}</span></button>
  </div><form action="/productos" className="mb-4 flex items-center gap-2 border border-white/25 px-3 lg:hidden"><Search size={18}/><input name="q" type="search" placeholder="Buscar productos" aria-label="Buscar productos" className="h-11 min-w-0 flex-1 bg-transparent text-sm placeholder:text-white/60"/><button type="submit" aria-label="Buscar" className="p-2"><ArrowUpRight size={16}/></button></form>
  <nav aria-label="Categorías de la tienda" className="hidden flex-wrap items-center justify-center gap-x-8 border-t border-white/15 text-sm lg:flex">
   <Link href="/productos" className="py-4 text-[#C3AA84] hover:underline">Todos los productos</Link>
   <Link href="/productos?orden=recientes" className="py-4 hover:text-[#C3AA84]">Novedades</Link>
   {categories.map(c=><CategoryDropdown key={c.id} label={c.name} href={`/categoria/${c.slug}`} links={c.children.map(s=>({label:s.name,href:`/categoria/${s.slug}`}))}/>)}
  </nav></Container>
 </header>;
}
