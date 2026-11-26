import { ADMIN_PERMISSIONS } from "@/lib/auth/admin-permissions";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
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
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: RouteContext,
) {
  const unauthorized = await requireAdminApi(request, ADMIN_PERMISSIONS.PRODUCTS_MANAGE);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id: productId } =
      await params;

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

    const lastFeature =
      await prisma.productFeature.findFirst({
        where: {
          productId,
        },
        orderBy: {
          sortOrder: "desc",
        },
        select: {
          sortOrder: true,
        },
      });

    const feature =
      await prisma.productFeature.create({
        data: {
          productId,
          text:
            validation.data.text,
          sortOrder:
            (lastFeature?.sortOrder ??
              0) + 1,
        },
      });

    return NextResponse.json(
      {
        ok: true,
        feature,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Error creando característica:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible crear la característica.",
      },
      {
        status: 500,
      },
    );
  }
}