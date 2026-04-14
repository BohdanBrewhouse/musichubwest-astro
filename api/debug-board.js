/**
 * GET /api/debug-board?board_id=XXXXXXXXXX
 * Temporary — returns column IDs and groups for any Monday board.
 * DELETE this file after confirming your column IDs.
 */

const MONDAY_API = 'https://api.monday.com/v2';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const boardId = req.query?.board_id;
  if (!boardId) return res.status(400).json({ error: 'Pass ?board_id=XXXXXXXXXX' });

  const token = process.env.MONDAY_API_TOKEN;
  if (!token) return res.status(500).json({ error: 'MONDAY_API_TOKEN not set' });

  const apiRes = await fetch(MONDAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({
      query: `{ boards(ids: [${boardId}]) { name columns { id title type } groups { id title } } }`,
    }),
  });

  const data = await apiRes.json();
  if (data.errors) return res.status(500).json({ errors: data.errors });

  const board = data?.data?.boards?.[0];
  if (!board) return res.status(404).json({ error: 'Board not found' });

  return res.status(200).json({
    board_name: board.name,
    columns: board.columns.map(c => ({ id: c.id, title: c.title, type: c.type })),
    groups:  board.groups.map(g => ({ id: g.id, title: g.title })),
  });
}
