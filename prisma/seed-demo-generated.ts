import { prisma } from '../lib/prisma';
import { access } from 'node:fs/promises';
import path from 'node:path';
const covers = [['ropa',1],['calzado',9],['accesorios',15],['tecnologia',23],['hogar',29],['electrodomesticos',37],['ropa-de-cama',43]] as const;
const slug = (n:number) => `demo-tbs-${String(n).padStart(3,'0')}`;
const url = (n:number) => `/images/demo/generated/${slug(n)}.webp`;
async function main(){
 const db = new URL(process.env.DATABASE_URL ?? '');
 if (!['localhost','127.0.0.1','[::1]'].includes(db.hostname) || process.env.NODE_ENV==='production') throw new Error('Solo PostgreSQL local.');
 if (!process.argv.includes('--apply')) throw new Error('Usa --apply');
 for(let n=1;n<=48;n++) await access(path.join(process.cwd(),'public',url(n).slice(1)));
 await prisma.$transaction(async tx=>{
  const products=await tx.product.findMany({where:{slug:{in:Array.from({length:48},(_,i)=>slug(i+1))},metadata:{path:['demo'],equals:true}}});
  if(products.length!==48) throw new Error(`Se esperaban 48 productos demo; encontrados ${products.length}.`);
  for(const p of products){
   const n=Number(p.slug.slice(9));
   await tx.productImage.deleteMany({where:{productId:p.id,url:{in:[url(n),`/images/demo/${p.slug}.jpg`,`/images/demo/${p.slug}.png`,`/images/demo/${p.slug}.webp`]}}});
   await tx.productImage.updateMany({where:{productId:p.id,isPrimary:true},data:{isPrimary:false}});
   await tx.productImage.create({data:{productId:p.id,url:url(n),alt:p.name+' (imagen ilustrativa)',isPrimary:true,sortOrder:0}});
  }
  for(const [category,n] of covers) await tx.category.updateMany({where:{slug:'demo-tbs-'+category},data:{imageUrl:url(n)}});
 },{timeout:120000});
 console.log('48 imágenes de productos asociadas; portadas demo actualizadas.');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>prisma.$disconnect());
