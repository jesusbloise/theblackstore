import { prisma } from '../lib/prisma';
import { access } from 'node:fs/promises';
import path from 'node:path';
const campaigns = [
 {id:'demo-tbs-banner-everything',title:'Everything in Black',subtitle:'Todo en negro. Todo con estilo.',file:'everything',href:'/productos',alignment:'left'},
 {id:'demo-tbs-banner-essentials',title:'Black Essentials',subtitle:'Eleva tu estilo cotidiano.',file:'essentials',href:'/categoria/demo-tbs-accesorios',alignment:'left'},
 {id:'demo-tbs-banner-living',title:'Black Living',subtitle:'Transforma tus espacios.',file:'living',href:'/categoria/demo-tbs-hogar',alignment:'right'},
];
async function main(){
 const db=new URL(process.env.DATABASE_URL ?? '');
 if(!['localhost','127.0.0.1','[::1]'].includes(db.hostname)||process.env.NODE_ENV==='production') throw new Error('Solo PostgreSQL local.');
 if(!process.argv.includes('--apply')) throw new Error('Usa --apply');
 for(const c of campaigns) await access(path.join(process.cwd(),'public/images/demo/banners',c.file+'.webp'));
 await prisma.$transaction(async tx=>{
  for(const [i,c] of campaigns.entries()){
   const {id,file,...fields}=c;
   await tx.banner.upsert({where:{id},update:{},create:{id,...fields,imageKey:`/images/demo/banners/${file}.webp`,buttonText:'Explorar colección',sortOrder:i,isActive:true}});
  }
 });
 console.log('3 campañas demo disponibles. Las campañas existentes se conservaron.');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>prisma.$disconnect());
