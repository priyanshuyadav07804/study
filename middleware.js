import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("memanshi_token")?.value;

  if (!token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("auth", "login");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/subjects/:path*", "/profile/:path*"],
};
