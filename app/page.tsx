import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Hero } from "@/components/home/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedCategories />
      <FeaturedProducts />
    </main>
  );
}