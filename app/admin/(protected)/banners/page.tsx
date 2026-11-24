import { prisma } from '@/lib/prisma';
import { BannerEditor } from '@/components/admin/BannerEditor';
export default async function Page(){const banners=await prisma.banner.findMany({orderBy:[{sortOrder:'asc'},{id:'asc'}]});return <BannerEditor banners={banners.map(b=>({...b,startsAt:b.startsAt?.toISOString()??null,endsAt:b.endsAt?.toISOString()??null}))}/>;}
