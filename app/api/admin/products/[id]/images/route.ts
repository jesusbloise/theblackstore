import { requireAdminApi } from "@/lib/auth/require-admin-api";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { uploadR2Object } from "@/lib/r2";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getExtension(file: File) {
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "png" ||
    extension === "webp"
  ) {
    return extension === "jpeg"
      ? "jpg"
      : extension;
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
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
    const { id: productId } =
      await params;

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
          slug: true,
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

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    const alt =
      formData.get("alt");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Debes seleccionar una imagen.",
        },
        {
          status: 400,
        },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Solo se permiten imágenes JPG, PNG o WebP.",
        },
        {
          status: 400,
        },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "La imagen no puede superar los 5 MB.",
        },
        {
          status: 400,
        },
      );
    }

    const imageCount =
      await prisma.productImage.count({
        where: {
          productId,
        },
      });

    const extension =
      getExtension(file);

    const objectKey = [
      "products",
      product.slug,
      `${crypto.randomUUID()}.${extension}`,
    ].join("/");

    const body =
      new Uint8Array(
        await file.arrayBuffer(),
      );

    await uploadR2Object({
      key: objectKey,
      body,
      contentType: file.type,
    });

    const image =
      await prisma.productImage.create({
        data: {
          productId,
          url: objectKey,
          alt:
            typeof alt === "string" &&
            alt.trim()
              ? alt.trim()
              : product.slug,
          isPrimary:
            imageCount === 0,
          sortOrder:
            imageCount + 1,
        },
      });

    return NextResponse.json(
      {
        ok: true,
        image,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Error subiendo imagen del producto:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible subir la imagen del producto.",
      },
      {
        status: 500,
      },
    );
  }
}