"use client";

import Link from "next/link";

import { useCart } from "@/components/cart/CartProvider";
import { CategoryDropdown } from "@/components/layout/CategoryDropdown";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Container } from "@/components/ui/Container";

const categories = [
  {
    label: "Colchones",
    href: "/colchones",
    links: [
   {
  label: "Colchones a medida",
  href: "/colchones/a-medida",
},
      {
        label: "Colchones de espuma",
        href: "/colchones/espuma",
      },
      {
        label: "Colchones espuma premium",
        href: "/colchones/espuma-premium",
      },
      {
        label: "Colchones de resortes",
        href: "/colchones/resortes",
      },
    ],
  },
  {
    label: "Camas",
    href: "/camas",
    links: [
      {
        label: "Camas europeas",
        href: "/camas/europeas",
      },
      {
        label: "Camas de madera",
        href: "/camas/de-madera",
      },
      {
        label: "Camas metálicas",
        href: "/camas/metalicas",
      },
      {
        label: "Camas nido",
        href: "/camas/camas-nido",
      },
    ],
  },
  {
    label: "Camarotes",
    href: "/camarotes",
    links: [
      {
        label: "Camarotes de madera",
        href: "/camarotes/de-madera",
      },
      {
        label: "Camarotes metálicos",
        href: "/camarotes/metalicos",
      },
    ],
  },
  {
    label: "Espumas",
    href: "/espumas",
    links: [
      {
        label: "Espuma dimensionada",
        href: "/espumas/dimensionada",
      },
      {
        label: "Espuma picada",
        href: "/espumas/picada",
      },
      {
        label: "Láminas de espuma",
        href: "/espumas/laminas",
      },
    ],
  },
  {
    label: "Living",
    href: "/living",
    links: [
      {
        label: "Sillones cama",
        href: "/living/sillones-cama",
      },
      {
        label: "Sofás",
        href: "/living/sofas",
      },
    ],
  },
  {
    label: "Textiles",
    href: "/textiles",
    links: [
      {
        label: "Almohadas",
        href: "/textiles/almohadas",
      },
      {
        label: "Cobertores",
        href: "/textiles/cobertores",
      },
      {
        label: "Frazadas",
        href: "/textiles/frazadas",
      },
      {
        label: "Plumones",
        href: "/textiles/plumones",
      },
      {
        label: "Sábanas",
        href: "/textiles/sabanas",
      },
    ],
  },
];

export function Header() {
  const { itemCount, isHydrated } = useCart();

  return (
    <header className="relative border-b border-slate-200 bg-white">
      <div className="border-b border-slate-800 bg-slate-950 text-white">
        <Container>
          <div className="flex min-h-9 items-center justify-between gap-4 text-xs sm:text-sm">
            <p>
              Fabricación nacional y soluciones para tu descanso
            </p>

            <div className="hidden gap-5 sm:flex">
              <Link
                href="/seguimiento"
                className="hover:text-slate-300"
              >
                Sigue tu compra
              </Link>

              <Link
                href="/contacto"
                className="hover:text-slate-300"
              >
                Contacto
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="flex min-h-20 items-center gap-6">
          <Link
            href="/"
            className="shrink-0 text-2xl font-black tracking-tight text-slate-950"
          >
            INCAL
          </Link>

          <form
            action="/buscar"
            className="hidden flex-1 items-center rounded-full border border-slate-300 bg-slate-50 px-4 md:flex"
          >
            <input
              type="search"
              name="q"
              placeholder="¿Qué estás buscando?"
              className="h-11 w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-500"
            />

            <button
              type="submit"
              className="text-sm font-semibold text-slate-700"
            >
              Buscar
            </button>
          </form>

          <div className="ml-auto flex items-center gap-3 text-sm font-semibold">
            <div className="hidden items-center gap-4 md:flex">
              <Link
                href="/mi-cuenta"
                className="hover:text-slate-500"
              >
                Mi cuenta
              </Link>

              <Link
                href="/carrito"
                className="hover:text-slate-500"
              >
                Carrito ({isHydrated ? itemCount : 0})
              </Link>
            </div>

            <MobileMenu />
          </div>
        </div>

        <nav className="hidden min-h-12 items-center gap-7 border-t border-slate-100 text-sm font-semibold lg:flex">
          {categories.map((category) => (
            <CategoryDropdown
              key={category.href}
              label={category.label}
              href={category.href}
              links={category.links}
            />
          ))}

          <CategoryDropdown
            label="Combos"
            href="/combos"
            links={[
              {
                label: "Combos de camas",
                href: "/combos/camas",
              },
              {
                label: "Combos de camarotes",
                href: "/combos/camarotes",
              },
            ]}
          />

          <Link
            href="/outlet"
            className="font-bold text-red-600 transition hover:text-red-700"
          >
            Outlet
          </Link>

          <Link
            href="/guias"
            className="ml-auto transition hover:text-slate-500"
          >
            Guías
          </Link>
        </nav>
      </Container>
    </header>
  );
}