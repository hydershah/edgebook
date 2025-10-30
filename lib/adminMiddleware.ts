import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { UserRole } from "@prisma/client";
import { logAudit } from "./audit";

export interface AdminSession {
  user: {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
  };
}

/**
 * Middleware to check if user is authenticated and has admin/moderator role
 */
export async function requireAdmin(
  req: NextRequest,
  allowModerator = true
): Promise<
  | { authorized: true; session: AdminSession }
  | { authorized: false; response: NextResponse }
> {
  const session = (await getServerSession(authOptions)) as AdminSession | null;

  // Get IP and user agent for logging
  const ipAddress =
    req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  if (!session?.user) {
    await logAudit({
      action: "ADMIN_ACCESS_DENIED",
      resource: "ADMIN",
      success: false,
      ipAddress,
      userAgent,
      details: { reason: "No session" },
    });

    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const isAdmin = session.user.role === UserRole.ADMIN;
  const isModerator = session.user.role === UserRole.MODERATOR;

  if (!isAdmin && !(allowModerator && isModerator)) {
    await logAudit({
      userId: session.user.id,
      action: "ADMIN_ACCESS_DENIED",
      resource: "ADMIN",
      success: false,
      ipAddress,
      userAgent,
      details: {
        reason: "Insufficient permissions",
        role: session.user.role,
        required: allowModerator ? "ADMIN or MODERATOR" : "ADMIN",
      },
    });

    return {
      authorized: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    authorized: true,
    session,
  };
}

/**
 * Middleware specifically for admin-only routes (moderators not allowed)
 */
export async function requireAdminOnly(req: NextRequest) {
  return requireAdmin(req, false);
}

/**
 * Helper to get request metadata for logging
 */
export function getRequestMetadata(req: NextRequest) {
  return {
    ipAddress:
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown",
    userAgent: req.headers.get("user-agent") || "unknown",
  };
}
