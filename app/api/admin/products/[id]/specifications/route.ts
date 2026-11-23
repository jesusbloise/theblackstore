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
  }>;
};

export async function POST(
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

    const lastSpecification =
      await prisma.productSpecification.findFirst({
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

    const specification =
      await prisma.productSpecification.create({
        data: {
          productId,

          label:
            validation.data.label,

          value:
            validation.data.value,

          sortOrder:
            (lastSpecification
              ?.sortOrder ?? 0) + 1,
        },
      });

    return NextResponse.json(
      {
        ok: true,
        specification,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Error creando especificación:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible crear la especificación.",
      },
      {
        status: 500,
      },
    );
  }
}