import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET! });
  const isAuth = !!token;

  const { pathname, search } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");

  const isApiRoute = pathname.startsWith("/api");

  // If user is authenticated and tries to access auth pages, redirect to tasks
  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/tasks", req.url));
    }
    return NextResponse.next();
  }

  // Handle API routes
  if (isApiRoute) {
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // If user is not authenticated and tries to access protected routes, redirect to login
  if (!isAuth) {
    let from = pathname;
    if (search) {
      from += search;
    }
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tasks/:path*", "/dashboard/:path*", "/login", "/signup", "/api/graphql/:path*"],
};
