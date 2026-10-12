import "server-only";
import { createClient } from "@supabase/supabase-js";
import { communityConfig } from "./config";

export type PublishedContent = {
  horses: { slug: string; name: string; summary: string; details: string }[];
  services: { slug: string; title: string; summary: string; details: string }[];
};
export async function publishedContent(): Promise<PublishedContent> {
  const config = communityConfig();
  if (!config) return { horses: [], services: [] };
  const client = createClient(config.url, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const [horses, services] = await Promise.all([
    client
      .from("animals")
      .select("slug,name,summary,details:story")
      .eq("species", "horse")
      .is("deleted_at", null)
      .eq("state", "published")
      .order("name"),
    client
      .from("services")
      .select("slug,title,summary,details")
      .eq("state", "published")
      .order("title"),
  ]);
  return {
    horses: horses.error ? [] : (horses.data ?? []),
    services: services.error ? [] : (services.data ?? []),
  };
}
