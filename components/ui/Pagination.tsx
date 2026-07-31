"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
};

type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

function createPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): PaginationItem[] {
  const totalVisibleNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalVisibleNumbers) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 2);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const items: PaginationItem[] = [1];

  if (showLeftEllipsis) {
    items.push("ellipsis-left");
  } else {
    for (let page = 2; page < leftSibling; page += 1) {
      items.push(page);
    }
  }

  for (let page = leftSibling; page <= rightSibling; page += 1) {
    items.push(page);
  }

  if (showRightEllipsis) {
    items.push("ellipsis-right");
  } else {
    for (let page = rightSibling + 1; page < totalPages; page += 1) {
      items.push(page);
    }
  }

  items.push(totalPages);

  return items;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    totalPages,
  );

  const items = createPaginationItems(
    safeCurrentPage,
    totalPages,
    siblingCount,
  );

  function changePage(page: number) {
    if (
      page < 1 ||
      page > totalPages ||
      page === safeCurrentPage
    ) {
      return;
    }

    onPageChange(page);
  }

  return (
    <nav
      aria-label="Paginación"
      className={[
        "flex flex-wrap items-center justify-center gap-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        onClick={() => changePage(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1}
        className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-brand-950 transition-colors hover:border-brand-500 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Ir a la página anterior"
      >
        <ChevronLeft size={18} />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      {items.map((item) => {
        if (
          item === "ellipsis-left" ||
          item === "ellipsis-right"
        ) {
          return (
            <span
              key={item}
              className="inline-flex h-10 min-w-10 items-center justify-center text-slate-500"
              aria-hidden="true"
            >
              …
            </span>
          );
        }

        const isActive = item === safeCurrentPage;

        return (
          <button
            key={item}
            type="button"
            onClick={() => changePage(item)}
            className={[
              "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition-colors",
              isActive
                ? "border-brand-950 bg-brand-950 text-white"
                : "border-slate-300 bg-white text-brand-950 hover:border-brand-500 hover:bg-brand-50",
            ].join(" ")}
            aria-label={`Ir a la página ${item}`}
            aria-current={isActive ? "page" : undefined}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => changePage(safeCurrentPage + 1)}
        disabled={safeCurrentPage === totalPages}
        className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-brand-950 transition-colors hover:border-brand-500 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Ir a la página siguiente"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}