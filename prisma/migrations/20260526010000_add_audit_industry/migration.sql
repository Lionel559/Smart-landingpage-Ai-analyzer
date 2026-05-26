ALTER TABLE "Audit" ADD COLUMN "industry" TEXT;
ALTER TABLE "Audit" ADD COLUMN "industryConfidence" INTEGER;
ALTER TABLE "Audit" ADD COLUMN "industryReasons" JSONB;
