import { NextRequest, NextResponse } from "next/server";
import { communityConfig, originMatchesConfig } from "@/lib/community/config";
import { safeReturnPath } from "@/lib/community/validation";
import { userClient } from "@/lib/community/supabase";

function authRedirect(url: URL | string) {
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function GET(request: NextRequest) {
  const config = communityConfig();
  if (!config || !originMatchesConfig(request.nextUrl.origin, config.origin))
    return authRedirect(new URL("/account?error=unavailable", request.url));
  const code = request.nextUrl.searchParams.get("code");
  if (!code)
    return authRedirect(new URL("/account?error=callback", config.origin));
  const client = await userClient();
  if (!client)
    return authRedirect(new URL("/account?error=unavailable", config.origin));
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error)
    return authRedirect(new URL("/account?error=callback", config.origin));
  const response = authRedirect(
    new URL(
      safeReturnPath(request.cookies.get("envet-auth-next")?.value ?? null),
      config.origin,
    ),
  );
  response.cookies.set("envet-auth-next", "", {
    path: "/auth/callback",
    maxAge: 0,
    httpOnly: true,
    secure: config.origin.startsWith("https:"),
    sameSite: "lax",
  });
  return response;
}
