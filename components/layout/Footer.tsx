import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { StoreNavigationCategory } from "@/components/layout/Header";

const linkStyle = "text-sm text-white/75 transition-colors hover:text-[#C3AA84] focus-visible:outline focus-visible:outline-[#C3AA84]";

export function Footer({ categories = [] }: { categories?: StoreNavigationCategory[] }) {
  return (
    <footer className="bg-[#101010] text-[#F7F6F3]">
      <div className="border-y border-[#C3AA84]/30 bg-[#191817]">
        <Container>
          <div className="grid divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {[
              ["01", "Despachos a todo Chile", "Envíos por Chilexpress"],
              ["02", "Retiro coordinado", "Retiro personal en Santiago"],
              ["03", "Tu compra, a tu ritmo", "Revisa tu bolsa antes de pagar"],
            ].map(([number, title, detail]) => (
              <div key={number} className="flex gap-4 px-4 py-6">
                <span aria-hidden="true" className="text-2xl font-light text-[#C3AA84]">{number}</span>
                <div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-white/65">{detail}</p></div>
              </div>
            ))}
          </div>
        </Container>
      </div>
      <Container>
        <div className="grid gap-10 border-b border-white/15 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="text-lg font-medium tracking-[.15em]">THE BLACK STORE</Link>
            <p className="mt-5 max-w-xs text-2xl tracking-tight">Lo extraordinario está en los detalles.</p>
            <p className="mt-4 max-w-xs text-sm leading-7 text-white/65">Una selección de productos para acompañar tu estilo, tus momentos y tu día a día.</p>
          </div>
          <nav aria-label="Explora la tienda">
            <h2 className="text-xs font-semibold uppercase tracking-[.2em] text-[#C3AA84]">Explora</h2>
            <div className="mt-5 flex flex-col items-start gap-3">
              <Link className={linkStyle} href="/productos">Todos los productos</Link>
              <Link className={linkStyle} href="/productos?orden=recientes">Novedades</Link>
              {categories.slice(0, 8).map(category => <Link key={category.id} className={linkStyle} href={`/categoria/${category.slug}`}>{category.name}</Link>)}
            </div>
          </nav>
          <nav aria-label="Información de compra">
            <h2 className="text-xs font-semibold uppercase tracking-[.2em] text-[#C3AA84]">Tu compra</h2>
            <div className="mt-5 flex flex-col items-start gap-3">
              <Link className={linkStyle} href="/carrito">Mi bolsa</Link>
              <Link className={linkStyle} href="/checkout">Datos y pago</Link>
              <a className={linkStyle} href="#tbs-entregas">Despachos y retiro</a>
              <a className={linkStyle} href="#tbs-pagos">Medios de pago</a>
            </div>
          </nav>
          <section id="tbs-entregas" className="scroll-mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-[.2em] text-[#C3AA84]">Entregas</h2>
            <p className="mt-5 text-sm leading-7 text-white/75">Despachos por Chilexpress y retiro personal coordinado en Santiago.</p>
            <p className="mt-3 text-sm leading-6 text-white/60">Revisa las opciones de entrega en tu bolsa de compra.</p>
          </section>
        </div>
        <section id="tbs-pagos" className="flex scroll-mt-8 flex-col gap-4 border-b border-white/15 py-7 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-xs uppercase tracking-[.2em] text-[#C3AA84]">Medios de pago previstos</h2><p className="mt-2 text-xs text-white/65">Integración en preparación.</p></div>
          <div className="flex flex-wrap gap-2">
            {["Webpay", "Mercado Pago", "Transferencia bancaria"].map(method => <span key={method} className="border border-white/25 px-4 py-2 text-xs text-white/85">{method}</span>)}
          </div>
        </section>
        <div className="flex flex-wrap items-center justify-between gap-3 py-6 text-xs text-white/60">
          <p>© {new Date().getFullYear()} The Black Store.</p>
          <p>Chile · Precios en pesos chilenos (CLP)</p>
        </div>
      </Container>
    </footer>
  );
}
