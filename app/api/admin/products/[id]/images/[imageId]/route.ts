import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { deleteR2Object } from "@/lib/r2";

type RouteContext = {
  params: Promise<{
    id: string;
    imageId: string;
  }>;
};

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const {
      id: productId,
      imageId,
    } = await params;

    const image =
      await prisma.productImage.findFirst({
        where: {
          id: imageId,
          productId,
        },
      });

    if (!image) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "La imagen no existe.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Primero eliminamos el archivo físico
     * almacenado en Cloudflare R2.
     */
    await deleteR2Object(
      image.url,
    );

    /*
     * Después eliminamos el registro
     * correspondiente en PostgreSQL.
     */
    await prisma.productImage.delete({
      where: {
        id: image.id,
      },
    });

    /*
     * Reordenamos las imágenes restantes
     * para mantener sortOrder:
     *
     * 1, 2, 3, 4...
     */
    const remainingImages =
      await prisma.productImage.findMany({
        where: {
          productId,
        },

        orderBy: {
          sortOrder: "asc",
        },

        select: {
          id: true,
          isPrimary: true,
        },
      });

    await prisma.$transaction(
      remainingImages.map(
        (remainingImage, index) =>
          prisma.productImage.update({
            where: {
              id: remainingImage.id,
            },

            data: {
              sortOrder:
                index + 1,
            },
          }),
      ),
    );

    /*
     * Si eliminamos la imagen principal,
     * convertimos automáticamente la
     * primera imagen restante en principal.
     */
    if (
      image.isPrimary &&
      remainingImages.length > 0
    ) {
      await prisma.productImage.update({
        where: {
          id: remainingImages[0].id,
        },

        data: {
          isPrimary: true,
        },
      });
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "Error eliminando imagen:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible eliminar la imagen.",
      },
      {
        status: 500,
      },
    );
  }
}
export async function PATCH(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const {
      id: productId,
      imageId,
    } = await params;

    const image =
      await prisma.productImage.findFirst({
        where: {
          id: imageId,
          productId,
        },
        select: {
          id: true,
          isPrimary: true,
        },
      });

    if (!image) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "La imagen no existe.",
        },
        {
          status: 404,
        },
      );
    }

    if (image.isPrimary) {
      return NextResponse.json({
        ok: true,
      });
    }

    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: {
          productId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      }),

      prisma.productImage.update({
        where: {
          id: imageId,
        },
        data: {
          isPrimary: true,
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "Error cambiando imagen principal:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible cambiar la imagen principal.",
      },
      {
        status: 500,
      },
    );
  }
}