/**
 * POST /api/app/admin-data
 * Admin only — add/delete items in Edge Config
 * Auth: Authorization: Bearer <ADMIN_PASSWORD>
 */
import { createClient } from '@vercel/edge-config';

const TEAM_ID = 'team_eCPecmqFzAxv11gB4yHaFddS';

async function readKey(key) {
  const client = createClient(process.env.EDGE_CONFIG);
  return (await client.get(key).catch(() => null)) || [];
}

async function writeKey(key, value) {
  const ecId = process.env.EDGE_CONFIG_ID;
  const token = process.env.VERCEL_API_TOKEN;
  const res = await fetch(`https://api.vercel.com/v1/edge-config/${ecId}/items?teamId=${TEAM_ID}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ operation: 'upsert', key, value }] }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Edge Config write failed: ${text}`);
  }
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  // Auth check
  const authHeader = req.headers.authorization || '';
  const pass = authHeader.replace('Bearer ', '').trim();
  if (pass !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { action, type, item, id } = req.body;

  // Auth test
  if (action === 'auth') return res.status(200).json({ ok: true });

  const validTypes = ['agenda', 'speakers', 'announcements'];
  if (!validTypes.includes(type)) return res.status(400).json({ error: 'Invalid type' });

  try {
    if (action === 'add') {
      const arr = await readKey(type);
      const newItem = { ...item, id: Date.now().toString() };
      arr.push(newItem);
      await writeKey(type, arr);
      return res.status(200).json({ ok: true, item: newItem });
    }

    if (action === 'delete') {
      const arr = await readKey(type);
      const filtered = arr.filter(x => x.id !== id);
      await writeKey(type, filtered);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    console.error('[admin-data]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
