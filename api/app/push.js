/**
 * POST /api/app/push
 * Admin only — send push notification to all subscribers
 * Auth: Authorization: Bearer <ADMIN_PASSWORD>
 */
import webpush from 'web-push';
import { createClient } from '@vercel/edge-config';

const TEAM_ID = 'team_eCPecmqFzAxv11gB4yHaFddS';

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

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  try {
    const client = createClient(process.env.EDGE_CONFIG);
    const subscriptions = (await client.get('push_subscriptions').catch(() => null)) || [];

    if (!subscriptions.length) return res.status(200).json({ ok: true, sent: 0, message: 'No subscribers' });

    const payload = JSON.stringify({ title, body, url: '/app' });
    const results = await Promise.allSettled(
      subscriptions.map(sub => webpush.sendNotification(sub, payload))
    );

    // Remove expired/invalid subscriptions
    const valid = subscriptions.filter((_, i) => results[i].status === 'fulfilled');
    const failed = subscriptions.length - valid.length;

    if (failed > 0) {
      const ecId = process.env.EDGE_CONFIG_ID;
      const token = process.env.VERCEL_API_TOKEN;
      await fetch(`https://api.vercel.com/v1/edge-config/${ecId}/items?teamId=${TEAM_ID}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ operation: 'upsert', key: 'push_subscriptions', value: valid }] }),
      });
    }

    return res.status(200).json({ ok: true, sent: valid.length, failed });
  } catch (e) {
    console.error('[push]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
