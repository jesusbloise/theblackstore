import { requireAdminApi } from "@/lib/auth/require-admin-api";
import {
  NextRequest,
  NextResponse,
} from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const reorderImagesSchema = z.object({
  imageIds: z
    .array(z.string().min(1))
    .min(1)
    .max(5),
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

    const body =
      await request.json();

    const validation =
      reorderImagesSchema.safeParse(
        body,
      );

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "El orden de imágenes no es válido.",
          errors:
            validation.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const { imageIds } =
      validation.data;

    const uniqueIds =
      new Set(imageIds);

    if (
      uniqueIds.size !==
      imageIds.length
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "La lista contiene imágenes repetidas.",
        },
        {
          status: 400,
        },
      );
    }

    const images =
      await prisma.productImage.findMany({
        where: {
          productId,
        },
        select: {
          id: true,
        },
      });

    if (
      images.length !==
      imageIds.length
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Debes enviar todas las imágenes actuales del producto.",
        },
        {
          status: 400,
        },
      );
    }

    const validIds =
      new Set(
        images.map(
          (image) => image.id,
        ),
      );

    const hasInvalidImage =
      imageIds.some(
        (imageId) =>
          !validIds.has(
            imageId,
          ),
      );

    if (hasInvalidImage) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Una de las imágenes no pertenece a este producto.",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.$transaction(
      imageIds.map(
        (imageId, index) =>
          prisma.productImage.update({
            where: {
              id: imageId,
            },
            data: {
              sortOrder:
                index + 1,
            },
          }),
      ),
    );

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "Error reordenando imágenes:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible guardar el nuevo orden.",
      },
      {
        status: 500,
      },
    );
  }
}