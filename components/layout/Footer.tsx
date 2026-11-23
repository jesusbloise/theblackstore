import Link from "next/link";
import { Container } from "@/components/ui/Container";
export function Footer() {
  return <footer className="mt-16 bg-[#101010] text-[#F7F6F3]">
    <Container><div className="grid gap-10 py-14 md:grid-cols-3">
      <div><p className="text-xl font-semibold tracking-[.12em]">THE BLACK STORE</p><p className="mt-4 text-sm leading-7 text-white/65">Una selección de productos para cada estilo y ocasión.</p></div>
      <div><p className="text-sm font-semibold text-[#C3AA84]">Explora</p><div className="mt-4 flex flex-col gap-3 text-sm text-white/75"><Link href="/productos">Productos</Link><Link href="/carrito">Carrito</Link></div></div>
      <div><p className="text-sm font-semibold text-[#C3AA84]">Entregas</p><p className="mt-4 text-sm leading-7 text-white/65">Despachos por Chilexpress y retiro personal coordinado en Santiago.</p></div>
    </div><div className="border-t border-white/15 py-6 text-xs text-white/50">© {new Date().getFullYear()} The Black Store. Todos los derechos reservados.</div></Container>
  </footer>;
}
