import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for auth routes to prevent redirect loops
  if (path.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Admin routes protection
  if (path.startsWith("/admin")) {
    try {
      // Get the token - use secureCookie for production
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || "MeYjQaKKguioN4dmsgyB2wBT5DkdhbFEnUOGIZ8C6hk=",
        secureCookie: process.env.NODE_ENV === 'production',
      });

      // Debug logging for production
      if (!token) {
        console.log("Admin middleware: No token found for path:", path);
        console.log("Environment:", process.env.NODE_ENV);
        console.log("Secret configured:", !!process.env.NEXTAUTH_SECRET);
        console.log("Cookies:", request.cookies.getAll().map(c => c.name));
      }

      // Check if user is authenticated
      if (!token) {
        return NextResponse.redirect(
          new URL(`/auth/signin?callbackUrl=${path}`, request.url)
        );
      }

      // Check if user has admin or moderator role
      const userRole = (token as any).role;
      if (userRole !== "ADMIN" && userRole !== "MODERATOR") {
        console.log("Admin middleware: User role is not admin/moderator:", userRole);
        return NextResponse.redirect(new URL("/feed", request.url));
      }

      // Log successful admin access
      console.log("Admin middleware: Access granted to", token.email, "with role", userRole);
    } catch (error) {
      console.error("Admin middleware error:", error);
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${path}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
