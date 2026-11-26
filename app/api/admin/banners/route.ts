import { ADMIN_PERMISSIONS } from "@/lib/auth/admin-permissions";
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/auth/require-admin-api';
const key = z.union([z.string().regex(/^products\/development\/[a-f0-9-]+\.(jpg|png|webp)$/i), z.string().regex(/^\/images\/demo\/banners\/(everything|essentials|living)\.webp$/)]);
const schema = z.object({id:z.string().optional(),title:z.string().trim().min(1).max(120),subtitle:z.string().max(300),imageKey:key,mobileImageKey:key.nullable(),buttonText:z.string().max(60),href:z.string().max(500).regex(/^\/(?!\/)[^\\\s]*$/),alignment:z.enum(['left','center','right']),sortOrder:z.number().int().min(0).max(9999),isActive:z.boolean(),startsAt:z.iso.datetime().nullable(),endsAt:z.iso.datetime().nullable()}).refine(v=>!v.startsAt||!v.endsAt||v.startsAt<v.endsAt,'La fecha final debe ser posterior a la inicial');
export async function POST(request:Request){
 const denied=await requireAdminApi(request, ADMIN_PERMISSIONS.BANNERS_MANAGE); if(denied)return denied;
 try {const {id,startsAt,endsAt,...fields}=schema.parse(await request.json()); const data={...fields,startsAt:startsAt?new Date(startsAt):null,endsAt:endsAt?new Date(endsAt):null}; const banner=id?await prisma.banner.update({where:{id},data}):await prisma.banner.create({data}); return NextResponse.json({ok:true,banner});}catch(error){console.error(error);return NextResponse.json({ok:false,message:'No se pudo guardar. Revisa los campos y las fechas.'},{status:400});}
}
export async function DELETE(request:Request){const denied=await requireAdminApi(request, ADMIN_PERMISSIONS.BANNERS_MANAGE);if(denied)return denied;try{const {id}=z.object({id:z.string().min(1)}).parse(await request.json());await prisma.banner.delete({where:{id}});return NextResponse.json({ok:true});}catch{return NextResponse.json({ok:false,message:'No se pudo eliminar.'},{status:400});}}
