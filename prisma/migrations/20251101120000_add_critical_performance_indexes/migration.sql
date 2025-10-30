-- Add critical performance indexes to fix slow API endpoints

-- LoginActivity: For analytics groupBy and filtering
CREATE INDEX IF NOT EXISTS "LoginActivity_userId_createdAt_successful_idx" ON "LoginActivity"("userId", "createdAt", "successful");
CREATE INDEX IF NOT EXISTS "LoginActivity_successful_createdAt_idx" ON "LoginActivity"("successful", "createdAt");

-- Report: For analytics groupBy on status
CREATE INDEX IF NOT EXISTS "Report_status_idx" ON "Report"("status");

-- View: For duplicate detection and counting (critical for view endpoint)
CREATE INDEX IF NOT EXISTS "View_pickId_userId_createdAt_idx" ON "View"("pickId", "userId", "createdAt");
CREATE INDEX IF NOT EXISTS "View_pickId_ipAddress_createdAt_idx" ON "View"("pickId", "ipAddress", "createdAt");

-- Purchase: Add status index for filtering (analytics endpoint)
CREATE INDEX IF NOT EXISTS "Purchase_status_idx" ON "Purchase"("status");

-- Pick: Add additional indexes for trending queries
CREATE INDEX IF NOT EXISTS "Pick_sport_isPremium_idx" ON "Pick"("sport", "isPremium");
CREATE INDEX IF NOT EXISTS "Pick_createdAt_sport_idx" ON "Pick"("createdAt", "sport");

-- User: Add indexes for account status and trust score filtering (analytics)
CREATE INDEX IF NOT EXISTS "User_accountStatus_idx" ON "User"("accountStatus");
CREATE INDEX IF NOT EXISTS "User_trustScore_idx" ON "User"("trustScore");
