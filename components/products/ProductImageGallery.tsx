"use client";
import { useRef, useState } from "react";
import { Expand, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getMediaUrl } from "@/lib/media-url";
export function ProductImageGallery({images,productName}:{images:string[];productName:string}) {
 const [index,setIndex]=useState(0); const dialog=useRef<HTMLDialogElement>(null);
 const selected=images[index] ?? images[0];
 function move(delta:number){setIndex(i=>(i+delta+images.length)%images.length);}
 if(!selected)return <div className="flex aspect-square items-center justify-center bg-[#F7F6F3] text-sm text-neutral-500">Fotografía próximamente</div>;
 return <div className="min-w-0"><button type="button" onClick={()=>dialog.current?.showModal()} aria-label="Ampliar fotografía" className="group relative block aspect-square w-full overflow-hidden bg-[#F7F6F3]"><img src={getMediaUrl(selected)??undefined} alt={productName} className="h-full w-full object-contain p-4 transition-transform duration-300 motion-safe:group-hover:scale-105"/><span className="absolute bottom-4 right-4 bg-white p-3"><Expand size={20}/></span></button>
 {images.length>1&&<div className="mt-3 flex gap-3 overflow-x-auto pb-2">{images.map((src,i)=><button type="button" key={i} aria-label={`Fotografía ${i+1}`} aria-pressed={i===index} onClick={()=>setIndex(i)} className={`size-20 shrink-0 border bg-[#F7F6F3] ${i===index?'border-[#101010]':'border-[#e5dfd6]'}`}><img src={getMediaUrl(src)??undefined} alt={`${productName} ${i+1}`} className="h-full w-full object-contain"/></button>)}</div>}
 <dialog ref={dialog} aria-label={`Galería de ${productName}`} className="fixed inset-0 m-auto max-h-[95dvh] w-[94vw] max-w-5xl bg-white p-4 backdrop:bg-black/80" onKeyDown={e=>{if(images.length>1&&e.key==='ArrowLeft')move(-1);if(images.length>1&&e.key==='ArrowRight')move(1);}}><div className="flex items-center justify-between gap-4"><p className="text-sm">{productName} · {index+1}/{images.length}</p><button type="button" aria-label="Cerrar galería" onClick={()=>dialog.current?.close()} className="p-3"><X/></button></div><img src={getMediaUrl(selected)??undefined} alt={productName} className="mx-auto max-h-[70dvh] w-full object-contain"/>{images.length>1&&<div className="flex justify-center gap-4"><button type="button" aria-label="Anterior" onClick={()=>move(-1)} className="border p-3"><ChevronLeft/></button><button type="button" aria-label="Siguiente" onClick={()=>move(1)} className="border p-3"><ChevronRight/></button></div>}</dialog></div>;
}
