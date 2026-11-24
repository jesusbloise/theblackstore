"use client";
import Link from "next/link";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
type DropdownLink = { label: string; href: string };
export function CategoryDropdown({ label, href, links }: {label:string;href:string;links:DropdownLink[]}) {
 const [open,setOpen]=useState(false);
 const pathname=usePathname();
 useEffect(()=>setOpen(false),[pathname]);
 return <div className="relative flex items-center" onMouseLeave={()=>setOpen(false)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false)}} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);}}}>
  <Link href={href} onClick={()=>setOpen(false)} className="py-4 capitalize hover:text-[#C3AA84]">{label}</Link>
  {links.length>0&&<><button type="button" aria-label={`Subcategorías de ${label}`} aria-expanded={open} onClick={()=>setOpen(v=>!v)} className="ml-1 p-2 hover:text-[#C3AA84]"><ChevronDown size={15} className={open?'rotate-180':''}/></button>
  {open&&<div className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 border border-[#ded6c9] bg-[#F7F6F3] p-5 text-[#101010] shadow-xl"><p className="mb-3 text-xs uppercase tracking-widest text-[#927451]">Explora la colección</p><Link href={href} onClick={()=>setOpen(false)} className="flex items-center justify-between border-b border-[#ded6c9] pb-3 font-semibold">Ver todo en {label}<ArrowUpRight size={16}/></Link><ul className="mt-2">{links.map(link=><li key={link.href}><Link href={link.href} onClick={()=>setOpen(false)} className="block px-2 py-3 capitalize hover:bg-[#eae5dc]">{link.label}</Link></li>)}</ul></div>}</>}
 </div>;
}
