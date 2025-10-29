-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- AlterTable
-- Add the column with a default value to handle existing rows
ALTER TABLE "Like" ADD COLUMN "voteType" "VoteType" NOT NULL DEFAULT 'UPVOTE';
