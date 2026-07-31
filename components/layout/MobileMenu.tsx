"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";

type MenuLink = {
  label: string;
  href: string;
};

type MobileCategory = {
  label: string;
  href: string;
  links: MenuLink[];
};

const mobileCategories: MobileCategory[] = [
  {
    label: "Colchones",
    href: "/colchones",
    links: [
      { label: "Colchones a medida", href: "/colchones/a-medida" },
      { label: "Colchones de espuma", href: "/colchones/espuma" },
      {
        label: "Colchones espuma premium",
        href: "/colchones/espuma-premium",
      },
      { label: "Colchones de resortes", href: "/colchones/resortes" },
    ],
  },
  {
    label: "Camas",
    href: "/camas",
    links: [
      { label: "Camas europeas", href: "/camas/europeas" },
      { label: "Camas de madera", href: "/camas/de-madera" },
      { label: "Camas metálicas", href: "/camas/metalicas" },
      { label: "Camas nido", href: "/camas/camas-nido" },
    ],
  },
  {
    label: "Camarotes",
    href: "/camarotes",
    links: [
      { label: "Camarotes de madera", href: "/camarotes/de-madera" },
      { label: "Camarotes metálicos", href: "/camarotes/metalicos" },
    ],
  },
  {
    label: "Espumas",
    href: "/espumas",
    links: [
      { label: "Espuma dimensionada", href: "/espumas/dimensionada" },
      { label: "Espuma picada", href: "/espumas/picada" },
      { label: "Láminas de espuma", href: "/espumas/laminas" },
    ],
  },
  {
    label: "Living",
    href: "/living",
    links: [
      { label: "Sillones cama", href: "/living/sillones-cama" },
      { label: "Sofás", href: "/living/sofas" },
    ],
  },
  {
    label: "Textiles",
    href: "/textiles",
    links: [
      { label: "Almohadas", href: "/textiles/almohadas" },
      { label: "Cobertores", href: "/textiles/cobertores" },
      { label: "Frazadas", href: "/textiles/frazadas" },
      { label: "Plumones", href: "/textiles/plumones" },
      { label: "Sábanas", href: "/textiles/sabanas" },
    ],
  },
  {
    label: "Combos",
    href: "/combos",
    links: [
      { label: "Combos de camas", href: "/combos/camas" },
      { label: "Combos de camarotes", href: "/combos/camarotes" },
    ],
  },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
    setOpenCategory(null);
  }

  function toggleCategory(label: string) {
    setOpenCategory((current) => (current === label ? null : label));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 text-slate-950 lg:hidden"
        aria-label="Abrir menú"
        aria-expanded={isOpen}
      >
        <Menu size={22} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={closeMenu}
            aria-label="Cerrar menú"
          />

          <aside className="absolute right-0 top-0 flex h-full w-[90%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex min-h-20 items-center justify-between border-b border-slate-200 px-5">
              <Link
                href="/"
                onClick={closeMenu}
                className="text-2xl font-black tracking-tight text-slate-950"
              >
                INCAL
              </Link>

              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300"
                aria-label="Cerrar menú"
              >
                <X size={22} />
              </button>
            </div>

            <div className="border-b border-slate-200 p-5">
              <form
                action="/buscar"
                className="flex items-center rounded-full border border-slate-300 bg-slate-50 px-4"
              >
                <Search size={19} className="shrink-0 text-slate-500" />

                <input
                  type="search"
                  name="q"
                  placeholder="¿Qué estás buscando?"
                  className="h-12 w-full bg-transparent px-3 text-sm text-slate-950 outline-none placeholder:text-slate-500"
                />
              </form>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-4">
              {mobileCategories.map((category) => {
                const isCategoryOpen = openCategory === category.label;

                return (
                  <div
                    key={category.href}
                    className="border-b border-slate-100"
                  >
                    <div className="flex min-h-14 items-center justify-between gap-3">
                      <Link
                        href={category.href}
                        onClick={closeMenu}
                        className="flex-1 font-semibold text-slate-950"
                      >
                        {category.label}
                      </Link>

                      <button
                        type="button"
                        onClick={() => toggleCategory(category.label)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"
                        aria-label={`Mostrar subcategorías de ${category.label}`}
                        aria-expanded={isCategoryOpen}
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${
                            isCategoryOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {isCategoryOpen && (
                      <div className="pb-4 pl-4">
                        <Link
                          href={category.href}
                          onClick={closeMenu}
                          className="block py-2 text-sm font-semibold text-slate-950"
                        >
                          Ver todo en {category.label}
                        </Link>

                        {category.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeMenu}
                            className="block py-2 text-sm text-slate-600"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <Link
                href="/outlet"
                onClick={closeMenu}
                className="flex min-h-14 items-center border-b border-slate-100 font-bold text-red-600"
              >
                Outlet
              </Link>

              <Link
                href="/guias"
                onClick={closeMenu}
                className="flex min-h-14 items-center border-b border-slate-100 font-semibold text-slate-950"
              >
                Guías
              </Link>
            </nav>

            <div className="border-t border-slate-200 p-5">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/mi-cuenta"
                  onClick={closeMenu}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 text-sm font-semibold"
                >
                  <UserRound size={18} />
                  Mi cuenta
                </Link>

                <Link
                  href="/carrito"
                  onClick={closeMenu}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white"
                >
                  <ShoppingCart size={18} />
                  Carrito (0)
                </Link>
              </div>

              <div className="mt-4 flex justify-center gap-5 text-sm text-slate-600">
                <Link href="/seguimiento" onClick={closeMenu}>
                  Sigue tu compra
                </Link>

                <Link href="/contacto" onClick={closeMenu}>
                  Contacto
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}