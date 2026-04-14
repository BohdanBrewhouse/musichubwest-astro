/**
 * POST /api/contact
 * Vercel Serverless Function — Contact Form → Monday.com "Kontakt" board (ID: 5094610879)
 *
 * Required environment variables (Vercel → Settings → Environment Variables):
 *   MONDAY_API_TOKEN          — same token as register.js
 *   MONDAY_CONTACT_BOARD_ID   — 5094610879
 *
 * Board groups:
 *   topics           → "Om"           (messages from /om)
 *   group_mm2d6why   → "tune-in-west" (messages from /tune-in-west)
 *
 * Responsible Person column is left empty — team assigns manually in Monday.
 */
const COLUMN_IDS = {
  email: 'text_mm2dg4hr',   // Email
  org:   'text_mm2dzkka',   // Organisation
  msg:   'text_mm2d2mrp',   // Meddelande
};

const MONDAY_API = 'https://api.monday.com/v2';

async function monday(query, variables, token) {
  const res = await fetch(MONDAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'API-Version': '2024-01',
    },
    body: JSON.stringify(variables ? { query, variables } : { query }),
  });
  const data = await res.json();
  if (data.errors) {
    console.error('[contact] GraphQL errors:', JSON.stringify(data.errors));
    throw new Error(JSON.stringify(data.errors));
  }
  return data.data;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { namn, email, org, meddelande, sida } = req.body;

    console.log('[contact] Incoming:', { namn, email, org, meddelande: meddelande?.slice(0, 60), sida });

    // ── Validation ─────────────────────────────────────────
    if (!namn?.trim() || !email?.trim() || !meddelande?.trim()) {
      return res.status(400).json({ error: 'Namn, e-post och meddelande krävs' });
    }
    const emailVal = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      return res.status(400).json({ error: 'Ogiltig e-postadress' });
    }

    const MONDAY_API_TOKEN      = process.env.MONDAY_API_TOKEN;
    const MONDAY_CONTACT_BOARD  = process.env.MONDAY_CONTACT_BOARD_ID;

    if (!MONDAY_API_TOKEN || !MONDAY_CONTACT_BOARD) {
      console.warn('[contact] Monday env vars missing — logging only');
      console.log('[contact]', { namn: namn.trim(), emailVal, org, meddelande, sida });
      return res.status(200).json({ ok: true });
    }

    // ── Find group by sida (page name) ─────────────────────
    // Monday board should have 2 groups named exactly: "om" and "tune-in-west"
    const boardData = await monday(
      `{ boards(ids: [${MONDAY_CONTACT_BOARD}]) { groups { id title } } }`,
      null,
      MONDAY_API_TOKEN
    );
    const groups = boardData?.boards?.[0]?.groups ?? [];
    console.log('[contact] Groups:', groups.map(g => `"${g.title}"`).join(', '));

    const sidaKey = (sida || '').trim().toLowerCase();
    const matched = groups.find(g => g.title.toLowerCase().trim() === sidaKey);
    // Fallback to first group if no match (safety net)
    const groupId = matched?.id ?? groups[0]?.id;

    if (!groupId) {
      console.warn('[contact] No groups found in contact board — logging only');
      return res.status(200).json({ ok: true });
    }
    console.log(`[contact] Using group "${matched?.title ?? groups[0]?.title}" (id: ${groupId}) for sida="${sida}"`);

    // ── Build column values ─────────────────────────────────
    const colObj = {
      [COLUMN_IDS.email]: emailVal,
    };
    if (org?.trim())        colObj[COLUMN_IDS.org] = org.trim();
    if (meddelande?.trim()) colObj[COLUMN_IDS.msg] = meddelande.trim();

    console.log('[contact] Sending column values:', JSON.stringify(colObj));

    // ── Create item ─────────────────────────────────────────
    const mutation = `
      mutation CreateContact($boardId: ID!, $groupId: String!, $itemName: String!, $colVals: JSON) {
        create_item(
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName,
          column_values: $colVals
        ) { id }
      }
    `;
    const variables = {
      boardId:  String(MONDAY_CONTACT_BOARD),
      groupId,
      itemName: namn.trim(),
      colVals:  JSON.stringify(colObj),
    };

    const r = await monday(mutation, variables, MONDAY_API_TOKEN);
    const itemId = r?.create_item?.id;
    console.log(`[contact] ✅ Created item #${itemId} from ${emailVal} (${sida})`);

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[contact] Unhandled error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
