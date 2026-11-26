-- CreateTable
CREATE TABLE "AdminLoginAttempt" (
    "key" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminLoginAttempt_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "AdminLoginAttempt_expiresAt_idx" ON "AdminLoginAttempt"("expiresAt");
