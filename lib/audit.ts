import { prisma } from './prisma'
import { NextRequest } from 'next/server'

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SIGNUP = 'SIGNUP',

  // Pick actions
  CREATE_PICK = 'CREATE_PICK',
  UPDATE_PICK = 'UPDATE_PICK',
  DELETE_PICK = 'DELETE_PICK',
  PURCHASE_PICK = 'PURCHASE_PICK',

  // Comment actions
  CREATE_COMMENT = 'CREATE_COMMENT',
  DELETE_COMMENT = 'DELETE_COMMENT',

  // Profile actions
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  UPDATE_OTHER_PROFILE = 'UPDATE_OTHER_PROFILE',

  // Chat actions
  CREATE_CHAT = 'CREATE_CHAT',
  ACCESS_CHAT = 'ACCESS_CHAT',

  // Authorization failures
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  FORBIDDEN_ACCESS = 'FORBIDDEN_ACCESS',

  // Admin actions
  MANAGE_USER = 'MANAGE_USER',
  MODERATE_CONTENT = 'MODERATE_CONTENT',

  // Admin - User Management
  LIST_USERS = 'LIST_USERS',
  VIEW_USER = 'VIEW_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  BAN_USER = 'BAN_USER',
  UNBAN_USER = 'UNBAN_USER',
  SUSPEND_USER = 'SUSPEND_USER',
  UNSUSPEND_USER = 'UNSUSPEND_USER',
  WARN_USER = 'WARN_USER',
  AUTO_FLAG_USER = 'AUTO_FLAG_USER',

  // Admin - Content Moderation
  LIST_PICKS = 'LIST_PICKS',
  MODERATE_PICK = 'MODERATE_PICK',

  // Admin - Reports
  LIST_REPORTS = 'LIST_REPORTS',
  CREATE_REPORT = 'CREATE_REPORT',
  UPDATE_REPORT = 'UPDATE_REPORT',
  RESOLVE_REPORT = 'RESOLVE_REPORT',

  // Admin - Transactions & Payouts
  LIST_TRANSACTIONS = 'LIST_TRANSACTIONS',
  LIST_PAYOUTS = 'LIST_PAYOUTS',
  APPROVE_PAYOUT = 'APPROVE_PAYOUT',
  REJECT_PAYOUT = 'REJECT_PAYOUT',

  // Admin - Disputes
  LIST_DISPUTES = 'LIST_DISPUTES',
  RESOLVE_DISPUTE = 'RESOLVE_DISPUTE',

  // Admin - Analytics
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',

  // Admin - Access
  ADMIN_ACCESS_DENIED = 'ADMIN_ACCESS_DENIED',
}

export enum AuditResource {
  PICK = 'PICK',
  COMMENT = 'COMMENT',
  USER = 'USER',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  AUTH = 'AUTH',
  REPORT = 'REPORT',
  TRANSACTION = 'TRANSACTION',
  PAYOUT = 'PAYOUT',
  DISPUTE = 'DISPUTE',
  ANALYTICS = 'ANALYTICS',
  ADMIN = 'ADMIN',
}

interface AuditLogData {
  userId?: string
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
  success: boolean
}

/**
 * Extract IP address from request
 */
export function getIpAddress(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  return undefined
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') || undefined
}

/**
 * Log an audit event
 */
export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        details: data.details ? data.details : undefined,
        success: data.success,
      },
    })
  } catch (error) {
    // Don't throw errors from audit logging - just log to console
    console.error('Failed to create audit log:', error)
  }
}

/**
 * Log a successful action
 */
export async function logSuccess(
  action: AuditAction,
  resource: AuditResource,
  userId?: string,
  resourceId?: string,
  details?: Record<string, any>,
  request?: NextRequest
): Promise<void> {
  await logAudit({
    userId,
    action,
    resource,
    resourceId,
    ipAddress: request ? getIpAddress(request) : undefined,
    userAgent: request ? getUserAgent(request) : undefined,
    details,
    success: true,
  })
}

/**
 * Log an authorization failure
 */
export async function logAuthorizationFailure(
  action: AuditAction,
  resource: AuditResource,
  userId?: string,
  resourceId?: string,
  reason?: string,
  request?: NextRequest
): Promise<void> {
  await logAudit({
    userId,
    action,
    resource,
    resourceId,
    ipAddress: request ? getIpAddress(request) : undefined,
    userAgent: request ? getUserAgent(request) : undefined,
    details: { reason },
    success: false,
  })
}

/**
 * Log unauthorized access attempt
 */
export async function logUnauthorized(
  resource: AuditResource,
  resourceId?: string,
  userId?: string,
  request?: NextRequest
): Promise<void> {
  await logAuthorizationFailure(
    AuditAction.UNAUTHORIZED_ACCESS,
    resource,
    userId,
    resourceId,
    'User not authenticated',
    request
  )
}

/**
 * Log forbidden access attempt
 */
export async function logForbidden(
  action: AuditAction,
  resource: AuditResource,
  userId: string,
  resourceId?: string,
  reason?: string,
  request?: NextRequest
): Promise<void> {
  await logAuthorizationFailure(
    AuditAction.FORBIDDEN_ACCESS,
    resource,
    userId,
    resourceId,
    reason || 'Insufficient permissions',
    request
  )
}

/**
 * Get audit logs for a user (admin only)
 */
export async function getUserAuditLogs(
  userId: string,
  limit = 50,
  offset = 0
) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
        },
      },
    },
  })
}

/**
 * Get all audit logs (admin only)
 */
export async function getAllAuditLogs(
  limit = 100,
  offset = 0,
  filters?: {
    success?: boolean
    resource?: AuditResource
    action?: AuditAction
  }
) {
  return prisma.auditLog.findMany({
    where: {
      success: filters?.success,
      resource: filters?.resource,
      action: filters?.action,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
        },
      },
    },
  })
}