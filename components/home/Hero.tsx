import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white">
      <Container>
        <div className="flex min-h-[520px] items-center py-16">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
              Descanso y calidad para tu hogar
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Encuentra la cama y el colchón ideal para descansar mejor
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Descubre colchones, camas, camarotes y soluciones a medida
              fabricadas para entregar comodidad, calidad y durabilidad.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/productos"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-6 font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Ver productos
              </Link>

              <Link
                href="/elegir-colchon"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/40 px-6 font-semibold text-white transition hover:bg-white/10"
              >
                Encuentra tu colchón
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}