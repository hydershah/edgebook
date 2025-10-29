# Security Fixes - Authorization & RBAC Implementation

## Overview
This document outlines the comprehensive security fixes implemented to address critical authorization vulnerabilities in the EdgeBook application.

## Vulnerabilities Fixed

### 1. ✅ Chat Access Control (CRITICAL)
**Issue**: Chat endpoints did not verify ownership, allowing any authenticated user to access any chat.

**Files Fixed**:
- `app/api/chats/[chatId]/messages/route.ts`

**Changes**:
- Added ownership verification before allowing GET/POST operations
- Admins can now access any chat for moderation purposes
- All unauthorized access attempts are logged to audit trail

### 2. ✅ Pick Ownership Validation (ALREADY SECURE)
**Files Audited**:
- `app/api/picks/[pickId]/route.ts`

**Status**:
- PUT operation at line 125-127: ✅ Has ownership check
- DELETE operation at line 209-211: ✅ Has ownership check
- Both operations properly verify user owns the pick before allowing modifications

### 3. ✅ Comment Moderation
**Issue**: Only owners could delete comments, no moderation capability.

**Files Fixed**:
- `app/api/picks/[pickId]/comments/[commentId]/route.ts`

**Changes**:
- Owners can still delete their own comments
- Moderators and Admins can now delete any comment
- All deletions are logged with moderation flag

### 4. ✅ Profile Update Authorization
**Issue**: Endpoint only supported self-updates, no admin override.

**Files Fixed**:
- `app/api/profile/route.ts`

**Changes**:
- Users can update their own profiles
- Admins can update any user's profile via `?userId=xxx` query parameter
- All admin actions are logged separately

## New Security Infrastructure

### 1. Role-Based Access Control (RBAC)
**File**: `lib/authorization.ts`

**Features**:
- Three user roles: `USER`, `ADMIN`, `MODERATOR`
- Granular permission system with 20+ permissions
- Helper functions for authorization checks
- Admin override capabilities

**Usage Example**:
```typescript
import { isAdmin, isModerator, authorize, Permission } from '@/lib/authorization'

// Check if user is admin
const userIsAdmin = await isAdmin(userId)

// Check if user is moderator or admin
const canModerate = await isModerator(userId)

// Full authorization check
const result = await authorize(session, {
  permission: Permission.DELETE_ANY_COMMENT,
  getResourceOwnerId: async () => comment.userId,
  allowAdmin: true
})

if (!result.authorized) {
  return NextResponse.json({ error: result.reason }, { status: 403 })
}
```

**Available Permissions**:
- Pick: `CREATE_PICK`, `READ_PICK`, `UPDATE_OWN_PICK`, `DELETE_OWN_PICK`, `UPDATE_ANY_PICK`, `DELETE_ANY_PICK`
- Comment: `CREATE_COMMENT`, `DELETE_OWN_COMMENT`, `DELETE_ANY_COMMENT`
- Profile: `UPDATE_OWN_PROFILE`, `UPDATE_ANY_PROFILE`, `VIEW_USER`
- Chat: `CREATE_CHAT`, `READ_OWN_CHAT`, `READ_ANY_CHAT`
- Admin: `MANAGE_USERS`, `VIEW_AUDIT_LOGS`, `MODERATE_CONTENT`

### 2. Audit Logging System
**File**: `lib/audit.ts`

**Features**:
- Comprehensive audit trail for all security events
- Tracks successful and failed authorization attempts
- Captures IP address, user agent, and contextual details
- Separate logging functions for different scenarios

**Usage Example**:
```typescript
import {
  logSuccess,
  logForbidden,
  logUnauthorized,
  AuditAction,
  AuditResource
} from '@/lib/audit'

// Log successful action
await logSuccess(
  AuditAction.DELETE_COMMENT,
  AuditResource.COMMENT,
  session.user.id,
  commentId,
  { isModeratorAction: true },
  request
)

// Log forbidden access
await logForbidden(
  AuditAction.ACCESS_CHAT,
  AuditResource.CHAT,
  session.user.id,
  chatId,
  'User does not own this chat',
  request
)

// Log unauthorized access
await logUnauthorized(
  AuditResource.PICK,
  pickId,
  undefined,
  request
)
```

**Audit Actions**:
- Authentication: `LOGIN`, `LOGOUT`, `SIGNUP`
- Picks: `CREATE_PICK`, `UPDATE_PICK`, `DELETE_PICK`, `PURCHASE_PICK`
- Comments: `CREATE_COMMENT`, `DELETE_COMMENT`
- Profile: `UPDATE_PROFILE`, `UPDATE_OTHER_PROFILE`
- Chat: `CREATE_CHAT`, `ACCESS_CHAT`
- Security: `UNAUTHORIZED_ACCESS`, `FORBIDDEN_ACCESS`
- Admin: `MANAGE_USER`, `MODERATE_CONTENT`

