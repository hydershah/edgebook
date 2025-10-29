import { Session } from 'next-auth'
import { prisma } from './prisma'

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export enum Permission {
  // Pick permissions
  CREATE_PICK = 'CREATE_PICK',
  READ_PICK = 'READ_PICK',
  UPDATE_OWN_PICK = 'UPDATE_OWN_PICK',
  DELETE_OWN_PICK = 'DELETE_OWN_PICK',
  UPDATE_ANY_PICK = 'UPDATE_ANY_PICK',
  DELETE_ANY_PICK = 'DELETE_ANY_PICK',

  // Comment permissions
  CREATE_COMMENT = 'CREATE_COMMENT',
  DELETE_OWN_COMMENT = 'DELETE_OWN_COMMENT',
  DELETE_ANY_COMMENT = 'DELETE_ANY_COMMENT',

  // User/Profile permissions
  UPDATE_OWN_PROFILE = 'UPDATE_OWN_PROFILE',
  UPDATE_ANY_PROFILE = 'UPDATE_ANY_PROFILE',
  VIEW_USER = 'VIEW_USER',

  // Chat permissions
  CREATE_CHAT = 'CREATE_CHAT',
  READ_OWN_CHAT = 'READ_OWN_CHAT',
  READ_ANY_CHAT = 'READ_ANY_CHAT',

  // Admin permissions
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  MODERATE_CONTENT = 'MODERATE_CONTENT',
}

/**
 * Role-based permission mapping
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [
    Permission.CREATE_PICK,
    Permission.READ_PICK,
    Permission.UPDATE_OWN_PICK,
    Permission.DELETE_OWN_PICK,
    Permission.CREATE_COMMENT,
    Permission.DELETE_OWN_COMMENT,
    Permission.UPDATE_OWN_PROFILE,
    Permission.VIEW_USER,
    Permission.CREATE_CHAT,
    Permission.READ_OWN_CHAT,
  ],
  [UserRole.MODERATOR]: [
    Permission.CREATE_PICK,
    Permission.READ_PICK,
    Permission.UPDATE_OWN_PICK,
    Permission.DELETE_OWN_PICK,
    Permission.CREATE_COMMENT,
    Permission.DELETE_OWN_COMMENT,
    Permission.DELETE_ANY_COMMENT,
    Permission.UPDATE_OWN_PROFILE,
    Permission.VIEW_USER,
    Permission.CREATE_CHAT,
    Permission.READ_OWN_CHAT,
    Permission.MODERATE_CONTENT,
  ],
  [UserRole.ADMIN]: [
    Permission.CREATE_PICK,
    Permission.READ_PICK,
    Permission.UPDATE_OWN_PICK,
    Permission.DELETE_OWN_PICK,
    Permission.UPDATE_ANY_PICK,
    Permission.DELETE_ANY_PICK,
    Permission.CREATE_COMMENT,
    Permission.DELETE_OWN_COMMENT,
    Permission.DELETE_ANY_COMMENT,
    Permission.UPDATE_OWN_PROFILE,
    Permission.UPDATE_ANY_PROFILE,
    Permission.VIEW_USER,
    Permission.CREATE_CHAT,
    Permission.READ_OWN_CHAT,
    Permission.READ_ANY_CHAT,
    Permission.MANAGE_USERS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.MODERATE_CONTENT,
  ],
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}

/**
 * Check if a user can perform an action on a resource
 */
export async function canPerformAction(
  session: Session | null,
  permission: Permission,
  resourceOwnerId?: string
): Promise<boolean> {
  if (!session?.user?.id) {
    return false
  }

  // Get user with role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user) {
    return false
  }

  const userRole = user.role as UserRole

  // Check role-based permissions
  if (!hasPermission(userRole, permission)) {
    return false
  }

  // For "own" permissions, verify ownership
  const ownPermissions = [
    Permission.UPDATE_OWN_PICK,
    Permission.DELETE_OWN_PICK,
    Permission.DELETE_OWN_COMMENT,
    Permission.UPDATE_OWN_PROFILE,
    Permission.READ_OWN_CHAT,
  ]

  if (ownPermissions.includes(permission)) {
    if (!resourceOwnerId) {
      return false
    }
    return session.user.id === resourceOwnerId
  }

  return true
}

/**
 * Verify user owns a resource
 */
export function verifyOwnership(userId: string, resourceOwnerId: string): boolean {
  return userId === resourceOwnerId
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  return user?.role === UserRole.ADMIN
}

/**
 * Check if user is moderator or admin
 */
export async function isModerator(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  return user?.role === UserRole.MODERATOR || user?.role === UserRole.ADMIN
}

/**
 * Authorization middleware wrapper
 */
export interface AuthorizationOptions {
  permission: Permission
  getResourceOwnerId?: () => Promise<string | null>
  allowAdmin?: boolean
}

export async function authorize(
  session: Session | null,
  options: AuthorizationOptions
): Promise<{ authorized: boolean; reason?: string }> {
  if (!session?.user?.id) {
    return { authorized: false, reason: 'Not authenticated' }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user) {
    return { authorized: false, reason: 'User not found' }
  }

  const userRole = user.role as UserRole

  // Admin override
  if (options.allowAdmin !== false && userRole === UserRole.ADMIN) {
    return { authorized: true }
  }

  // Check permission
  if (!hasPermission(userRole, options.permission)) {
    return { authorized: false, reason: 'Insufficient permissions' }
  }

  // Check ownership if needed
  if (options.getResourceOwnerId) {
    const ownerId = await options.getResourceOwnerId()
    if (ownerId && session.user.id !== ownerId) {
      return { authorized: false, reason: 'Not the resource owner' }
    }
  }

  return { authorized: true }
}