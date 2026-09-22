import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "dw_admin";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.AUTH_SECRET;

  if (token && secret) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      if (payload.role === "SUPER_ADMIN" || payload.role === "ADMIN") {
        return NextResponse.next();
      }
    } catch {
      // Expired or tampered token — fall through to the redirect below.
    }
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(COOKIE_NAME);
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
