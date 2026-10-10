import { NextRequest, NextResponse } from "next/server";
import { communityConfig, oauthRequestOrigin } from "@/lib/community/config";
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
  // Preserve the browser's hostname: loopback aliases do not share cookies.
  const origin = config
    ? oauthRequestOrigin(
        request.url,
        request.headers.get("host"),
        config.origin,
      )
    : null;
  if (!config || !origin)
    return authRedirect(new URL("/account?error=unavailable", request.url));
  const next = safeReturnPath(request.nextUrl.searchParams.get("next"));
  const callback = new URL("/auth/callback", origin);
  const client = await userClient();
  if (!client)
    return authRedirect(new URL("/account?error=unavailable", origin));
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString() },
  });
  if (error || !data.url)
    return authRedirect(new URL("/account?error=sign-in", origin));
  const response = authRedirect(data.url);
  response.cookies.set("envet-auth-next", next, {
    httpOnly: true,
    secure: config.origin.startsWith("https:"),
    sameSite: "lax",
    path: "/auth/callback",
    maxAge: 600,
  });
  return response;
}
