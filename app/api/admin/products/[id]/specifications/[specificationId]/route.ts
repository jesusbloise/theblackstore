import { requireAdminApi } from "@/lib/auth/require-admin-api";
import {
  NextRequest,
  NextResponse,
} from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const specificationSchema = z.object({
  label: z
    .string()
    .trim()
    .min(
      2,
      "El nombre de la especificación es obligatorio.",
    ),

  value: z
    .string()
    .trim()
    .min(
      1,
      "El valor de la especificación es obligatorio.",
    ),
});

type RouteContext = {
  params: Promise<{
    id: string;
    specificationId: string;
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
    const {
      id: productId,
      specificationId,
    } = await params;

    const body =
      await request.json();

    const validation =
      specificationSchema.safeParse(
        body,
      );

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          message:
            validation.error
              .issues[0]?.message ??
            "La especificación no es válida.",
        },
        {
          status: 400,
        },
      );
    }

    const specification =
      await prisma.productSpecification.findFirst({
        where: {
          id: specificationId,
          productId,
        },

        select: {
          id: true,
        },
      });

    if (!specification) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "La especificación no existe.",
        },
        {
          status: 404,
        },
      );
    }

    const updatedSpecification =
      await prisma.productSpecification.update({
        where: {
          id: specificationId,
        },

        data: {
          label:
            validation.data.label,

          value:
            validation.data.value,
        },
      });

    return NextResponse.json({
      ok: true,
      specification:
        updatedSpecification,
    });
  } catch (error) {
    console.error(
      "Error actualizando especificación:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible actualizar la especificación.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  const unauthorized = await requireAdminApi();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const {
      id: productId,
      specificationId,
    } = await params;

    const specification =
      await prisma.productSpecification.findFirst({
        where: {
          id: specificationId,
          productId,
        },

        select: {
          id: true,
        },
      });

    if (!specification) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "La especificación no existe.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.productSpecification.delete({
      where: {
        id: specificationId,
      },
    });

    const remaining =
      await prisma.productSpecification.findMany({
        where: {
          productId,
        },

        orderBy: {
          sortOrder: "asc",
        },

        select: {
          id: true,
        },
      });

    await prisma.$transaction(
      remaining.map(
        (item, index) =>
          prisma.productSpecification.update({
            where: {
              id: item.id,
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
      "Error eliminando especificación:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible eliminar la especificación.",
      },
      {
        status: 500,
      },
    );
  }
}