import { NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-cookie";
import { validateAdminCsrf } from "@/lib/auth/admin-csrf";

export function proxy(request: NextRequest) {
  const csrfDenied = validateAdminCsrf(request);

  if (csrfDenied) {
    return csrfDenied;
  }

  const pathname = request.nextUrl.pathname;

  const isAdminApi =
    pathname === "/api/admin" ||
    pathname.startsWith("/api/admin/");

  if (isAdminApi) {
    const token = request.cookies.get(
      ADMIN_SESSION_COOKIE,
    )?.value;

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return NextResponse.json(
        {
          ok: false,
          message: "No autorizado. Debes iniciar sesión.",
        },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/api/auth/admin/:path*",
  ],
};