import {
  NextRequest,
  NextResponse,
} from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const featureSchema = z.object({
  text: z
    .string()
    .trim()
    .min(
      2,
      "La característica debe tener al menos 2 caracteres.",
    ),
});

type RouteContext = {
  params: Promise<{
    id: string;
    featureId: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const {
      id: productId,
      featureId,
    } = await params;

    const body =
      await request.json();

    const validation =
      featureSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          message:
            validation.error
              .issues[0]?.message ??
            "La característica no es válida.",
        },
        {
          status: 400,
        },
      );
    }

    const feature =
      await prisma.productFeature.findFirst({
        where: {
          id: featureId,
          productId,
        },
        select: {
          id: true,
        },
      });

    if (!feature) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "La característica no existe.",
        },
        {
          status: 404,
        },
      );
    }

    const updatedFeature =
      await prisma.productFeature.update({
        where: {
          id: featureId,
        },
        data: {
          text:
            validation.data.text,
        },
      });

    return NextResponse.json({
      ok: true,
      feature:
        updatedFeature,
    });
  } catch (error) {
    console.error(
      "Error actualizando característica:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible actualizar la característica.",
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
  try {
    const {
      id: productId,
      featureId,
    } = await params;

    const feature =
      await prisma.productFeature.findFirst({
        where: {
          id: featureId,
          productId,
        },
        select: {
          id: true,
        },
      });

    if (!feature) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "La característica no existe.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.productFeature.delete({
      where: {
        id: featureId,
      },
    });

    const remainingFeatures =
      await prisma.productFeature.findMany({
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
      remainingFeatures.map(
        (item, index) =>
          prisma.productFeature.update({
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
      "Error eliminando característica:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible eliminar la característica.",
      },
      {
        status: 500,
      },
    );
  }
}