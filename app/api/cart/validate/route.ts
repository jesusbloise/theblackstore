import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ items: z.array(z.object({
  id: z.string().min(1).max(128),
  variantId: z.string().min(1).max(128),
  quantity: z.number().int().min(1).max(100),
  price: z.number().int().positive(),
})).min(1).max(100) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "El carrito contiene productos no válidos o personalizados que requieren cotización." }, { status: 400 });
  try {
    const items = parsed.data.items;
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: items.map(item => item.variantId) } },
      include: { product: true },
    });
    const quantities = new Map<string, number>();
    for (const item of items) quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + item.quantity);
    let subtotal = 0;
    for (const item of items) {
      const variant = variants.find(v => v.id === item.variantId);
      if (!variant || variant.productId !== item.id || !variant.isActive || variant.product.status !== "PUBLISHED" || variant.product.type !== "STANDARD" || variant.price <= 0) {
        return NextResponse.json({ error: "Un producto ya no está disponible. Retíralo del carrito y vuelve a intentarlo." }, { status: 409 });
      }
      if (variant.manageInventory && !variant.allowBackorder && (quantities.get(variant.id) ?? 0) > variant.stock) {
        return NextResponse.json({ error: `Stock insuficiente para ${variant.product.name} (${variant.name}). Disponibles: ${variant.stock}.` }, { status: 409 });
      }
      if (variant.price !== item.price) return NextResponse.json({ error: `Cambió el precio de ${variant.product.name}. Retíralo y agrégalo nuevamente.` }, { status: 409 });
      subtotal += variant.price * item.quantity;
    }
    return NextResponse.json({ subtotal });
  } catch (error) {
    console.error("Error validando carrito", error);
    return NextResponse.json({ error: "No pudimos validar el carrito. Intenta nuevamente." }, { status: 500 });
  }
}
