import "server-only";

import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type RateLimitResult = {
  allowed: boolean;
  retryAfter: number;
};

type AttemptRow = {
  attempts: number;
  blockedUntil: Date | null;
};

function getEmailKey(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();

  return `email:${createHash("sha256")
    .update(normalizedEmail)
    .digest("hex")}`;
}

export async function reserveAdminLoginAttempt(
  email: string,
): Promise<RateLimitResult> {
  const key = getEmailKey(email);

  const now = new Date();

  const windowThreshold = new Date(
    now.getTime() - WINDOW_MS,
  );

  const blockedUntil = new Date(
    now.getTime() + BLOCK_MS,
  );

  const expiresAt = new Date(
    now.getTime() + WINDOW_MS + BLOCK_MS,
  );

 const rows = await prisma.$queryRaw<AttemptRow[]>`
  INSERT INTO "AdminLoginAttempt" (
    "key",
    "attempts",
    "windowStartedAt",
    "blockedUntil",
    "expiresAt",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    ${key},
    1,
    ${now.toISOString()}::timestamp,
    NULL::timestamp,
    ${expiresAt.toISOString()}::timestamp,
    ${now.toISOString()}::timestamp,
    ${now.toISOString()}::timestamp
  )
  ON CONFLICT ("key") DO UPDATE
  SET
    "attempts" = CASE
      WHEN "AdminLoginAttempt"."windowStartedAt"
        <= ${windowThreshold.toISOString()}::timestamp
      THEN 1
      ELSE "AdminLoginAttempt"."attempts" + 1
    END,

    "windowStartedAt" = CASE
      WHEN "AdminLoginAttempt"."windowStartedAt"
        <= ${windowThreshold.toISOString()}::timestamp
      THEN ${now.toISOString()}::timestamp
      ELSE "AdminLoginAttempt"."windowStartedAt"
    END,

    "blockedUntil" = CASE
      WHEN "AdminLoginAttempt"."windowStartedAt"
        <= ${windowThreshold.toISOString()}::timestamp
      THEN NULL::timestamp

      WHEN "AdminLoginAttempt"."attempts"
        >= ${MAX_ATTEMPTS}::integer
      THEN ${blockedUntil.toISOString()}::timestamp

      ELSE NULL::timestamp
    END,

    "expiresAt" = ${expiresAt.toISOString()}::timestamp,
    "updatedAt" = ${now.toISOString()}::timestamp

  WHERE
    "AdminLoginAttempt"."blockedUntil" IS NULL
    OR "AdminLoginAttempt"."blockedUntil"
      <= ${now.toISOString()}::timestamp

  RETURNING "attempts", "blockedUntil"
`;

  const attempt = rows[0];

  if (!attempt) {
    const existing =
      await prisma.adminLoginAttempt.findUnique({
        where: { key },
        select: { blockedUntil: true },
      });

    return {
      allowed: false,
      retryAfter: Math.max(
        1,
        Math.ceil(
          (
            (existing?.blockedUntil?.getTime() ??
              blockedUntil.getTime()) -
            Date.now()
          ) / 1000,
        ),
      ),
    };
  }

  if (attempt.blockedUntil) {
    return {
      allowed: false,
      retryAfter: Math.max(
        1,
        Math.ceil(
          (
            attempt.blockedUntil.getTime() -
            Date.now()
          ) / 1000,
        ),
      ),
    };
  }

  return {
    allowed: true,
    retryAfter: 0,
  };
}

export async function clearAdminLoginAttempts(
  email: string,
): Promise<void> {
  await prisma.adminLoginAttempt.deleteMany({
    where: {
      key: getEmailKey(email),
    },
  });
}

export async function cleanupExpiredLoginAttempts(): Promise<number> {
  const result =
    await prisma.adminLoginAttempt.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });

  return result.count;
}