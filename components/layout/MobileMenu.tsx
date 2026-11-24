"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import type { StoreNavigationCategory } from "@/components/layout/Header";
export function MobileMenu({ categories }: { categories: StoreNavigationCategory[] }) {
 const [open,setOpen]=useState(false); const [expanded,setExpanded]=useState<string|null>(null);
 useEffect(()=>{if(!open)return;const old=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=old}},[open]);
 useEffect(()=>{if(!open)return;const handler=(e:KeyboardEvent)=>{if(e.key==="Escape"){setOpen(false);setExpanded(null)}};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler)},[open]);
 const close=()=>{setOpen(false);setExpanded(null)};
 return <><button type="button" aria-label="Abrir menú" aria-expanded={open} onClick={()=>setOpen(true)} className="rounded-full p-2 lg:hidden"><Menu size={24}/></button>
 {open&&<div className="fixed inset-0 z-[100] lg:hidden"><button type="button" aria-label="Cerrar menú" onClick={close} className="absolute inset-0 bg-black/60"/><aside className="absolute right-0 top-0 flex h-full w-[90%] max-w-sm flex-col overflow-y-auto bg-[#F7F6F3] text-[#101010] p-6 shadow-2xl"><div className="flex items-center justify-between border-b border-[#ded6c9] pb-5"><Link href="/" onClick={close} className="font-semibold tracking-[.12em]">THE BLACK STORE</Link><button onClick={close} aria-label="Cerrar menú"><X/></button></div>
 <form action="/productos" className="mt-6"><input name="q" type="search" placeholder="Buscar productos" aria-label="Buscar productos" className="w-full rounded-lg border border-[#ded6c9] bg-white p-3"/></form>
 <nav className="mt-6"><Link href="/productos" onClick={close} className="block border-b border-[#ded6c9] py-4 font-medium">Todos los productos</Link><Link href="/productos?orden=recientes" onClick={close} className="block border-b border-[#ded6c9] py-4 font-medium">Novedades</Link>{categories.map(c=><div key={c.id} className="border-b border-[#ded6c9]"><div className="flex items-center justify-between"><Link onClick={close} href={`/categoria/${c.slug}`} className="flex-1 py-4 font-medium">{c.name}</Link>{c.children.length>0&&<button type="button" onClick={()=>setExpanded(expanded===c.id?null:c.id)} aria-label={`Mostrar subcategorías de ${c.name}`} aria-expanded={expanded===c.id} className="p-3"><ChevronDown size={18}/></button>}</div>{expanded===c.id&&<div className="pb-3 pl-4">{c.children.map(s=><Link key={s.id} href={`/categoria/${s.slug}`} onClick={close} className="block py-2 text-sm text-[#555]">{s.name}</Link>)}</div>}</div>)}</nav><Link href="/carrito" onClick={close} className="mt-8 rounded-lg bg-[#101010] p-4 text-center text-white">Ver carrito</Link></aside></div>}</>;
}
