/**
 * GET /api/debug-columns
 * Temporary debug endpoint — returns Monday board structure (columns + groups).
 * DELETE this file after you've confirmed your column IDs are correct.
 *
 * Usage:
 *   curl https://YOUR_VERCEL_URL/api/debug-columns
 */

const MONDAY_API = 'https://api.monday.com/v2';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
  const MONDAY_BOARD_ID  = process.env.MONDAY_BOARD_ID;

  if (!MONDAY_API_TOKEN || !MONDAY_BOARD_ID) {
    return res.status(500).json({ error: 'MONDAY_API_TOKEN or MONDAY_BOARD_ID env vars not set' });
  }

  const query = `{
    boards(ids: [${MONDAY_BOARD_ID}]) {
      name
      columns { id title type settings_str }
      groups  { id title }
    }
  }`;

  const apiRes = await fetch(MONDAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': MONDAY_API_TOKEN,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query }),
  });

  const data = await apiRes.json();

  if (data.errors) {
    return res.status(500).json({ monday_errors: data.errors });
  }

  const board = data?.data?.boards?.[0];
  if (!board) {
    return res.status(404).json({ error: 'Board not found' });
  }

  return res.status(200).json({
    board_name: board.name,
    columns: board.columns.map(c => ({
      id:    c.id,
      title: c.title,
      type:  c.type,
    })),
    groups: board.groups.map(g => ({
      id:    g.id,
      title: g.title,
    })),
    _note: 'Delete api/debug-columns.js after use — it exposes board structure publicly.',
  });
}
