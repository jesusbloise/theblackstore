
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin-session";

export async function proxy(request: NextRequest) {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json(
      {
        ok: false,
        message: "No autorizado. Debes iniciar sesión.",
      },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
