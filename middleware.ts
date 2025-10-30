import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Admin routes protection
  if (path.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Check if user is authenticated
    if (!token) {
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${path}`, request.url)
      );
    }

    // Check if user has admin or moderator role
    const userRole = (token as any).role;
    if (userRole !== "ADMIN" && userRole !== "MODERATOR") {
      return NextResponse.redirect(new URL("/feed", request.url));
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
