/**
 * POST /api/register
 * Vercel Serverless Function — Event Registration
 *
 * Receives form data → creates item in Monday.com board
 *
 * Environment variables (set in Vercel Dashboard → Settings → Environment Variables):
 *   MONDAY_API_TOKEN  — Your Monday API token (Settings → Developers → My Access Tokens)
 *   MONDAY_BOARD_ID   — Numeric ID of your registrations board (visible in the board URL)
 */

export default async function handler(req, res) {
  // ── CORS headers (allow requests from your own domain) ──
  res.setHeader('Access-Control-Allow-Origin', 'https://musichubwest.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { namn, epost, telefon, eventTitle, eventSlug, eventDate, lang } = req.body;

    // ── Validation ───────────────────────────────────────
    if (!namn?.trim() || !epost?.trim()) {
      return res.status(400).json({ error: 'Namn och e-post krävs' });
    }
    const email = epost.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Ogiltig e-postadress' });
    }

    // ── Monday.com API ───────────────────────────────────
    // TODO: When you have API token + Board ID:
    //   1. Add MONDAY_API_TOKEN and MONDAY_BOARD_ID to Vercel Environment Variables
    //   2. Uncomment the block below
    //   3. Replace column IDs (name__1, email__1, etc.) with your actual column IDs
    //      → find them in Monday: Board → Integrate → API → column IDs shown in GraphQL explorer
    //
    // const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
    // const MONDAY_BOARD_ID  = process.env.MONDAY_BOARD_ID;
    //
    // const columnValues = JSON.stringify({
    //   email__1:   { email: email, text: email },   // Email column
    //   text__1:    telefon?.trim() || '',            // Phone column
    //   text1__1:   eventTitle || '',                 // Event name column
    //   date__1:    { date: eventDate || '' },        // Event date column
    //   status__1:  { label: 'Ny' },                  // Status column
    // });
    //
    // const mutation = `
    //   mutation {
    //     create_item(
    //       board_id: ${MONDAY_BOARD_ID},
    //       item_name: "${namn.trim().replace(/"/g, '\\"')}",
    //       column_values: ${JSON.stringify(columnValues)}
    //     ) { id }
    //   }
    // `;
    //
    // const mondayRes = await fetch('https://api.monday.com/v2', {
    //   method:  'POST',
    //   headers: {
    //     'Content-Type':  'application/json',
    //     'Authorization': MONDAY_API_TOKEN,
    //     'API-Version':   '2024-01',
    //   },
    //   body: JSON.stringify({ query: mutation }),
    // });
    //
    // const mondayData = await mondayRes.json();
    // if (mondayData.errors) {
    //   console.error('[register] Monday API error:', mondayData.errors);
    //   return res.status(502).json({ error: 'Monday API error' });
    // }
    // ─────────────────────────────────────────────────────

    // Log to Vercel Function logs (visible in Vercel Dashboard → Functions tab)
    console.log('[register] New registration:', {
      namn:       namn.trim(),
      epost:      email,
      telefon:    telefon?.trim() || '—',
      eventTitle: eventTitle || '—',
      eventSlug:  eventSlug  || '—',
      eventDate:  eventDate  || '—',
      lang:       lang       || '—',
      timestamp:  new Date().toISOString(),
    });

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[register] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
