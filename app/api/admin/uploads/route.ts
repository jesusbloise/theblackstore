import { ADMIN_PERMISSIONS } from "@/lib/auth/admin-permissions";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { uploadR2Object } from "@/lib/r2";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getExtension(
  file: File,
) {
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
) {
  const unauthorized = await requireAdminApi(request, ADMIN_PERMISSIONS.MEDIA_MANAGE);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Debes enviar una imagen.",
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

    const extension =
      getExtension(file);

    const objectKey = [
      "products",
      "development",
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

    return NextResponse.json(
      {
        ok: true,
        key: objectKey,
        size: file.size,
        contentType: file.type,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Error subiendo imagen a R2:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible subir la imagen.",
      },
      {
        status: 500,
      },
    );
  }
}