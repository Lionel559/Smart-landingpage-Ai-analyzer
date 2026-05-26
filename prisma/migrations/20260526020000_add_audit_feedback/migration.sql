CREATE TABLE "AuditFeedback" (
  "id" TEXT NOT NULL,
  "auditId" TEXT NOT NULL,
  "rating" TEXT NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditFeedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditFeedback_auditId_idx" ON "AuditFeedback"("auditId");
