/**
 * GET /api/app/data
 * Public — returns agenda, speakers, announcements from Edge Config
 */
import { createClient } from '@vercel/edge-config';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const client = createClient(process.env.EDGE_CONFIG);
    const [agenda, speakers, announcements] = await Promise.all([
      client.get('agenda').catch(() => []),
      client.get('speakers').catch(() => []),
      client.get('announcements').catch(() => []),
    ]);
    return res.status(200).json({
      agenda: agenda || [],
      speakers: speakers || [],
      announcements: announcements || [],
    });
  } catch (e) {
    console.error('[data]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
