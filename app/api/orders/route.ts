import { NextResponse } from 'next/server';
import { randomUUID, createHash } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const text = z.string().trim().min(1).max(200);
const schema = z.object({
  idempotencyKey: z.string().uuid(),
  customer: z.object({ firstName: text, lastName: text, email: z.string().trim().email().max(254).transform(v => v.toLowerCase()), phone: text }),
  deliveryMethod: z.enum(['shipping', 'pickup']),
  paymentMethod: z.enum(['webpay', 'mercado-pago', 'transferencia']),
  address: z.object({ street: text, streetNumber: text, commune: text, city: text, region: text, apartment: text.optional() }).optional(),
  items: z.array(z.object({ id: text, variantId: text, quantity: z.number().int().min(1).max(100), price: z.number().int().positive().max(2147483647) })).min(1).max(100),
});
class OrderError extends Error {}
const selection = { orderNumber: true, status: true, paymentStatus: true, subtotal: true, shippingAmount: true, total: true } as const;
export async function POST(request: Request) {
  // Development only until payment, reservation expiry and abuse controls exist.
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Pedidos todavía no habilitados.' }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Datos del pedido no válidos.' }, { status: 400 });
  const data = parsed.data;
  if (data.deliveryMethod === 'shipping' && (!data.address || data.address.region !== 'Región Metropolitana')) return NextResponse.json({ error: 'El despacho regional requiere cotización previa.' }, { status: 400 });
  const key = createHash('sha256').update(data.idempotencyKey).digest('hex');
  const fingerprint = createHash('sha256').update(JSON.stringify(data)).digest('hex');
  const replay = async () => {
    const existing = await prisma.order.findUnique({ where: { idempotencyKey: key }, select: { ...selection, notes: true } });
    if (!existing) return null;
    if (existing.notes !== `request:${fingerprint}`) return NextResponse.json({ error: 'La clave ya corresponde a otro pedido.' }, { status: 409 });
    const { notes: _notes, ...result } = existing;
    return NextResponse.json(result);
  };
  try {
    const previous = await replay();
    if (previous) return previous;
    const order = await prisma.$transaction(async tx => {
      const grouped = new Map<string, typeof data.items[number]>();
      for (const item of data.items) {
        const old = grouped.get(item.variantId);
        if (old && (old.id !== item.id || old.price !== item.price)) throw new OrderError('Variantes inconsistentes.');
        grouped.set(item.variantId, { ...item, quantity: item.quantity + (old?.quantity ?? 0) });
      }
      const lines = [];
      let subtotal = 0;
      for (const item of [...grouped.values()].sort((a,b) => a.variantId.localeCompare(b.variantId))) {
        if (item.quantity > 100) throw new OrderError('Cantidad máxima excedida.');
        const v = await tx.productVariant.findUnique({ where: { id: item.variantId }, include: { product: { include: { images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 } } } } });
        if (!v || v.productId !== item.id || !v.isActive || v.product.status !== 'PUBLISHED' || v.product.type !== 'STANDARD' || v.price <= 0 || v.price !== item.price) throw new OrderError('Producto o precio cambiado. Actualiza el carrito.');
        if (v.manageInventory) {
          const updated = await tx.productVariant.updateMany({ where: { id: v.id, isActive: true, price: v.price, manageInventory: true, allowBackorder: v.allowBackorder, ...(v.allowBackorder ? {} : { stock: { gte: item.quantity } }) }, data: { stock: { decrement: item.quantity } } });
          if (updated.count !== 1) throw new OrderError(`Stock insuficiente para ${v.product.name}.`);
        }
        const amount = v.price * item.quantity;
        subtotal += amount;
        if (subtotal > 2147474657) throw new OrderError('Monto máximo excedido.');
        lines.push({ productId: v.productId, variantId: v.id, productName: v.product.name, variantName: v.name, sku: v.sku, imageUrl: v.product.images[0]?.url, quantity: item.quantity, unitPrice: v.price, subtotal: amount, metadata: { inventoryDebited: v.manageInventory } });
      }
      const shippingAmount = data.deliveryMethod === 'pickup' ? 0 : 8990;
      const total = subtotal + shippingAmount;
      const customer = await tx.customer.upsert({ where: { email: data.customer.email }, create: data.customer, update: {} });
      const customerName = `${data.customer.firstName} ${data.customer.lastName}`;
      const method = data.paymentMethod === 'webpay' ? 'WEBPAY' : data.paymentMethod === 'mercado-pago' ? 'MERCADO_PAGO' : 'BANK_TRANSFER';
      return tx.order.create({ data: { orderNumber: `TBS-${randomUUID().toUpperCase()}`, idempotencyKey: key, notes: `request:${fingerprint}`, customerId: customer.id, customerName, customerEmail: data.customer.email, customerPhone: data.customer.phone, deliveryMethod: data.deliveryMethod === 'pickup' ? 'PICKUP' : 'SHIPPING', subtotal, shippingAmount, total, items: { create: lines }, payments: { create: { method, amount: total } }, statusHistory: { create: { newStatus: 'PENDING' } }, ...(data.deliveryMethod === 'shipping' && data.address ? { address: { create: { ...data.address, recipientName: customerName, phone: data.customer.phone } } } : {}) }, select: selection });
    }, { isolationLevel: 'Serializable' });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    try { const previous = await replay(); if (previous) return previous; } catch { /* original error */ }
    if (error instanceof OrderError) return NextResponse.json({ error: error.message }, { status: 409 });
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2034') return NextResponse.json({ error: 'Conflicto de inventario. Reintenta con la misma clave.' }, { status: 409 });
    console.error('Error creando pedido', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'No pudimos crear el pedido.' }, { status: 500 });
  }
}
