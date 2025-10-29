-- CreateTable
CREATE TABLE "UsernameChange" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "oldUsername" TEXT,
    "newUsername" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsernameChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsernameChange_userId_idx" ON "UsernameChange"("userId");

-- CreateIndex
CREATE INDEX "UsernameChange_createdAt_idx" ON "UsernameChange"("createdAt");

-- AddForeignKey
ALTER TABLE "UsernameChange" ADD CONSTRAINT "UsernameChange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
