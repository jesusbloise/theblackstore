import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { StoreNavigationCategory } from "@/components/layout/Header";
export function FeaturedCategories({categories}:{categories:StoreNavigationCategory[]}){
 if(categories.length===0)return null;
 return <section className="py-16 sm:py-24"><Container><p className="text-xs font-semibold uppercase tracking-[.24em] text-[#927451]">Descubre</p><div className="mt-3 flex items-end justify-between gap-4"><h2 className="text-3xl font-medium tracking-tight sm:text-4xl">Compra por categoría</h2><Link href="/productos" className="text-sm underline underline-offset-4">Ver productos</Link></div><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{categories.slice(0,8).map((c,i)=><Link href={`/categoria/${c.slug}`} key={c.id} className="group flex min-h-48 flex-col justify-between border border-[#ded6c9] bg-white p-6 transition hover:border-[#C3AA84] hover:shadow-lg"><span className="text-xs tracking-widest text-[#927451]">{String(i+1).padStart(2,'0')}</span><div><h3 className="text-2xl font-medium">{c.name}</h3><p className="mt-3 text-sm text-[#777]">Explorar colección →</p></div></Link>)}</div></Container></section>;
}
