import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getMediaUrl } from "@/lib/media-url";
import { Container } from "@/components/ui/Container";
import type { StoreNavigationCategory } from "@/components/layout/Header";

type CategoryWithImage = StoreNavigationCategory & { imageUrl?: string | null };

export async function FeaturedCategories({ categories }: { categories: CategoryWithImage[] }) {
  if (!categories.length) return null;
  const cards = await Promise.all(categories.slice(0, 8).map(async (category) => {
    if (category.imageUrl) return { ...category, cover: category.imageUrl };
    const product = await prisma.product.findFirst({
      where: {
        status: "PUBLISHED",
        categories: { some: { category: { OR: [{ id: category.id }, { parentId: category.id }] } } },
        images: { some: {} },
      },
      orderBy: { createdAt: "desc" },
      select: { images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1, select: { url: true } } },
    });
    return { ...category, cover: product?.images[0]?.url ?? null };
  }));
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[.24em] text-[#927451]">Descubre</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">Compra por categoría</h2>
          <Link href="/productos" className="text-sm underline underline-offset-4">Ver productos</Link>
        </div>
        <div className={`mt-9 grid grid-cols-2 gap-3 sm:gap-4 ${cards.length===1?"sm:grid-cols-1":cards.length===2?"sm:grid-cols-2":cards.length===3?"sm:grid-cols-3":"lg:grid-cols-4"}`}>
          {cards.map((category) => (
            <Link href={`/categoria/${category.slug}`} key={category.id} className="group relative isolate flex aspect-[4/5] min-h-40 sm:min-h-64 overflow-hidden bg-[#e8e3dc]">
              {category.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getMediaUrl(category.cover) ?? undefined} alt={`Colección ${category.name}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#dcd4c8] via-[#eee9e2] to-[#c5b9a9]" aria-hidden="true" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden="true" />
              <div className="relative mt-auto w-full p-3 sm:p-6 text-white">
                <h3 className="text-lg sm:text-2xl font-medium">{category.name}</h3>
                <p className="mt-2 text-sm text-white/85">Explorar colección <span aria-hidden="true">→</span></p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
