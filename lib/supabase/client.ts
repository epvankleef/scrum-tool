'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Browser client met publishable key. Alleen voor Realtime broadcast-kanalen
// (geen directe DB reads/writes — RLS staat op default-deny). Singleton.
let singleton: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (singleton) return singleton;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set');
  singleton = createClient(url, key, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 20 } },
  });
  return singleton;
}
