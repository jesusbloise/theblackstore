import "server-only";

import { NextResponse } from "next/server";

const SAFE_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
]);

export function validateAdminCsrf(
  request: Request,
): NextResponse | null {
  if (SAFE_METHODS.has(request.method.toUpperCase())) {
    return null;
  }

  const allowedOrigins = new Set(
    (process.env.ADMIN_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  if (allowedOrigins.size === 0) {
    console.error("ADMIN_ALLOWED_ORIGINS no está configurada.");

    return NextResponse.json(
      {
        ok: false,
        message: "Configuración de seguridad no disponible.",
      },
      { status: 503 },
    );
  }

  const origin = request.headers.get("origin");

  if (!origin || !allowedOrigins.has(origin)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Origen de solicitud no autorizado.",
      },
      { status: 403 },
    );
  }

  const fetchSite = request.headers.get("sec-fetch-site");

  if (fetchSite === "cross-site") {
    return NextResponse.json(
      {
        ok: false,
        message: "Solicitud externa bloqueada.",
      },
      { status: 403 },
    );
  }

  return null;
}
