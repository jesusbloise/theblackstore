
import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-cookie";

const SESSION_DURATION_MS =
  7 * 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function createAdminSession(
  userId: string,
): Promise<void> {
  const token = randomBytes(32).toString("hex");

  await prisma.adminSession.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(
        Date.now() + SESSION_DURATION_MS,
      ),
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session =
    await prisma.adminSession.findUnique({
      where: {
        tokenHash: hashToken(token),
      },
      include: {
        user: true,
      },
    });

  if (
    !session ||
    session.expiresAt <= new Date() ||
    !session.user.isActive
  ) {
    return null;
  }

  return {
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}

export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    await prisma.adminSession.deleteMany({
      where: {
        tokenHash: hashToken(token),
      },
    });
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
