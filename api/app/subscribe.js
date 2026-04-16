/**
 * POST /api/app/subscribe
 * Save push subscription to Edge Config
 */
import { createClient } from '@vercel/edge-config';

const TEAM_ID = 'team_eCPecmqFzAxv11gB4yHaFddS';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { subscription } = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: 'No subscription' });

  try {
    const client = createClient(process.env.EDGE_CONFIG);
    const existing = (await client.get('push_subscriptions').catch(() => null)) || [];

    // Avoid duplicates by endpoint
    const filtered = existing.filter(s => s.endpoint !== subscription.endpoint);
    filtered.push(subscription);

    const ecId = process.env.EDGE_CONFIG_ID;
    const token = process.env.VERCEL_API_TOKEN;
    await fetch(`https://api.vercel.com/v1/edge-config/${ecId}/items?teamId=${TEAM_ID}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ operation: 'upsert', key: 'push_subscriptions', value: filtered }] }),
    });

    return res.status(200).json({ ok: true, total: filtered.length });
  } catch (e) {
    console.error('[subscribe]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
