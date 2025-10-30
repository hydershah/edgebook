-- CreateIndex: Add performance indexes to optimize common queries

-- Follow table: Individual indexes for follower/following lookups
CREATE INDEX IF NOT EXISTS "Follow_followerId_idx" ON "Follow"("followerId");
CREATE INDEX IF NOT EXISTS "Follow_followingId_idx" ON "Follow"("followingId");

-- Pick table: Composite and single indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS "Pick_isPremium_idx" ON "Pick"("isPremium");
CREATE INDEX IF NOT EXISTS "Pick_lockedAt_idx" ON "Pick"("lockedAt");
CREATE INDEX IF NOT EXISTS "Pick_sport_status_idx" ON "Pick"("sport", "status");
CREATE INDEX IF NOT EXISTS "Pick_userId_createdAt_idx" ON "Pick"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Pick_status_createdAt_idx" ON "Pick"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Pick_sport_createdAt_idx" ON "Pick"("sport", "createdAt");

-- Purchase table: Individual indexes for user and pick lookups
CREATE INDEX IF NOT EXISTS "Purchase_userId_idx" ON "Purchase"("userId");
CREATE INDEX IF NOT EXISTS "Purchase_pickId_idx" ON "Purchase"("pickId");
CREATE INDEX IF NOT EXISTS "Purchase_createdAt_idx" ON "Purchase"("createdAt");

-- Bookmark table: Composite index for user's recent bookmarks
CREATE INDEX IF NOT EXISTS "Bookmark_userId_createdAt_idx" ON "Bookmark"("userId", "createdAt");

-- Comment table: Composite index for pick's recent comments
CREATE INDEX IF NOT EXISTS "Comment_pickId_createdAt_idx" ON "Comment"("pickId", "createdAt");

-- Like table: Composite index for pick's recent likes
CREATE INDEX IF NOT EXISTS "Like_pickId_createdAt_idx" ON "Like"("pickId", "createdAt");

-- View table: Composite index for pick's recent views
CREATE INDEX IF NOT EXISTS "View_pickId_createdAt_idx" ON "View"("pickId", "createdAt");

-- Message table: Composite index for chat message ordering
CREATE INDEX IF NOT EXISTS "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt");

-- Transaction table: Composite index and status index
CREATE INDEX IF NOT EXISTS "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Transaction_status_idx" ON "Transaction"("status");

-- User table: Additional indexes for common lookups
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
