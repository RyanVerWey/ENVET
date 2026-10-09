import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { communityConfig, dataConfig } from "./config";

export async function userClient() {
  const config = communityConfig();
  if (!config) return null;
  const cookieStore = await cookies();
  return createServerClient(config.url, config.publishableKey, {
    cookieOptions: {
      httpOnly: true,
      secure: config.origin.startsWith("https:"),
      sameSite: "lax",
      path: "/",
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(items) {
        try {
          for (const { name, value, options } of items)
            cookieStore.set(name, value, options);
        } catch {
          // Server Components cannot set cookies; route handlers and Proxy can.
        }
      },
    },
  });
}

export function serviceClient() {
  const config = dataConfig();
  if (!config) return null;
  return createClient(config.url, config.secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function currentUser() {
  const client = await userClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  const user = error ? null : data.user;
  if (
    !user?.email_confirmed_at ||
    !user.identities?.some((identity) => identity.provider === "google")
  )
    return null;
  return user;
}

export async function staffUser() {
  const user = await currentUser();
  const service = serviceClient();
  if (!user || !service) return null;
  const { data, error } = await service.rpc("staff_access", {
    p_actor: user.id,
  });
  return !error && data === true ? user : null;
}
