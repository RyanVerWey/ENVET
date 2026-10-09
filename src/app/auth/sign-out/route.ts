import { NextRequest, NextResponse } from "next/server";
import { sameOrigin } from "@/lib/community/security";
import { userClient } from "@/lib/community/supabase";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  const client = await userClient();
  const result = client
    ? await client.auth.signOut()
    : { error: new Error("Auth unavailable") };
  const response = NextResponse.redirect(
    new URL(result.error ? "/account?error=signout" : "/account", request.url),
    303,
  );
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
