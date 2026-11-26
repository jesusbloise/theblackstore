import { verify } from "argon2";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminSession } from "@/lib/auth/admin-session";
import { validateAdminCsrf } from "@/lib/auth/admin-csrf";

import {
  reserveAdminLoginAttempt,
  clearAdminLoginAttempts,
  cleanupExpiredLoginAttempts,
} from "@/lib/auth/admin-rate-limit";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email(),
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  const csrfDenied = validateAdminCsrf(request);

  if (csrfDenied) {
    return csrfDenied;
  }

  try {
    const body: unknown = await request
      .json()
      .catch(() => null);

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const dummyHashBase64 =
  process.env.ADMIN_DUMMY_PASSWORD_HASH_BASE64;

const dummyHash = dummyHashBase64
  ? Buffer.from(dummyHashBase64, "base64").toString("utf8")
  : "";

if (!dummyHash.startsWith("$argon2id$")) {
  console.error(
    "El hash auxiliar de Argon2 no está configurado correctamente.",
  );

  return NextResponse.json(
    { error: "Servicio temporalmente no disponible." },
    { status: 503 },
  );
}

    if (Math.random() < 0.01) {
  await cleanupExpiredLoginAttempts().catch((error) => {
    console.error(
      "Error al limpiar intentos expirados:",
      error,
    );
  });
}

const rateLimit =
  await reserveAdminLoginAttempt(email);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Demasiados intentos de acceso. Inténtalo nuevamente más tarde.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        passwordHash: true,
      },
    });

    const passwordHash =
      admin?.isActive
        ? admin.passwordHash
        : dummyHash;

    const validPassword = await verify(
      passwordHash,
      password,
    );

    if (!admin || !admin.isActive || !validPassword) {
      return NextResponse.json(
        { error: "Correo o contraseña incorrectos." },
        { status: 401 },
      );
    }

    await createAdminSession(admin.id);

    await clearAdminLoginAttempts(email).catch((error) => {
      console.error(
        "Error al limpiar intentos de acceso:",
        error,
      );
    });

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(
      "Error al iniciar sesión administrativa:",
      error,
    );

    return NextResponse.json(
      { error: "No se pudo iniciar sesión." },
      { status: 500 },
    );
  }
}