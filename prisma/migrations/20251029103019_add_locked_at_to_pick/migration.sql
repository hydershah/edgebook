-- AlterTable
ALTER TABLE "Pick" ADD COLUMN "lockedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Pick_gameDate_idx" ON "Pick"("gameDate");
