import {
  NextRequest,
  NextResponse,
} from "next/server";
import { z } from "zod";

import {
  ProductStatus,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

const updateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "El nombre debe tener al menos 2 caracteres.",
    ),

  slug: z
    .string()
    .trim()
    .min(2, "El slug no es válido.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug solo puede contener letras minúsculas, números y guiones.",
    ),

  description: z
    .string()
    .trim()
    .optional(),

  brand: z
    .string()
    .trim()
    .optional(),

  categoryId: z
    .string()
    .trim()
    .min(
      1,
      "Debes seleccionar una categoría.",
    ),

  status: z.enum([
    ProductStatus.DRAFT,
    ProductStatus.PUBLISHED,
    ProductStatus.ARCHIVED,
  ]),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  const unauthorized = await requireAdminApi();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id: productId } =
      await params;

    const body = await request.json();

    const validation =
      updateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          message:
            validation.error.issues[0]
              ?.message ??
            "Los datos del producto no son válidos.",
          errors:
            validation.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const data = validation.data;

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "El producto no existe.",
        },
        {
          status: 404,
        },
      );
    }

    const category =
      await prisma.category.findUnique({
        where: {
          id: data.categoryId,
        },
        select: {
          id: true,
          isActive: true,
        },
      });

    if (!category || !category.isActive) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "La categoría seleccionada no existe o está inactiva.",
        },
        {
          status: 400,
        },
      );
    }

    const productWithSameSlug =
      await prisma.product.findFirst({
        where: {
          slug: data.slug,
          id: {
            not: productId,
          },
        },
        select: {
          id: true,
        },
      });

    if (productWithSameSlug) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Ya existe otro producto con ese slug.",
        },
        {
          status: 409,
        },
      );
    }

    const updatedProduct =
      await prisma.$transaction(
        async (transaction) => {
          const updated =
            await transaction.product.update({
              where: {
                id: productId,
              },
              data: {
                name: data.name,
                slug: data.slug,
                description:
                  data.description || null,
                brand:
                  data.brand || "Incal",
                status: data.status,
              },
            });

          await transaction.productCategory.deleteMany({
            where: {
              productId,
            },
          });

          await transaction.productCategory.create({
            data: {
              productId,
              categoryId:
                data.categoryId,
            },
          });

          return updated;
        },
      );

    return NextResponse.json({
      ok: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error(
      "Error actualizando producto:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible actualizar el producto.",
      },
      {
        status: 500,
      },
    );
  }
}