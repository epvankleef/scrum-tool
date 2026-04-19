import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Service-role client — bypasst RLS. Gebruik alleen in server actions,
// route handlers, en scheduled jobs. Nooit exporteren naar client bundles.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
