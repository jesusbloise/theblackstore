import { getMediaUrl } from "@/lib/media-url";
import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { ArrowUpRight } from "lucide-react";

type ProductCardProps = { name:string; category:string; price:number; originalPrice?:number; href:string; image?:string; secondaryImage?:string; soldOut?:boolean; isNew?:boolean };
export function ProductCard({name,category,price,originalPrice,href,image,secondaryImage,soldOut,isNew}:ProductCardProps) {
  const primary = getMediaUrl(image);
  const secondary = getMediaUrl(secondaryImage);
  const offer = typeof originalPrice === "number" && originalPrice > price;
  return <article className="group flex h-full min-w-0 flex-col bg-white">
    <Link href={href} aria-label={`Ver ${name}`} className="relative block aspect-[4/5] overflow-hidden bg-[#F0EEEA]">
      {primary ? <img src={primary} alt={name} loading="lazy" className="h-full w-full object-contain p-3 transition duration-500 motion-safe:group-hover:scale-105"/> : <div className="flex h-full items-center justify-center p-3 text-center text-xs text-[#777]">Fotografía próximamente</div>}
      {primary && secondary && <img src={secondary} alt="" loading="lazy" className="absolute inset-0 h-full w-full bg-[#F0EEEA] object-contain p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"/>}
      {(soldOut || offer || isNew) && <span className={`absolute left-2 top-2 px-2.5 py-1.5 text-[10px] uppercase tracking-wider sm:left-3 sm:top-3 ${soldOut ? 'bg-white text-[#555]' : offer ? 'bg-[#101010] text-white' : 'bg-[#C3AA84] text-[#101010]'}`}>{soldOut ? 'Agotado' : offer ? 'Oferta' : 'Nuevo'}</span>}
    </Link>
    <div className="flex flex-1 flex-col px-1 py-4 sm:px-2">
      <p className="text-[10px] uppercase tracking-widest text-[#927451]">{category}</p>
      <Link href={href} className="mt-2 text-sm font-medium leading-snug hover:underline sm:text-base">{name}</Link>
      <div className="mt-3"><Price price={price} originalPrice={originalPrice} size="sm"/></div>
      <Link href={href} className="mt-auto flex items-center justify-between gap-1 border-b border-[#ded6c9] pt-4 pb-2 text-xs font-medium hover:border-black sm:text-sm">{soldOut ? 'Ver detalles' : 'Ver producto'}<ArrowUpRight size={15}/></Link>
    </div>
  </article>;
}
