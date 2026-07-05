import { NextResponse, type NextRequest } from "next/server";
import { isProtectedPath } from "@/lib/auth/protected-paths";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isProtectedPath(pathname) && !hasSupabaseAuthCookie(request)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
