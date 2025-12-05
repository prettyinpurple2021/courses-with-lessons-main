-- CreateTable
CREATE TABLE "CookieConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "preferences" JSONB NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CookieConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CookieConsent_userId_idx" ON "CookieConsent"("userId");

-- CreateIndex
CREATE INDEX "CookieConsent_sessionId_idx" ON "CookieConsent"("sessionId");

-- CreateIndex
CREATE INDEX "CookieConsent_timestamp_idx" ON "CookieConsent"("timestamp");

-- CreateIndex
CREATE INDEX "CookieConsent_createdAt_idx" ON "CookieConsent"("createdAt");

-- AddForeignKey
ALTER TABLE "CookieConsent" ADD CONSTRAINT "CookieConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
