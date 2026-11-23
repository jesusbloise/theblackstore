
import { NextResponse } from "next/server";
import { deleteAdminSession } from "@/lib/auth/admin-session";

export async function POST() {
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
      { status: 500 }
    );
  }
}
