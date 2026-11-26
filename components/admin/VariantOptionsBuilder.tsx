"use client";

import { useState } from "react";

export type StoreVariantDraft = {
  id?: string;
  updatedAt?: string;
  name: string;
  sku: string;
  price: string;
  stock: string;
  isActive: boolean;
  attributes: {
    name: string;
    value: string;
  }[];
};

type Option = { name: string; values: string };
const clean = (value: string) => value.trim().replace(/\s+/g, " ");
const skuPart = (value: string) => clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");

export function VariantOptionsBuilder({ variants, onChange, defaultSkuPrefix = "PROD" }: {
  variants: StoreVariantDraft[];
  onChange: (variants: StoreVariantDraft[]) => void;
  defaultSkuPrefix?: string;
}) {
  const [options, setOptions] = useState<Option[]>([{ name: "Talla", values: "S,M,L,XL" }, { name: "Color", values: "Negro" }].map(o => ({ name: o.name, values: o.values })));
  const [basePrice, setBasePrice] = useState("20000");
  const [defaultStock, setDefaultStock] = useState("0");
  const [prefix, setPrefix] = useState(defaultSkuPrefix);
  const [message, setMessage] = useState("");
  function generate() {
    setMessage("");
    const valid = options.map(o => ({ name: clean(o.name), values: o.values.split(",").map(clean).filter(Boolean) })).filter(o => o.name && o.values.length);
    if (!valid.length) { setMessage("Agrega al menos una opción con valores separados por comas."); return; }
    if (new Set(valid.map(o => o.name.toLowerCase())).size !== valid.length) { setMessage("Los nombres de las opciones no pueden repetirse."); return; }
    if (valid.some(o => new Set(o.values.map(v => v.toLowerCase())).size !== o.values.length)) { setMessage("Hay valores duplicados en una opción."); return; }
    const totalCombinations = valid.reduce(
      (total, option) => total * option.values.length,
      1,
    );

    if (totalCombinations > 100) {
      setMessage("Máximo 100 combinaciones por generación.");
      return;
    }

    const combinations = valid.reduce<
      { name: string; value: string }[][]
    >(
      (acc, option) =>
        acc.flatMap((attributes) =>
          option.values.map((value) => [
            ...attributes,
            {
              name: option.name,
              value,
            },
          ]),
        ),
      [[]],
    );
    const starting =
      variants.length === 1 &&
        !variants[0].id &&
        variants[0].name === "Única" &&
        !variants[0].sku.trim() &&
        !variants[0].price.trim()
        ? []
        : variants;
    const known = new Set(starting.map(v => v.attributes.map(a => `${a.name.toLowerCase()}=${a.value.toLowerCase()}`).sort().join("|")));
    const existingSkus = new Set(starting.map(v => v.sku.toUpperCase()));
    const additions: StoreVariantDraft[] = [];
    for (const attrs of combinations) {
      const key = attrs.map(a => `${a.name.toLowerCase()}=${a.value.toLowerCase()}`).sort().join("|");
      if (known.has(key)) continue;
      const baseSku = [skuPart(prefix) || "PROD", ...attrs.map(a => skuPart(a.value))].join("-");
      let sku = baseSku; let n = 2;
      while (existingSkus.has(sku)) sku = `${baseSku}-${n++}`;
      existingSkus.add(sku);
      additions.push({ name: attrs.map(a => a.value).join(" / "), sku, price: basePrice, stock: defaultStock, isActive: true, attributes: attrs });
    }
    onChange([...starting, ...additions]);
    setMessage(additions.length ? `${additions.length} variantes agregadas. Revisa los SKU antes de guardar.` : "Estas combinaciones ya existen.");
  }
  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";
  return <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div><h3 className="font-semibold">Generar tallas, colores y otras opciones</h3><p className="text-xs text-slate-600">Escribe valores separados por comas. Ej.: 32,34,36 o Negro,Azul.</p></div>
    {options.map((option, i) => <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] gap-2">
      <input aria-label={`Nombre de opción ${i + 1}`} className={input} value={option.name} placeholder="Talla" onChange={e => setOptions(prev => prev.map((o, j) => j === i ? { ...o, name: e.target.value } : o))} />
      <input aria-label={`Valores de opción ${i + 1}`} className={input} value={option.values} placeholder="S,M,L,XL" onChange={e => setOptions(prev => prev.map((o, j) => j === i ? { ...o, values: e.target.value } : o))} />
      <button type="button" className="px-2 text-red-700" onClick={() => setOptions(prev => prev.filter((_, j) => j !== i))}>Quitar</button>
    </div>)}
    <button type="button" className="text-sm underline" disabled={options.length >= 3} onClick={() => setOptions(prev => [...prev, { name: "", values: "" }])}>+ Otra opción</button>
    <div className="grid gap-2 sm:grid-cols-3">
      <label className="text-xs">Prefijo SKU<input className={`${input} mt-1`} value={prefix} onChange={e => setPrefix(e.target.value)} /></label>
      <label className="text-xs">Precio inicial CLP<input type="number" min="0" step="1" className={`${input} mt-1`} value={basePrice} onChange={e => setBasePrice(e.target.value)} /></label>
      <label className="text-xs">Stock por variante<input type="number" min="0" step="1" className={`${input} mt-1`} value={defaultStock} onChange={e => setDefaultStock(e.target.value)} /></label>
    </div>
    <button type="button" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" onClick={generate}>Generar combinaciones</button>
    {message && <p role="status" className="text-sm text-slate-700">{message}</p>}
  </div>;
}
