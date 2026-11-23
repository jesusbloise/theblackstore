"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { VariantOptionsBuilder, type StoreVariantDraft } from "@/components/admin/VariantOptionsBuilder";

type Category = { id: string; name: string; parentName?: string };
type Variant = StoreVariantDraft;
const emptyVariant = (): Variant => ({ name: "Única", sku: "", price: "", stock: "0", isActive: true, attributes: [] });
const slugify = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const MAX_IMAGES = 5;
const generateSku = () => `TBS-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;

export function NewProductCompleteForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [customSlug, setCustomSlug] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);
  // Generate once in the browser to avoid server/client hydration mismatches.
  // Never overwrite a SKU the merchant entered manually.
  useEffect(() => {
    setVariants(current => current.map(v => v.sku.trim() ? v : { ...v, sku: generateSku() }));
  }, []);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("");
  const previews = useMemo(() => files.map(file => ({ file, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach(p => URL.revokeObjectURL(p.url)), [previews]);
  useEffect(() => { if (!customSlug) setSlug(slugify(name)); }, [name, customSlug]);
  const sellable = variants.some(v => v.isActive && Number(v.price) > 0 && v.sku.trim().length >= 2 && v.name.trim().length >= 2);
  const inputClass = "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900";
  const updateVariant = (index: number, patch: Partial<Variant>) => setVariants(prev => prev.map((v, i) => i === index ? { ...v, ...patch } : v));
  async function api(url: string, method: string, body: unknown) {
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json() as { ok?: boolean; message?: string; product?: { id: string } };
    if (!response.ok || !result.ok) throw new Error(result.message || "No fue posible guardar los datos.");
    return result;
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError("");
    if (status === "PUBLISHED" && !sellable) { setError("Para publicar, agrega una variante activa con SKU y precio mayor a $0."); return; }
    if (variants.some(v => !v.name.trim() || v.sku.trim().length < 2 || !Number.isInteger(Number(v.price)) || Number(v.price) < 0 || !Number.isInteger(Number(v.stock)) || Number(v.stock) < 0)) {
      setError("Revisa nombre, SKU, precio y stock de todas las variantes."); return;
    }
    setSaving(true);
    let productId: string | undefined;
    try {
      setStage("Guardando producto...");
      const payload = { name: name.trim(), slug: slugify(slug), categoryId, brand: brand.trim(), description: description.trim() };
      const created = await api("/api/admin/products", "POST", { ...payload, status: "DRAFT" });
      productId = created.product?.id;
      if (!productId) throw new Error("El servidor no devolvió el ID del producto.");
      for (let i = 0; i < variants.length; i++) {
        setStage(`Guardando variante ${i + 1} de ${variants.length}...`);
        const v = variants[i];
        await api(`/api/admin/products/${productId}/variants`, "POST", { name: v.name.trim(), sku: v.sku.trim(), price: Number(v.price), stock: Number(v.stock), isActive: v.isActive, manageInventory: true, allowBackorder: false, attributes: v.attributes });
      }
      for (let i = 0; i < files.length; i++) {
        setStage(`Subiendo imagen ${i + 1} de ${files.length}...`);
        const data = new FormData(); data.append("file", files[i]); data.append("alt", name.trim());
        const response = await fetch(`/api/admin/products/${productId}/images`, { method: "POST", body: data });
        const result = await response.json() as { ok?: boolean; message?: string };
        if (!response.ok || !result.ok) throw new Error(result.message || `No se pudo subir ${files[i].name}`);
      }
      if (status === "PUBLISHED") {
        setStage("Publicando producto...");
        await api(`/api/admin/products/${productId}`, "PATCH", { ...payload, status: "PUBLISHED" });
      }
      router.push(`/admin/productos/${productId}/editar`);
      router.refresh();
    } catch (err) {
      setError(`${err instanceof Error ? err.message : "Error al guardar."}${productId ? " El producto ya quedó creado como borrador; abre su edición para completarlo y evita crearlo otra vez." : ""}`);
      if (productId) setStage(`Borrador creado: /admin/productos/${productId}/editar`);
    } finally { setSaving(false); }
  }
  return <form onSubmit={submit} className="space-y-8">
    <section className="space-y-4"><h2 className="text-xl font-bold">Información general</h2>
      <label className="block text-sm font-semibold">Nombre *<input required minLength={2} className={`${inputClass} mt-2`} value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Camisa de lino negra" /></label>
      <label className="block text-sm font-semibold">URL del producto *<input required className={`${inputClass} mt-2`} value={slug} onChange={e => { setSlug(slugify(e.target.value)); setCustomSlug(true); }} /></label>
      <label className="block text-sm font-semibold">Categoría *<select required className={`${inputClass} mt-2`} value={categoryId} onChange={e => setCategoryId(e.target.value)}><option value="">Selecciona una categoría</option>{categories.map(c => <option key={c.id} value={c.id}>{c.parentName ? `${c.parentName} → ` : ""}{c.name}</option>)}</select></label>
      <label className="block text-sm font-semibold">Marca<input className={`${inputClass} mt-2`} value={brand} onChange={e => setBrand(e.target.value)} /></label>
      <label className="block text-sm font-semibold">Descripción<textarea className={`${inputClass} mt-2 min-h-28`} value={description} onChange={e => setDescription(e.target.value)} /></label>
    </section>
    <section className="space-y-4 border-t pt-6"><VariantOptionsBuilder variants={variants} onChange={setVariants} defaultSkuPrefix={slug.slice(0,12) || "PROD"}/><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Variantes y precios</h2><p className="text-sm text-slate-500">Para un producto sin tallas, deja la variante «Única».</p></div><button type="button" onClick={() => setVariants(v => [...v, { ...emptyVariant(), name: "", sku: generateSku() }])} className="rounded-xl border px-4 py-2 text-sm font-semibold">+ Agregar variante</button></div>
      {variants.map((v, i) => <div key={i} className="space-y-3 rounded-xl border border-slate-200 p-4"><div className="flex justify-between"><strong>Variante {i + 1}{v.attributes.length ? ` · ${v.attributes.map(a=>`${a.name}: ${a.value}`).join(" · ")}` : ""}</strong>{variants.length > 1 && <button type="button" className="text-sm text-red-600" onClick={() => setVariants(prev => prev.filter((_, j) => i !== j))}>Eliminar</button>}</div><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Nombre / talla / color<input required minLength={2} className={`${inputClass} mt-1`} value={v.name} onChange={e => updateVariant(i, { name: e.target.value })} placeholder="Ej. Negra / M" /></label><label className="text-sm">SKU (automático, editable) *<input required minLength={2} className={`${inputClass} mt-1`} value={v.sku} onChange={e => updateVariant(i, { sku: e.target.value })} placeholder="Se genera automáticamente" /><span className="mt-1 block text-xs text-slate-500">Puedes reemplazarlo por el código del proveedor.</span></label><label className="text-sm">Precio CLP *<input required min={0} step={1} type="number" className={`${inputClass} mt-1`} value={v.price} onChange={e => updateVariant(i, { price: e.target.value })} /></label><label className="text-sm">Stock *<input required min={0} step={1} type="number" className={`${inputClass} mt-1`} value={v.stock} onChange={e => updateVariant(i, { stock: e.target.value })} /></label></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.isActive} onChange={e => updateVariant(i, { isActive: e.target.checked })} /> Variante activa</label></div>)}
    </section>
    <section className="space-y-3 border-t pt-6"><h2 className="text-xl font-bold">Fotografías</h2><p className="text-sm text-slate-500">Selecciona hasta 5 imágenes JPG, PNG o WebP de máximo 5 MB cada una. Se subirán automáticamente al guardar el producto, sin otro botón.</p><input className={inputClass} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e => { const chosen = Array.from(e.target.files || []); if (chosen.length > MAX_IMAGES || chosen.some(f => !["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 5 * 1024 * 1024)) { setError("Máximo 5 fotografías JPG, PNG o WebP de hasta 5 MB."); e.target.value = ""; return; } setError(""); setFiles(chosen); }} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{previews.map((p, i) => <div key={`${p.file.name}-${i}`} className="relative"><img src={p.url} alt={p.file.name} className="aspect-square w-full rounded-lg object-cover" /><button type="button" className="absolute right-1 top-1 rounded-full bg-white px-2 text-sm" onClick={() => setFiles(v => v.filter((_, j) => j !== i))} aria-label="Quitar fotografía">×</button></div>)}</div></section>
    <section className="space-y-4 border-t pt-6"><h2 className="text-xl font-bold">Estado</h2><select className={inputClass} value={status} onChange={e => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}><option value="DRAFT">Guardar como borrador</option><option value="PUBLISHED">Publicar producto</option></select>{status === "PUBLISHED" && !sellable && <p className="text-sm text-amber-700">Necesitas al menos una variante activa con SKU y precio mayor que $0.</p>}</section>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}{stage.startsWith("Borrador creado:") && <a className="ml-2 font-bold underline" href={stage.slice("Borrador creado: ".length)}>Abrir borrador</a>}</div>}
    {saving && <p role="status" className="text-sm text-slate-600">{stage}</p>}
    <button disabled={saving || (status === "PUBLISHED" && !sellable)} className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : status === "PUBLISHED" ? "Crear y publicar producto" : "Guardar producto como borrador"}</button>
  </form>;
}
