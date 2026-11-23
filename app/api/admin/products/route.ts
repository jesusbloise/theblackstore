import {
  ProductStatus,
  ProductType,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres."),

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
    .min(1, "Debes seleccionar una categoría."),

  status: z
    .enum([
      ProductStatus.DRAFT,
      ProductStatus.PUBLISHED,
    ])
    .default(ProductStatus.DRAFT),
});

export async function POST(
  request: NextRequest,
) {
  const unauthorized = await requireAdminApi();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await request.json();

    // Aquí continúa tu código existente.

    const validation =
      createProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          message:
            validation.error.issues[0]?.message ??
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

    // Un producto nuevo aún no tiene variantes. Primero debe guardarse como borrador.
    if (data.status === ProductStatus.PUBLISHED) {
      return NextResponse.json({
        ok: false,
        message: "Guarda primero el producto como borrador, crea una variante activa con precio y luego publícalo.",
      }, { status: 400 });
    }

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          slug: data.slug,
        },
        select: {
          id: true,
        },
      });

    if (existingProduct) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Ya existe un producto con ese slug.",
        },
        {
          status: 409,
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

    const product =
      await prisma.$transaction(
        async (transaction) => {
          const createdProduct =
            await transaction.product.create({
              data: {
                name: data.name,
                slug: data.slug,
                description:
                  data.description || null,
                brand: data.brand || null,
                status: data.status,
                type: ProductType.STANDARD,
              },
            });

          await transaction.productCategory.create({
            data: {
              productId:
                createdProduct.id,
              categoryId:
                data.categoryId,
            },
          });

          return createdProduct;
        },
      );

    return NextResponse.json(
      {
        ok: true,
        product,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Error creando producto:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible crear el producto.",
      },
      {
        status: 500,
      },
    );
  }
}