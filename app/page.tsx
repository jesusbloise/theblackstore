import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Hero } from "@/components/home/Hero";
import { getNavigationCategories } from "@/lib/storefront";
export default async function Home(){const categories=await getNavigationCategories();return <main><Hero/><FeaturedCategories categories={categories}/><FeaturedProducts/></main>}
