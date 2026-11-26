import "server-only";

import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/admin-session";
import { validateAdminCsrf } from "@/lib/auth/admin-csrf";

import {
  hasAdminPermission,
  type AdminPermission,
} from "@/lib/auth/admin-permissions";

export async function requireAdminApi(
  request: Request,
  permission: AdminPermission,
) {
  const csrfDenied = validateAdminCsrf(request);

  if (csrfDenied) {
    return csrfDenied;
  }

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

  if (!hasAdminPermission(admin.role, permission)) {
    return NextResponse.json(
      {
        ok: false,
        message: "No tienes permisos para realizar esta operación.",
      },
      { status: 403 },
    );
  }

  return null;
}