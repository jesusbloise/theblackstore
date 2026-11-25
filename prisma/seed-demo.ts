import { prisma } from '../lib/prisma';

// Datos ficticios, exclusivamente para desarrollo local.
const groups = [
  ['Ropa y moda', 'ropa', 'Vestuario', 'vestuario', ['Polera Essential:19990','Polera Oversize:24990','Polerón Urban:34990','Chaqueta Noir:59990','Pantalón Cargo:39990','Jogger Black:29990','Camisa Minimal:32990','Short Urban:22990']],
  ['Calzado','calzado','Calzado urbano','urbano',['Zapatillas Urban:49990','Zapatillas Runner:59990','Botines Noir:69990','Sandalias Black:19990','Mocasines Classic:54990','Zapatillas Street:44990']],
  ['Relojes y accesorios','accesorios','Accesorios personales','personales',['Reloj Midnight:59990','Reloj Classic:79990','Mochila Urban:34990','Billetera Noir:14990','Cinturón Black:12990','Gorra Essential:12990','Lentes Noir:19990','Bolso Weekender:44990']],
  ['Tecnología','tecnologia','Audio y dispositivos','dispositivos',['Audífonos Black Sound:39990','Parlante Mini:29990','Mouse Wireless:19990','Teclado Compact:44990','Cargador USB:14990','Soporte de escritorio:12990']],
  ['Hogar y decoración','hogar','Decoración','decoracion',['Jarrón Noir:24990','Lámpara Minimal:39990','Reloj de pared:24990','Bandeja Black:14990','Macetero Matte:19990','Organizador Urban:15990','Set de tazas:22990','Portavelas Noir:12990']],
  ['Electrodomésticos','electrodomesticos','Cocina','cocina',['Air Fryer Black Edition:89990','Hervidor Black:29990','Tostadora Noir:34990','Cafetera Compact:59990','Licuadora Black:49990','Batidora Urban:39990']],
  ['Ropa de cama','ropa-de-cama','Textiles','textiles',['Juego de sábanas Noir:34990','Funda de almohada:9990','Cubrecama Midnight:49990','Manta Black:24990','Edredón Noir:59990','Cojín Essential:14990']],
] as const;
const prefix = 'demo-tbs-';
async function main() {
  const url = new URL(process.env.DATABASE_URL ?? '');
  if (!['localhost','127.0.0.1','[::1]'].includes(url.hostname) || process.env.NODE_ENV === 'production') throw new Error('Solo se permite ejecutar contra PostgreSQL local de desarrollo.');
  const remove = process.argv.includes('--remove');
  if (!remove && !process.argv.includes('--load')) throw new Error('Indica --load o --remove.');
  await prisma.$transaction(async tx => {
    if (remove) {
      const result = await tx.product.deleteMany({where:{slug:{startsWith:prefix},metadata:{path:['demo'],equals:true}}});
      // Las categorías se conservan para no alterar productos reales asociados.
      console.log(`Productos demo eliminados: ${result.count}. Categorías conservadas.`);
      return;
    }
    let count = 0;
    for (const [name,slug,subName,subSlug,entries] of groups) {
      const parent = await tx.category.upsert({where:{slug:prefix+slug},update:{},create:{name,slug:prefix+slug,sortOrder:count,isActive:true}});
      const child = await tx.category.upsert({where:{slug:prefix+slug+'-'+subSlug},update:{},create:{name:subName,slug:prefix+slug+'-'+subSlug,parentId:parent.id,isActive:true}});
      for (const entry of entries) {
        const [name,rawPrice] = entry.split(':');
        const price = Number(rawPrice);
        const id = String(++count).padStart(3,'0');
        const productSlug = prefix+id;
        const existing = await tx.product.findUnique({where:{slug:productSlug}});
        if (existing) {
          if ((existing.metadata as {demo?:boolean}|null)?.demo !== true) throw new Error('Colisión de slug: '+productSlug);
          continue;
        }
        const options = slug==='ropa' ? ['S','M','L','XL'] : slug==='calzado' ? ['38','39','40','41','42','43'] : ['Única'];
        await tx.product.create({data:{name,slug:productSlug,shortDescription:`${name} en color negro. Producto de demostración.`,description:`Artículo ficticio de la colección ${slug}. Datos y precio destinados a pruebas de la tienda.`,status:'PUBLISHED',type:'STANDARD',isFeatured:count%3===1,metadata:{demo:true},categories:{create:[{categoryId:parent.id},{categoryId:child.id}]},features:{create:[{text:'Color negro',sortOrder:1},{text:'Producto de demostración',sortOrder:2}]},specifications:{create:[{label:'Color',value:'Negro'}]},variants:{create:options.map((option,i)=>({name:option,sku:`DEMO-TBS-${id}-${i+1}`,price,compareAtPrice:count%4===0?price+10000:null,stock:count%11===0?0:5+i,sortOrder:i,attributes:{create:[{name:'Color',value:'Negro'},...(options.length>1?[{name:'Talla',value:option,sortOrder:1}]:[])]}}))}}});
      }
    }
    console.log(`Catálogo demo procesado: ${count} productos.`);
  },{timeout:120000});
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>prisma.$disconnect());

