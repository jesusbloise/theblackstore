"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Filter,
  PackageSearch,
  X,
} from "lucide-react";

import { ProductCard } from "@/components/products/ProductCard";
import {
  ProductFilters,
  type CatalogFilters,
} from "@/components/products/ProductFilters";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";

export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  href: string;
  type: "espuma" | "resortes" | "a-medida";
  sizes: string[];
  relevance: number;
  sales: number;
  createdAt: string;
};

type ProductCatalogProps = {
  products: CatalogProduct[];
};

type SortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "best-selling"
  | "newest";

const initialFilters: CatalogFilters = {
  types: [],
  sizes: [],
  minPrice: "",
  maxPrice: "",
};

const PRODUCTS_PER_PAGE = 6;

function parsePrice(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
}

export function ProductCatalog({
  products,
}: ProductCatalogProps) {
  const [filters, setFilters] =
    useState<CatalogFilters>(initialFilters);

  const [sort, setSort] =
    useState<SortOption>("relevance");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  useEffect(() => {
    if (!mobileFiltersOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileFiltersOpen]);

  const filteredProducts = useMemo(() => {
    const minPrice = parsePrice(
      filters.minPrice,
    );

    const maxPrice = parsePrice(
      filters.maxPrice,
    );

    return products.filter((product) => {
      const matchesType =
        filters.types.length === 0 ||
        filters.types.includes(product.type);

      const matchesSize =
        filters.sizes.length === 0 ||
        filters.sizes.some((size) =>
          product.sizes.includes(size),
        );

      const matchesMinPrice =
        minPrice === null ||
        product.price >= minPrice;

      const matchesMaxPrice =
        maxPrice === null ||
        product.price <= maxPrice;

      return (
        matchesType &&
        matchesSize &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });
  }, [filters, products]);

  const sortedProducts = useMemo(() => {
    const result = [...filteredProducts];

    switch (sort) {
      case "price-asc":
        return result.sort(
          (a, b) => a.price - b.price,
        );

      case "price-desc":
        return result.sort(
          (a, b) => b.price - a.price,
        );

      case "best-selling":
        return result.sort(
          (a, b) => b.sales - a.sales,
        );

      case "newest":
        return result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
        );

      case "relevance":
      default:
        return result.sort(
          (a, b) =>
            b.relevance - a.relevance,
        );
    }
  }, [filteredProducts, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedProducts.length /
        PRODUCTS_PER_PAGE,
    ),
  );

  const pageProducts = useMemo(() => {
    const startIndex =
      (currentPage - 1) *
      PRODUCTS_PER_PAGE;

    return sortedProducts.slice(
      startIndex,
      startIndex +
        PRODUCTS_PER_PAGE,
    );
  }, [currentPage, sortedProducts]);

  function updateFilters(
    newFilters: CatalogFilters,
  ) {
    setFilters(newFilters);
    setCurrentPage(1);
  }

  function resetFilters() {
    setFilters(initialFilters);
    setCurrentPage(1);
  }

  function updateSort(
    newSort: SortOption,
  ) {
    setSort(newSort);
    setCurrentPage(1);
  }

  function changePage(page: number) {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <ProductFilters
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
            className="sticky top-24"
          />
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-4">
              <p
                className="text-sm text-slate-600"
                aria-live="polite"
              >
                Mostrando{" "}
                <strong className="font-bold text-brand-950">
                  {sortedProducts.length}
                </strong>{" "}
                {sortedProducts.length === 1
                  ? "producto"
                  : "productos"}
              </p>

              <Button
                type="button"
                variant="outline"
                className="lg:hidden"
                onClick={() =>
                  setMobileFiltersOpen(true)
                }
              >
                <Filter size={18} />
                Filtros
              </Button>
            </div>

            <div className="w-full sm:w-64">
              <Select
                name="sort"
                value={sort}
                aria-label="Ordenar productos"
                onChange={(event) =>
                  updateSort(
                    event.target
                      .value as SortOption,
                  )
                }
              >
                <option value="relevance">
                  Ordenar por relevancia
                </option>

                <option value="price-asc">
                  Precio: menor a mayor
                </option>

                <option value="price-desc">
                  Precio: mayor a menor
                </option>

                <option value="best-selling">
                  Más vendidos
                </option>

                <option value="newest">
                  Más nuevos
                </option>
              </Select>
            </div>
          </div>

          {pageProducts.length > 0 ? (
            <>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {pageProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      name={product.name}
                      category={
                        product.category
                      }
                      price={product.price}
                      originalPrice={
                        product.originalPrice
                      }
                      href={product.href}
                    />
                  ),
                )}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={changePage}
                className="mt-10"
              />
            </>
          ) : (
            <div className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-white text-brand-950 shadow-sm">
                <PackageSearch size={26} />
              </div>

              <h2 className="mt-5 text-xl font-extrabold text-brand-950">
                No encontramos productos
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                Prueba eliminando algunos
                filtros o cambiando el rango
                de precio.
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-6"
                onClick={resetFilters}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filtros de productos"
        >
          <button
            type="button"
            aria-label="Cerrar filtros"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
            onClick={() =>
              setMobileFiltersOpen(false)
            }
          />

          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-extrabold text-brand-950">
                  Filtrar productos
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Ajusta tus preferencias
                </p>
              </div>

              <button
                type="button"
                aria-label="Cerrar filtros"
                className="inline-flex size-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-brand-950"
                onClick={() =>
                  setMobileFiltersOpen(false)
                }
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              <ProductFilters
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
                showCard={false}
              />
            </div>

            <div className="border-t border-slate-200 bg-white p-5">
              <Button
                type="button"
                fullWidth
                onClick={() =>
                  setMobileFiltersOpen(false)
                }
              >
                Ver {sortedProducts.length}{" "}
                {sortedProducts.length === 1
                  ? "producto"
                  : "productos"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}