import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET! });
  const isAuth = !!token;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup");

  // If user is authenticated and tries to access auth pages, redirect to tasks
  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/tasks", req.url));
    }
    return NextResponse.next();
  }

  // If user is not authenticated and tries to access protected routes, redirect to login
  if (!isAuth) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tasks/:path*", "/dashboard/:path*", "/login", "/signup"],
};
