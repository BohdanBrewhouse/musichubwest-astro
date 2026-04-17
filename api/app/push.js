/**
 * POST /api/app/push
 * Admin only — send push notification to all subscribers
 * Auth: Authorization: Bearer <ADMIN_PASSWORD>
 */
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xubrgmwrhkkhyjtmnlqj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

function getAdmin() {
  if (!SUPABASE_SERVICE_KEY) throw new Error('SUPABASE_SERVICE_KEY not set');
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  // Auth
  const pass = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (pass !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  const { title, body } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });

  // Check VAPID keys
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return res.status(500).json({
      error: 'VAPID keys not configured. Add VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_EMAIL to Vercel env vars.',
    });
  }

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'admin@musichubwest.se'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  try {
    const sb = getAdmin();

    // Save notification to history
    await sb.from('notifications').insert({
      title,
      body: body || '',
      url: '/app',
    });

    // Get all push subscriptions
    const { data: rows } = await sb.from('push_subscriptions').select('id, subscription');
    if (!rows || !rows.length) {
      return res.status(200).json({ ok: true, sent: 0, message: 'No subscribers' });
    }

    const payload = JSON.stringify({ title, body, url: '/app' });
    const results = await Promise.allSettled(
      rows.map(row => webpush.sendNotification(row.subscription, payload))
    );

    // Remove expired/invalid subscriptions
    const failedIds = rows
      .filter((_, i) => results[i].status === 'rejected')
      .map(row => row.id);

    if (failedIds.length > 0) {
      await sb.from('push_subscriptions').delete().in('id', failedIds);
    }

    const sent = rows.length - failedIds.length;
    return res.status(200).json({ ok: true, sent, failed: failedIds.length });
  } catch (e) {
    console.error('[push]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
