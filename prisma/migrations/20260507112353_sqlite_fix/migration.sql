-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "image" TEXT,
    "provider" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "scansUsed" INTEGER NOT NULL DEFAULT 0,
    "planExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteUrl" TEXT NOT NULL,
    "seo" INTEGER NOT NULL,
    "ux" INTEGER NOT NULL,
    "cta" INTEGER NOT NULL,
    "trust" INTEGER NOT NULL,
    "mobile" INTEGER NOT NULL,
    "health" INTEGER NOT NULL,
    "critical" INTEGER NOT NULL,
    "medium" INTEGER NOT NULL,
    "minor" INTEGER NOT NULL,
    "confidence" INTEGER NOT NULL,
    "findings" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "roadmap" JSONB NOT NULL,
    "revenueNotes" JSONB NOT NULL,
    "consultantFindings" JSONB,
    "visualFlags" JSONB,
    "aiFixes" JSONB,
    "quickWins" JSONB,
    "visualLabels" JSONB,
    "screenshotUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Audit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