### 3. Database Schema Updates
**File**: `prisma/schema.prisma`

**Changes**:
1. Added `UserRole` enum with USER, ADMIN, MODERATOR values
2. Added `role` field to User model (default: USER)
3. Created `AuditLog` model for security audit trail
4. Added indexes for performance optimization

**Migration**: `prisma/migrations/20251029140257_add_user_roles_and_audit_logging/migration.sql`

## Deployment Instructions

### 1. Apply Database Migration
```bash
# Production
DATABASE_URL="your-production-url" npx prisma migrate deploy

# Development
npx prisma migrate dev
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Create Your First Admin User
You'll need to manually update a user to admin role in the database:

```sql
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'your-admin-email@example.com';
```

Or use Prisma Studio:
```bash
npx prisma studio
```

### 4. Test Authorization
Test the security fixes:
1. Try accessing another user's chat (should fail with 403)
2. Try updating another user's profile (should fail with 403 unless admin)
3. Log in as admin and verify you can access all chats
4. Test moderator comment deletion

### 5. Monitor Audit Logs
Query audit logs to monitor security events:

```typescript
import { getAllAuditLogs, getUserAuditLogs } from '@/lib/audit'

// Get all failed authorization attempts
const failedAttempts = await getAllAuditLogs(100, 0, {
  success: false
})

// Get logs for specific user
const userLogs = await getUserAuditLogs(userId, 50, 0)
```

## Security Best Practices Going Forward

### 1. Always Verify Ownership
```typescript
// ❌ BAD: No ownership check
const resource = await prisma.resource.findUnique({ where: { id } })
await prisma.resource.delete({ where: { id } })

// ✅ GOOD: Verify ownership
const resource = await prisma.resource.findUnique({ where: { id } })
if (resource.userId !== session.user.id && !await isAdmin(session.user.id)) {
  await logForbidden(...)
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
await prisma.resource.delete({ where: { id } })
```

### 2. Log All Security Events
```typescript
// Always log authorization failures
if (!authorized) {
  await logForbidden(action, resource, userId, resourceId, reason, request)
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### 3. Use Type-Safe Permissions
```typescript
// Use the Permission enum, don't hardcode strings
import { Permission } from '@/lib/authorization'

const result = await authorize(session, {
  permission: Permission.DELETE_OWN_COMMENT, // ✅ Type-safe
  // permission: 'delete_comment', // ❌ Avoid this
})
```

### 4. Admin Endpoints Should Be Explicit
```typescript
// Make admin-only endpoints clear
export async function DELETE(request: NextRequest) {
  if (!await isAdmin(session.user.id)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
  // ... admin operation
}
```

## Audit Trail Query Examples

### Get All Failed Access Attempts
```typescript
const failures = await getAllAuditLogs(100, 0, { success: false })
```

### Get All Admin Actions
```typescript
const adminLogs = await prisma.auditLog.findMany({
  where: {
    user: { role: 'ADMIN' },
    action: { in: ['UPDATE_OTHER_PROFILE', 'MODERATE_CONTENT'] }
  },
  include: { user: true }
})
```

### Get Recent Unauthorized Access Attempts
```typescript
const unauthorized = await prisma.auditLog.findMany({
  where: {
    action: 'UNAUTHORIZED_ACCESS',
    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
  }
})
```

## Summary of Security Improvements

✅ **Fixed Critical Vulnerabilities**:
- Chat access control vulnerability (CRITICAL)
- Added moderation capabilities for comments
- Added admin profile management

✅ **Implemented RBAC**:
- Three-tier role system (USER, ADMIN, MODERATOR)
- 20+ granular permissions
- Type-safe authorization helpers

✅ **Comprehensive Audit Logging**:
- All security events logged
- IP address and user agent tracking
- Success/failure tracking
- Admin action tracking

✅ **Database Schema**:
- User roles with proper indexing
- AuditLog table for compliance
- Migration ready for deployment

✅ **Verified Existing Security**:
- Pick UPDATE/DELETE operations already had proper ownership checks
- Profile endpoint already restricted to self-updates (now supports admin override)

## Next Steps

1. **Apply the database migration** to add roles and audit logging
2. **Create admin users** by updating the database directly
3. **Monitor audit logs** for suspicious activity
4. **Consider rate limiting** on sensitive endpoints
5. **Add 2FA requirement** for admin accounts
6. **Implement session management** improvements
7. **Add CSRF protection** if not already present
8. **Review and audit** other UPDATE/DELETE endpoints not covered in this fix
