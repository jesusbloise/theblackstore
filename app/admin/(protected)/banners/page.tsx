import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { ADMIN_PERMISSIONS } from "@/lib/auth/admin-permissions";
import { prisma } from '@/lib/prisma';
import { BannerEditor } from '@/components/admin/BannerEditor';
export default async function Page(){
  await requireAdminPage(ADMIN_PERMISSIONS.BANNERS_MANAGE);
const banners=await prisma.banner.findMany({orderBy:[{sortOrder:'asc'},{id:'asc'}]});return <BannerEditor banners={banners.map(b=>({...b,startsAt:b.startsAt?.toISOString()??null,endsAt:b.endsAt?.toISOString()??null}))}/>;}
