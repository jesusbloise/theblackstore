import { NextResponse } from "next/server";

import { deleteAdminSession } from "@/lib/auth/admin-session";
import { validateAdminCsrf } from "@/lib/auth/admin-csrf";

export async function POST(request: Request) {
  const csrfDenied = validateAdminCsrf(request);

  if (csrfDenied) {
    return csrfDenied;
  }

  try {
    await deleteAdminSession();

    return NextResponse.json({
      ok: true,
      message: "Sesión cerrada correctamente.",
    });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "No se pudo cerrar la sesión.",
      },
      { status: 500 },
    );
  }
}