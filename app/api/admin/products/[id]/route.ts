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

    if (data.status === ProductStatus.PUBLISHED) {
      const sellableVariant = await prisma.productVariant.findFirst({
        where: { productId, isActive: true, price: { gt: 0 } },
        select: { id: true },
      });
      if (!sellableVariant) {
        return NextResponse.json({
          ok: false,
          message: "No se puede publicar: crea al menos una variante activa con precio mayor que $0.",
        }, { status: 400 });
      }
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
                  data.brand || null,
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
export async function POST(
  request: NextRequest,
  { params }: RouteContext,
) {
  const unauthorized = await requireAdminApi();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id: productId } = await params;

    const validation = z.object({
      action: z.enum(["archive", "restore"]),
    }).safeParse(
      await request.json().catch(() => null),
    );

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Acción no válida.",
        },
        { status: 400 },
      );
    }

    const isArchive =
  validation.data.action === "archive";

if (!isArchive) {
  const sellableVariant = await prisma.productVariant.findFirst({
    where: {
      productId,
      isActive: true,
      price: {
        gt: 0,
      },
    },
    select: {
      id: true,
    },
  });

  if (!sellableVariant) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "No se puede publicar el producto sin una variante activa con precio válido.",
      },
      { status: 400 },
    );
  }
}

    const result = await prisma.product.updateMany({
      where: {
        id: productId,
        status: isArchive
          ? { not: ProductStatus.ARCHIVED }
          : ProductStatus.ARCHIVED,
      },
      data: {
  status: isArchive
    ? ProductStatus.ARCHIVED
    : ProductStatus.PUBLISHED,
},
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "El producto no existe o su estado no permite esta acción.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
     message: isArchive
  ? "Producto archivado correctamente."
  : "Producto recuperado y publicado correctamente.",
    });
  } catch (error) {
    console.error("Error cambiando estado del producto:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "No fue posible cambiar el estado del producto.",
      },
      { status: 500 },
    );
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext,
) {
  const unauthorized = await requireAdminApi();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id: productId } = await params;

    const result = await prisma.$transaction(
      async (transaction) => {
        const product = await transaction.product.findUnique({
          where: {
            id: productId,
          },
          select: {
            id: true,
            status: true,
          },
        });

        if (!product) {
          return "NOT_FOUND";
        }

        if (product.status !== ProductStatus.ARCHIVED) {
          return "NOT_ARCHIVED";
        }

        const orderItem = await transaction.orderItem.findFirst({
          where: {
            OR: [
              { productId },
              {
                variant: {
                  productId,
                },
              },
            ],
          },
          select: {
            id: true,
          },
        });

        if (orderItem) {
          return "HAS_ORDERS";
        }

        const deleted = await transaction.product.deleteMany({
          where: {
            id: productId,
            status: ProductStatus.ARCHIVED,
          },
        });

        return deleted.count === 1
          ? "DELETED"
          : "CONFLICT";
      },
      {
        isolationLevel: "Serializable",
      },
    );

    if (result === "NOT_FOUND") {
      return NextResponse.json(
        {
          ok: false,
          message: "El producto no existe.",
        },
        { status: 404 },
      );
    }

    if (result === "NOT_ARCHIVED") {
      return NextResponse.json(
        {
          ok: false,
          message: "Debes archivar el producto antes de eliminarlo.",
        },
        { status: 409 },
      );
    }

    if (result === "HAS_ORDERS") {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Este producto tiene pedidos asociados. Debe permanecer archivado para conservar el historial.",
        },
        { status: 409 },
      );
    }

    if (result !== "DELETED") {
      return NextResponse.json(
        {
          ok: false,
          message: "El producto cambió de estado. Actualiza la página.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Producto eliminado correctamente.",
    });
  } catch (error) {
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? error.code
        : undefined;

    if (code === "P2003") {
      return NextResponse.json(
        {
          ok: false,
          message:
            "El producto tiene registros asociados que impiden su eliminación.",
        },
        { status: 409 },
      );
    }

    if (code === "P2034") {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Existe otra operación en curso. Actualiza la página e inténtalo nuevamente.",
        },
        { status: 409 },
      );
    }

    console.error("Error eliminando producto:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "No fue posible eliminar el producto.",
      },
      { status: 500 },
    );
  }
}