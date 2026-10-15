import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { communityConfig } from "@/lib/community/config";
import { domainDestination, isPrivateRoute, portalOrigin } from "@/lib/domains";

export async function proxy(request: NextRequest) {
  const destination = domainDestination(request.url);
  if (destination) {
    // Never replay a submitted form/body to a different origin. GET and HEAD
    // preserve bookmarked paths and queries; writes must restart explicitly.
    const response = ["GET", "HEAD"].includes(request.method)
      ? NextResponse.redirect(destination, 308)
      : new NextResponse("Open the canonical ENVET address and try again.", {
          status: 409,
        });
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
  const portalRequest = new URL(request.url).origin === portalOrigin();
  if (portalRequest && request.nextUrl.pathname === "/robots.txt") {
    return new NextResponse("User-agent: *\nDisallow: /\n", {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  }
  // Marketing pages and static assets must not refresh cookies or lose caching.
  if (!isPrivateRoute(request.nextUrl.pathname))
    return NextResponse.next({ request });
  const config = communityConfig();
  let response = NextResponse.next({ request });
  if (config) {
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
  }
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
