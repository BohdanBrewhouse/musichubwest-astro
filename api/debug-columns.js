/**
 * GET /api/debug-columns
 * Temporary endpoint — lists all column IDs for the Monday board
 * Delete after use.
 */
export default async function handler(req, res) {
  const token   = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BOARD_ID;

  if (!token || !boardId) {
    return res.status(500).json({ error: 'MONDAY_API_TOKEN or MONDAY_BOARD_ID not set' });
  }

  const query = `{
    boards(ids: [${boardId}]) {
      columns { id title type }
    }
  }`;

  const r = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': token,
      'API-Version':   '2024-01',
    },
    body: JSON.stringify({ query }),
  });

  const data = await r.json();
  const columns = data?.data?.boards?.[0]?.columns ?? [];

  return res.status(200).json({ columns });
}
