// Temporary endpoint to fetch column IDs from Monday board
// DELETE after use
export default async function handler(req, res) {
  const token = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BOARD_ID;

  const r = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({
      query: `{ boards(ids: [${boardId}]) { columns { id title type } } }`
    }),
  });

  const data = await r.json();
  return res.status(200).json(data?.data?.boards?.[0]?.columns ?? data);
}
