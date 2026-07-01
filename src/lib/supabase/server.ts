import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

export function requireSupabase(): SupabaseClient {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new Error(
      "Supabase не настроен. Добавь NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в .env.local",
    );
  }
  return client;
}