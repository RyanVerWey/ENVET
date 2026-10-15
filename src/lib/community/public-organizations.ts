import "server-only";
import { createClient } from "@supabase/supabase-js";
import { communityConfig } from "./config";
import type { PublicOrganization } from "./organizations";

export async function publishedOrganizations(): Promise<PublicOrganization[]> {
  const config = communityConfig();
  if (!config) return [];
  const client = createClient(config.url, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
  const organizations: PublicOrganization[] = [];
  // Read every page, not just the Data API's default row limit.
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from("contributing_organizations")
      .select("slug,name,href,description,sort_order")
      .eq("state", "published")
      .is("deleted_at", null)
      .order("sort_order")
      .order("name")
      .order("slug")
      .range(offset, offset + 499);
    if (error) return [];
    organizations.push(...(data ?? []));
    if (!data || data.length < 500) return organizations;
  }
}
