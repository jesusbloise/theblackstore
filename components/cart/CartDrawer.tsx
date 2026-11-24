"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "./CartProvider";
import { getMediaUrl } from "@/lib/media-url";

const money = (value: number) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(value);

export function CartDrawer() {
  const { isCartOpen, closeCart, items, itemCount, subtotal, increaseQuantity, decreaseQuantity, removeItem, isHydrated } = useCart();
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  useEffect(() => { closeCart(); }, [pathname, closeCart]);
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (!isCartOpen) { if (el.open) el.close(); return; }
    if (!el.open) el.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; if (el.open) el.close(); };
  }, [isCartOpen]);

  return (
    <dialog ref={dialog} aria-labelledby="cart-drawer-title" onCancel={e => { e.preventDefault(); closeCart(); }} onClick={e => { if (e.target === e.currentTarget) closeCart(); }} className="fixed inset-0 m-0 h-[100dvh] max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/55">
      <aside className="ml-auto flex h-full w-full max-w-[460px] flex-col bg-[#F7F6F3] text-[#101010] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#ded8ce] px-6 py-5">
          <div><p className="text-[10px] uppercase tracking-[.2em] text-[#806b4e]">The Black Store</p><h2 id="cart-drawer-title" className="mt-1 text-2xl font-semibold">Mi bolsa <span className="text-base font-normal">({isHydrated ? itemCount : 0})</span></h2></div>
          <button type="button" autoFocus onClick={closeCart} aria-label="Cerrar bolsa" className="p-3 hover:bg-black/5"><X size={22}/></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6" aria-live="polite">
          {items.length === 0 ? <div className="flex h-full flex-col items-center justify-center gap-4 text-center"><ShoppingBag size={42} strokeWidth={1}/><h3 className="text-xl">Tu bolsa está vacía</h3><p className="text-sm text-neutral-600">Descubre nuestra selección de productos.</p><Link href="/productos" onClick={closeCart} className="bg-[#101010] px-6 py-3 text-sm text-white">Explorar productos</Link></div> : items.map(item => {
            const image = item.image?.startsWith("/") ? item.image : getMediaUrl(item.image);
            return <article key={item.cartItemId} className="flex gap-4 border-b border-[#ded8ce] py-5">
              <div className="flex h-24 w-20 shrink-0 items-center justify-center bg-[#ebe7e0]">{image ? <img src={image} alt={item.name} className="h-full w-full object-contain"/> : <ShoppingBag size={24} strokeWidth={1}/>}</div>
              <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div>{item.href ? <Link href={item.href} onClick={closeCart} className="text-sm font-semibold hover:underline">{item.name}</Link> : <p className="text-sm font-semibold">{item.name}</p>}{item.subtitle && <p className="mt-1 text-xs text-neutral-600">{item.subtitle}</p>}</div><button type="button" aria-label={`Eliminar ${item.name}`} onClick={() => removeItem(item.cartItemId)} className="p-1 text-neutral-600"><Trash2 size={16}/></button></div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center border border-[#ded8ce]"><button type="button" disabled={item.quantity <= 1} aria-label={`Reducir cantidad de ${item.name}`} onClick={() => decreaseQuantity(item.cartItemId)} className="p-2 disabled:opacity-30"><Minus size={14}/></button><span className="min-w-7 text-center text-sm">{item.quantity}</span><button type="button" disabled={item.quantity >= (item.maxQuantity ?? 100)} aria-label={`Aumentar cantidad de ${item.name}`} onClick={() => increaseQuantity(item.cartItemId)} className="p-2 disabled:opacity-30"><Plus size={14}/></button></div><span className="text-sm font-semibold">{money(item.price * item.quantity)}</span></div></div>
            </article>;
          })}
        </div>
        {items.length > 0 && <footer className="space-y-3 border-t border-[#ded8ce] bg-white px-6 py-5"><div className="flex justify-between text-lg font-semibold"><span>Subtotal</span><span>{money(subtotal)}</span></div><p className="text-xs text-neutral-600">El despacho y el total se confirman durante la compra.</p><Link href="/checkout" onClick={closeCart} className="block bg-[#101010] px-4 py-4 text-center text-sm font-semibold text-white hover:bg-[#333]">Continuar al pago →</Link><Link href="/carrito" onClick={closeCart} className="block border border-[#C3AA84] px-4 py-3 text-center text-sm">Ver carrito completo</Link><button type="button" onClick={closeCart} className="w-full py-2 text-center text-sm underline underline-offset-4">Seguir comprando</button></footer>}
      </aside>
    </dialog>
  );
}
