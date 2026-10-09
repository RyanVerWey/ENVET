import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { communityConfig } from "@/lib/community/config";

export async function proxy(request: NextRequest) {
  const config = communityConfig();
  if (!config) return NextResponse.next({ request });
  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookieOptions: {
      httpOnly: true,
      secure: config.origin.startsWith("https:"),
      sameSite: "lax",
      path: "/",
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(items) {
        for (const { name, value } of items) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of items)
          response.cookies.set(name, value, options);
      },
    },
  });
  await supabase.auth.getClaims();
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  if (
    request.nextUrl.pathname.startsWith("/account") ||
    request.nextUrl.pathname.startsWith("/team") ||
    request.nextUrl.pathname.startsWith("/forms")
  )
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/team/:path*",
    "/forms/:path*",
    "/api/:path*",
    "/auth/:path*",
  ],
};
