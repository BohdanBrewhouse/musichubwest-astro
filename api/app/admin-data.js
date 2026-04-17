/**
 * POST /api/app/admin-data
 * Admin only — CRUD for agenda, speakers, announcements, events
 * Auth: Authorization: Bearer <ADMIN_PASSWORD>
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xubrgmwrhkkhyjtmnlqj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

function getAdmin() {
  if (!SUPABASE_SERVICE_KEY) throw new Error('SUPABASE_SERVICE_KEY not set');
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const TABLE_MAP = {
  agenda: 'agenda_sessions',
  speakers: 'speakers',
  announcements: 'announcements',
  events: 'events',
};

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
  if (action === 'auth') return res.status(200).json({ ok: true, message: 'Authenticated' });

  if (!TABLE_MAP[type]) return res.status(400).json({ error: 'Invalid type' });

  try {
    const sb = getAdmin();
    const table = TABLE_MAP[type];

    if (action === 'add') {
      const { data, error } = await sb.from(table).insert(item).select().single();
      if (error) throw error;
      return res.status(200).json({ ok: true, item: data });
    }

    if (action === 'update') {
      const { data, error } = await sb.from(table).update(item).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json({ ok: true, item: data });
    }

    if (action === 'delete') {
      const { error } = await sb.from(table).delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    // Sync site event by slug (upsert) — toggle ON
    if (action === 'sync_event') {
      const { slug } = item;
      if (!slug) return res.status(400).json({ error: 'slug required' });
      // Check if already exists
      const { data: existing } = await sb.from('events').select('id').eq('slug', slug).maybeSingle();
      let result;
      if (existing) {
        const { data, error } = await sb.from('events').update(item).eq('slug', slug).select().single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await sb.from('events').insert(item).select().single();
        if (error) throw error;
        result = data;
      }
      return res.status(200).json({ ok: true, item: result });
    }

    // Delete event by slug — toggle OFF
    if (action === 'delete_by_slug') {
      const { slug } = item || {};
      if (!slug) return res.status(400).json({ error: 'slug required' });
      const { error } = await sb.from('events').delete().eq('slug', slug);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    console.error('[admin-data]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
