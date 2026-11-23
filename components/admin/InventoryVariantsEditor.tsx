"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VariantOptionsBuilder, type StoreVariantDraft } from "@/components/admin/VariantOptionsBuilder";

type ExistingVariant = StoreVariantDraft & { id?: string };
export function InventoryVariantsEditor({ productId, initialVariants, prefix }: {
  productId: string;
  initialVariants: (Omit<StoreVariantDraft, "price" | "stock"> & { id: string; price: number; stock: number })[];
  prefix: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<ExistingVariant[]>(initialVariants.map(v => ({...v,price:String(v.price),stock:String(v.stock)})));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const input = "w-full min-w-20 rounded-lg border border-slate-300 px-2 py-2 text-sm";
  function change(i: number, patch: Partial<ExistingVariant>) { setRows(prev=>prev.map((v,j)=>i===j?{...v,...patch}:v)); }
  async function save() {
    if (saving) return;
    setError("");setMessage("");
    if (rows.some(v=>!v.name.trim() || v.sku.trim().length<2 || !Number.isInteger(Number(v.price)) || Number(v.price)<0 || !Number.isInteger(Number(v.stock)) || Number(v.stock)<0)) {setError("Revisa nombre, SKU, precio y stock.");return;}
    if (new Set(rows.map(v=>v.sku.trim().toUpperCase())).size !== rows.length) {setError("Los SKU no pueden repetirse.");return;}
    setSaving(true);
    try {
      for (const row of rows) {
        const url = row.id ? `/api/admin/products/${productId}/variants/${row.id}` : `/api/admin/products/${productId}/variants`;
        const response = await fetch(url,{method:row.id?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:row.name,sku:row.sku,price:Number(row.price),stock:Number(row.stock),isActive:row.isActive,attributes:row.attributes})});
        const data = await response.json() as {ok?:boolean;message?:string};
        if (!response.ok || !data.ok) throw new Error(`${row.sku}: ${data.message || "Error al guardar"}`);
      }
      setMessage("Inventario guardado correctamente.");router.refresh();
    } catch(e) {setError(`${e instanceof Error ? e.message : "Error"}. Algunas variantes pueden haberse guardado; recarga la página antes de reintentar.`);}
    finally {setSaving(false);}
  }
  return <div className="space-y-4">
    <VariantOptionsBuilder variants={rows} onChange={next=>setRows(next.map((v,i)=>({...v,id:rows[i]===v?rows[i].id:undefined})))} defaultSkuPrefix={prefix}/>
    <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b text-left"><th className="p-2">Variante</th><th className="p-2">SKU</th><th className="p-2">Precio CLP</th><th className="p-2">Stock</th><th className="p-2">Activa</th><th className="p-2"></th></tr></thead><tbody>
      {rows.map((row,i)=><tr key={row.id ?? `new-${i}`} className="border-b align-top"><td className="p-2"><input className={input} value={row.name} onChange={e=>change(i,{name:e.target.value})}/><span className="text-xs text-slate-500">{row.attributes.map(a=>`${a.name}: ${a.value}`).join(" · ")}</span></td><td className="p-2"><input className={input} value={row.sku} onChange={e=>change(i,{sku:e.target.value})}/></td><td className="p-2"><input className={input} type="number" min="0" value={row.price} onChange={e=>change(i,{price:e.target.value})}/></td><td className="p-2"><input className={input} type="number" min="0" value={row.stock} onChange={e=>change(i,{stock:e.target.value})}/></td><td className="p-2"><input type="checkbox" checked={row.isActive} onChange={e=>change(i,{isActive:e.target.checked})}/></td><td className="p-2">{!row.id && <button type="button" className="text-red-700" onClick={()=>setRows(prev=>prev.filter((_,j)=>j!==i))}>Quitar</button>}</td></tr>)}
    </tbody></table></div>
    <div className="flex items-center justify-between"><p className="text-sm text-slate-600">Stock total: <strong>{rows.filter(r=>r.isActive).reduce((n,r)=>n+(Number(r.stock)||0),0)}</strong> unidades</p><button type="button" disabled={saving} onClick={save} className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving?"Guardando...":"Guardar variantes e inventario"}</button></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
  </div>;
}
