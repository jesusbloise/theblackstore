import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getR2Object } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  try {
    const key =
      request.nextUrl.searchParams.get(
        "key",
      );

    if (!key) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Debes indicar la imagen.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Por seguridad, esta ruta solo permite
     * leer imágenes almacenadas dentro de
     * products/.
     */
    if (!key.startsWith("products/")) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "La ruta solicitada no está permitida.",
        },
        {
          status: 403,
        },
      );
    }

    const object =
      await getR2Object(key);

    /*
     * Convertimos el Uint8Array recibido
     * desde R2 a un ArrayBuffer compatible
     * con Response.
     */
    const body = new Uint8Array(
      object.body,
    ).buffer;

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type":
          object.contentType,

        "Cache-Control":
          "public, max-age=3600, s-maxage=86400",

        ...(object.etag
          ? {
              ETag: object.etag,
            }
          : {}),
      },
    });
  } catch (error) {
    console.error(
      "Error leyendo imagen desde R2:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible obtener la imagen.",
      },
      {
        status: 404,
      },
    );
  }
}