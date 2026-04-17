/**
 * GET /api/app/data
 * Public — returns agenda, speakers, announcements, notifications from Supabase
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xubrgmwrhkkhyjtmnlqj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_A3J48KZ6_pcjadEVwrglow_CLYgaNTc';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
    const sb = createClient(SUPABASE_URL, key);

    const [
      { data: agendaRaw },
      { data: speakers },
      { data: announcements },
      { data: notifications },
      { data: events },
    ] = await Promise.all([
      sb.from('agenda_sessions')
        .select('*, speaker:speakers(name, photo_url, company)')
        .order('sort_order'),
      sb.from('speakers').select('*').order('name'),
      sb.from('announcements').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }),
      sb.from('notifications').select('*').order('sent_at', { ascending: false }).limit(50),
      sb.from('events').select('*').eq('status', 'published').order('date', { ascending: false }),
    ]);

    return res.status(200).json({
      agenda: agendaRaw || [],
      speakers: speakers || [],
      announcements: announcements || [],
      notifications: notifications || [],
      events: events || [],
    });
  } catch (e) {
    console.error('[data]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
