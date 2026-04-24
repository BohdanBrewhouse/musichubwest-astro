/**
 * POST /api/track-click
 * Logs a click on an external registration link.
 *
 * Body: { slug, title, lang }
 *
 * Currently logs to Vercel function logs (visible in Vercel dashboard → Functions → Logs).
 * To see counts: filter logs by "[ext-click]" in the Vercel dashboard.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug = 'unknown', title = 'unknown', lang = 'sv' } = req.body || {};

  // Log to Vercel function logs — searchable in the Vercel dashboard
  console.log(
    `[ext-click] slug="${slug}" title="${title}" lang="${lang}" at=${new Date().toISOString()}`
  );

  return res.status(200).json({ ok: true });
}
