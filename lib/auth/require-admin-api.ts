
import "server-only";

import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin-session";

export async function requireAdminApi() {
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

  return null;
}
