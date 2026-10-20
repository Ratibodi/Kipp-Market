import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-supabase.kippmarket.local",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key-kipp-market"
  );
}
