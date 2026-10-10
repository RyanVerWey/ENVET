import "server-only";
import { createClient } from "@supabase/supabase-js";
import { communityConfig } from "./config";
import { animalColumns, type AnimalRecord } from "./animals";
export async function publishedAnimals(): Promise<{
  animals: AnimalRecord[];
  unavailable: boolean;
}> {
  const config = communityConfig();
  if (!config) return { animals: [], unavailable: false };
  const client = createClient(config.url, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client
    .from("animals")
    .select(animalColumns)
    .eq("state", "published")
    .is("deleted_at", null)
    .order("species")
    .order("name")
    .limit(500);
  return { animals: (data ?? []) as AnimalRecord[], unavailable: !!error };
}
