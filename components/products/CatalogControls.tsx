"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

type Sort = "recientes" | "precio-asc" | "precio-desc" | "nombre";
const SORTS: Sort[] = ["recientes", "precio-asc", "precio-desc", "nombre"];

export function CatalogControls({ count }: { count: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useSearchParams();
  const [q, setQ] = useState(current.get("q") ?? "");
  const [min, setMin] = useState(current.get("min") ?? "");
  const [max, setMax] = useState(current.get("max") ?? "");
  const activeSort = current.get("orden") ?? "recientes";
  const activeFilters = [current.get("q"), current.get("min"), current.get("max")].filter(Boolean).length;

  function go(values: { q?: string; min?: string; max?: string; orden?: string }) {
    const query = new URLSearchParams(current.toString());
    for (const key of ["q", "min", "max", "orden"] as const) {
      const value = values[key];
      if (value !== undefined) {
        if (value.trim() && !(key === "orden" && value === "recientes")) query.set(key, value.trim());
        else query.delete(key);
      }
    }
    query.delete("pagina");
    const search = query.toString();
    router.push(search ? `${pathname}?${search}` : pathname);
  }

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    go({ q, min, max });
    const details = (event.currentTarget.closest("details"));
    if (details) details.open = false;
  }

  function clear() {
    setQ(""); setMin(""); setMax("");
    go({ q: "", min: "", max: "" });
  }

  return (
    <div className="mt-9 border-y border-[#e9e5de] py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-sm border border-[#dcd7cf] bg-white px-4 py-2.5 text-sm font-medium text-[#101010] transition-colors hover:border-[#101010] [&::-webkit-details-marker]:hidden">
              <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 7h16M7 12h10M10 17h4"/></svg>
              Filtrar{activeFilters > 0 ? ` (${activeFilters})` : ""}
              <svg aria-hidden="true" className="transition-transform group-open:rotate-180" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </summary>
            <div className="absolute left-0 top-full z-30 mt-2 w-[min(340px,calc(100vw-40px))] rounded-sm border border-[#e7e2da] bg-white p-5 shadow-xl">
              <form onSubmit={apply} className="space-y-4">
                <label className="block text-xs font-medium text-[#555]">Buscar por nombre o marca
                  <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={100} placeholder="Buscar productos" className="mt-2 h-10 w-full border border-[#ded6c9] px-3 text-sm text-[#101010] outline-offset-2" />
                </label>
                <p className="text-xs font-medium text-[#555]">Rango de precio (CLP)</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs text-[#777]">Desde
                    <input type="number" min="0" step="1" value={min} onChange={(e) => setMin(e.target.value)} placeholder="$ Mínimo" className="mt-2 h-10 w-full min-w-0 border border-[#ded6c9] px-3 text-sm text-[#101010]" />
                  </label>
                  <label className="block text-xs text-[#777]">Hasta
                    <input type="number" min="0" step="1" value={max} onChange={(e) => setMax(e.target.value)} placeholder="$ Máximo" className="mt-2 h-10 w-full min-w-0 border border-[#ded6c9] px-3 text-sm text-[#101010]" />
                  </label>
                </div>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button type="button" onClick={clear} className="text-xs text-[#555] underline underline-offset-4 hover:text-[#101010]">Limpiar filtros</button>
                  <button type="submit" className="bg-[#101010] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#333]">Aplicar</button>
                </div>
              </form>
            </div>
          </details>
          <span className="text-xs text-[#777]">{count} {count === 1 ? "producto" : "productos"}</span>
        </div>
        <label className="flex items-center gap-2 text-xs text-[#777]">
          <span className="hidden sm:inline">Ordenar por</span>
          <select aria-label="Ordenar productos" value={SORTS.includes(activeSort as Sort) ? activeSort : "recientes"} onChange={(event) => go({ orden: event.target.value })} className="max-w-[175px] cursor-pointer bg-transparent py-2 text-sm text-[#101010] outline-offset-2">
            <option value="recientes">Más recientes</option>
            <option value="precio-asc">Menor precio</option>
            <option value="precio-desc">Mayor precio</option>
            <option value="nombre">Nombre A–Z</option>
          </select>
        </label>
      </div>
      {activeFilters > 0 && <button type="button" onClick={clear} className="mt-3 text-xs text-[#927451] underline underline-offset-4">Quitar filtros activos</button>}
    </div>
  );
}
