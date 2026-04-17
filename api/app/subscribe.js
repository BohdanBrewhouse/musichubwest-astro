/**
 * POST /api/app/subscribe
 * Save push subscription to Supabase
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xubrgmwrhkkhyjtmnlqj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_A3J48KZ6_pcjadEVwrglow_CLYgaNTc';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { subscription } = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: 'No subscription' });

  try {
    const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
    const sb = createClient(SUPABASE_URL, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Upsert by endpoint (avoid duplicates)
    const { error } = await sb
      .from('push_subscriptions')
      .upsert({ subscription }, { onConflict: 'subscription->endpoint' })
      .select();

    // Fallback: if upsert fails on conflict detection, just insert
    if (error) {
      // Check if already exists
      const endpoint = subscription.endpoint;
      const { data: existing } = await sb
        .from('push_subscriptions')
        .select('id')
        .filter('subscription->>endpoint', 'eq', endpoint)
        .maybeSingle();

      if (!existing) {
        await sb.from('push_subscriptions').insert({ subscription });
      }
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[subscribe]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
