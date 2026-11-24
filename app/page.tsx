import { prisma } from '@/lib/prisma';
import { CampaignHero } from '@/components/home/CampaignHero';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { EditorialHero, StoreBenefits, ProductSection, EditorialCollections } from '@/components/home/CommercialHome';
import { getNavigationCategories, getStoreProducts } from '@/lib/storefront';
export const dynamic = 'force-dynamic';
export default async function Home(){const now=new Date();const [categories,products,featured,slides]=await Promise.all([getNavigationCategories(),getStoreProducts(),getStoreProducts(true),prisma.banner.findMany({where:{isActive:true,AND:[{OR:[{startsAt:null},{startsAt:{lte:now}}]},{OR:[{endsAt:null},{endsAt:{gt:now}}]}]},orderBy:[{sortOrder:'asc'},{id:'asc'}],select:{id:true,title:true,subtitle:true,imageKey:true,mobileImageKey:true,buttonText:true,href:true,alignment:true}})]);return <main>{slides.length?<CampaignHero slides={slides}/>:<EditorialHero categories={categories} products={products}/>}<StoreBenefits/><FeaturedCategories categories={categories}/><ProductSection products={products} title="Recién llegados" kicker="Descubre nuestra selección" muted/><EditorialCollections categories={categories}/><ProductSection products={featured} title="Productos destacados" kicker="Nuestra selección"/></main>}
