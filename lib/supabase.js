/**
 * Supabase client helpers
 * - supabase: public client (publishable key) — for browser/PWA
 * - supabaseAdmin: service role client — for API routes only
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xubrgmwrhkkhyjtmnlqj.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_A3J48KZ6_pcjadEVwrglow_CLYgaNTc';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Public client — safe to use in browser
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client — only for server-side API routes
export function getAdminClient() {
  if (!SUPABASE_SERVICE_KEY) throw new Error('SUPABASE_SERVICE_KEY not set');
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
