import Link from "next/link";
import { Container } from "@/components/ui/Container";

const categories = [
  {
    name: "Colchones",
    description: "Espuma, resortes y opciones a medida.",
    href: "/colchones",
  },
  {
    name: "Camas",
    description: "Europeas, de madera, metálicas y nido.",
    href: "/camas",
  },
  {
    name: "Camarotes",
    description: "Soluciones prácticas para aprovechar el espacio.",
    href: "/camarotes",
  },
  {
    name: "Espumas",
    description: "Planchas, alta densidad y cortes a medida.",
    href: "/espumas",
  },
];

export function FeaturedCategories() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Compra por categoría
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Todo lo que necesitas para descansar mejor
          </h2>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            Explora nuestras principales categorías y encuentra la solución
            adecuada para tu dormitorio, hogar o proyecto.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-slate-400 hover:shadow-lg"
            >
              <div className="flex min-h-56 flex-col justify-end rounded-xl bg-slate-100 p-5">
                <h3 className="text-2xl font-bold text-slate-950">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {category.description}
                </p>

                <span className="mt-5 text-sm font-semibold text-slate-950">
                  Ver categoría →
                </span>
              </div>
            </Link>
          ))}
        </div>
                <Link
          href="/producto/colchon-a-medida"
          className="group mt-8 grid overflow-hidden rounded-3xl bg-brand-950 text-white transition hover:-translate-y-1 hover:shadow-xl lg:grid-cols-[1fr_auto]"
        >
          <div className="p-7 sm:p-9">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent-400">
              Fabricación personalizada
            </p>

            <h3 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
              ¿Necesitas un colchón con medidas especiales?
            </h3>

            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Selecciona la densidad, el largo, el ancho y el espesor.
              Obtén el precio estimado al instante y agrega tu configuración
              directamente al carrito.
            </p>

            <span className="mt-6 inline-flex items-center gap-2 font-extrabold text-accent-400">
              Configurar colchón a medida
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </div>

          <div className="flex min-h-52 items-center justify-center border-t border-white/10 bg-white/5 p-8 lg:min-h-full lg:w-72 lg:border-l lg:border-t-0">
            <svg
              viewBox="0 0 300 210"
              aria-hidden="true"
              className="w-full max-w-64"
            >
              <path
                d="M55 75 L190 35 L255 70 L120 112 Z"
                fill="#ffffff"
                stroke="#facc15"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              <path
                d="M120 112 L255 70 L255 112 L120 155 Z"
                fill="#cbd5e1"
                stroke="#facc15"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              <path
                d="M55 75 L120 112 L120 155 L55 118 Z"
                fill="#94a3b8"
                stroke="#facc15"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              <path
                d="M76 75 L194 41"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="6 5"
              />

              <path
                d="M93 84 L211 50"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="6 5"
              />
            </svg>
          </div>
        </Link>
      </Container>
    </section>
  );
}