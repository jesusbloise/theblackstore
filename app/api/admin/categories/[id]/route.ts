import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, message: "Categoría inválida." }, { status: 400 });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: { select: { children: true, products: true } },
      },
    });

    if (!category) {
      return NextResponse.json({ ok: false, message: "La categoría ya no existe." }, { status: 404 });
    }
    if (category._count.children > 0) {
      return NextResponse.json({
        ok: false,
        message: "No puedes eliminar esta categoría porque tiene subcategorías. Muévelas o elimínalas primero.",
      }, { status: 409 });
    }
    if (category._count.products > 0) {
      return NextResponse.json({
        ok: false,
        message: "No puedes eliminar esta categoría porque tiene productos asociados. Reasígnalos primero.",
      }, { status: 409 });
    }

    // deleteMany with relation guards prevents deleting a category if
    // children/products were assigned between the initial check and deletion.
    const result = await prisma.category.deleteMany({
      where: { id, children: { none: {} }, products: { none: {} } },
    });
    if (result.count === 0) {
      return NextResponse.json({
        ok: false,
        message: "La categoría cambió mientras intentabas eliminarla. Actualiza la página e inténtalo nuevamente.",
      }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return NextResponse.json({ ok: false, message: "No fue posible eliminar la categoría." }, { status: 500 });
  }
}

const categoryUpdateSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().nullable().optional(),
  parentId: z.string().nullable(),
  isActive: z.boolean(),
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  try {
    const parsed = categoryUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, message: "Revisa los datos de la categoría." }, { status: 400 });
    const data = parsed.data;
    const current = await prisma.category.findUnique({ where: { id }, select: { id: true, parentId: true } });
    if (!current) return NextResponse.json({ ok: false, message: "La categoría no existe." }, { status: 404 });
    if (data.parentId === id) return NextResponse.json({ ok: false, message: "Una categoría no puede ser su propia categoría superior." }, { status: 400 });
    if (data.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: data.parentId }, select: { id: true, parentId: true } });
      if (!parent) return NextResponse.json({ ok: false, message: "La categoría superior no existe." }, { status: 400 });
      // La interfaz admite dos niveles: principal y subcategoría.
      if (parent.parentId) return NextResponse.json({ ok: false, message: "La categoría superior debe ser principal." }, { status: 400 });
      const children = await prisma.category.count({ where: { parentId: id } });
      if (children > 0) return NextResponse.json({ ok: false, message: "Mueve primero las subcategorías antes de convertir esta categoría en subcategoría." }, { status: 409 });
    }
    const slugTaken = await prisma.category.findFirst({ where: { slug: data.slug, NOT: { id } }, select: { id: true } });
    if (slugTaken) return NextResponse.json({ ok: false, message: "Ya existe una categoría con ese slug." }, { status: 409 });
    const category = await prisma.category.update({ where: { id }, data: {
      name: data.name, slug: data.slug, description: data.description ?? null,
      parentId: data.parentId, isActive: data.isActive,
    } });
    return NextResponse.json({ ok: true, category });
  } catch (error) {
    console.error("Error al editar categoría:", error);
    return NextResponse.json({ ok: false, message: "No fue posible actualizar la categoría." }, { status: 500 });
  }
}
