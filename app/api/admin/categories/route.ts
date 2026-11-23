
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().refine((url) => url.startsWith("https://"), "La imagen debe usar HTTPS").nullable().optional(),
  parentId: z.string().nullable().optional(),
});

export async function POST(
  request: NextRequest,
) {
  // Verificar la sesión administrativa.
  const unauthorized = await requireAdminApi();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await request.json();

    const data = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl ?? null,
        parentId: data.parentId ?? null,
        isActive: true,
      },
    });

    return NextResponse.json({
      ok: true,
      category,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: "No fue posible crear la categoría.",
      },
      {
        status: 400,
      },
    );
  }
}
