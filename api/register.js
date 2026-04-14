/**
 * POST /api/register
 * Vercel Serverless Function — Event Registration → Monday.com
 *
 * Required environment variables (Vercel → Settings → Environment Variables):
 *   MONDAY_API_TOKEN      — Monday API token
 *   MONDAY_BOARD_ID       — Numeric board ID (from URL: monday.com/boards/XXXXXXXXXX)
 *
 * Column IDs for board 5094578299 (update if board changes):
 *   text_mm2d5e9w  → Email
 *   text_mm2d9f29  → Telefon
 *   text_mm2dg526  → Event
 *   date_mm2dme63  → Datum
 *
 * Optional — add after creating the column in Monday and getting its ID:
 *   MONDAY_COMPANY_COL_ID — column ID for Företag/Company (e.g. text_xxxx)
 *
 * Run api/debug-columns.js endpoint to get/verify all column IDs and types.
 */

const MONDAY_API = 'https://api.monday.com/v2';

// ── Helper: call Monday GraphQL with optional variables ──────
async function monday(query, variables, token) {
  const body = variables
    ? JSON.stringify({ query, variables })
    : JSON.stringify({ query });

  const res = await fetch(MONDAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'API-Version': '2024-01',
    },
    body,
  });

  const data = await res.json();

  if (data.errors) {
    const msg = JSON.stringify(data.errors);
    console.error('[monday] GraphQL errors:', msg);
    throw new Error(msg);
  }
  return data.data;
}

// ── Helper: find group ID by name (case-insensitive) ─────────
async function findGroupId(boardId, groupName, token) {
  const data = await monday(
    `{ boards(ids: [${boardId}]) { groups { id title } } }`,
    null,
    token
  );
  const groups = data?.boards?.[0]?.groups ?? [];
  console.log('[register] Available groups:', groups.map(g => `"${g.title}"`).join(', '));
  const match = groups.find(
    g => g.title.toLowerCase().trim() === groupName.toLowerCase().trim()
  );
  return match?.id ?? null;
}

// ── Main handler ─────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      namn, epost, telefon, foretag,
      eventTitle, eventSlug, eventDate,
      translationKey, lang,
    } = req.body;

    console.log('[register] Incoming:', { namn, epost, telefon, foretag, eventTitle, eventSlug, eventDate, translationKey, lang });

    // ── Validation ─────────────────────────────────────────
    if (!namn?.trim() || !epost?.trim()) {
      return res.status(400).json({ error: 'Namn och e-post krävs' });
    }
    const email = epost.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Ogiltig e-postadress' });
    }

    const MONDAY_API_TOKEN    = process.env.MONDAY_API_TOKEN;
    const MONDAY_BOARD_ID     = process.env.MONDAY_BOARD_ID;
    const MONDAY_COMPANY_COL  = 'text_mm2d4gxh'; // Företag column (confirmed via debug-columns)

    if (!MONDAY_API_TOKEN || !MONDAY_BOARD_ID) {
      console.warn('[register] Monday env vars missing — logging only');
      console.log('[register]', { namn: namn.trim(), email, telefon, foretag, eventTitle, translationKey, lang });
      return res.status(200).json({ ok: true });
    }

    // ── Find Monday group ───────────────────────────────────
    const groupKey = (translationKey || eventSlug || eventTitle || '').trim();
    console.log('[register] Looking for group:', groupKey);
    const groupId  = await findGroupId(MONDAY_BOARD_ID, groupKey, MONDAY_API_TOKEN);

    if (!groupId) {
      console.warn(`[register] No Monday group found for "${groupKey}". Available groups logged above.`);
      return res.status(200).json({ ok: true });
    }
    console.log('[register] Found group:', groupId);

    // ── Build column values ─────────────────────────────────
    // Only include columns that have a value to avoid validation errors
    const colObj = {};

    // Email column (text type — just the string)
    colObj['text_mm2d5e9w'] = email;

    // Phone (text, optional)
    if (telefon?.trim()) colObj['text_mm2d9f29'] = telefon.trim();

    // Event name (text)
    if (eventTitle) colObj['text_mm2dg526'] = eventTitle;

    // Date — Monday date column expects {"date": "YYYY-MM-DD"}
    if (eventDate && /^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      colObj['date_mm2dme63'] = { date: eventDate };
    }

    // Company / Organisation (optional)
    if (foretag?.trim()) {
      colObj[MONDAY_COMPANY_COL] = foretag.trim();
    }

    console.log('[register] Column values to send:', JSON.stringify(colObj));

    // ── Create item using GraphQL variables (avoids escaping issues) ──
    const mutation = `
      mutation CreateItem($boardId: ID!, $groupId: String!, $itemName: String!, $colVals: JSON) {
        create_item(
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName,
          column_values: $colVals
        ) { id }
      }
    `;

    const variables = {
      boardId:   String(MONDAY_BOARD_ID),
      groupId,
      itemName:  namn.trim(),
      colVals:   JSON.stringify(colObj),
    };

    let itemId = null;
    try {
      const r = await monday(mutation, variables, MONDAY_API_TOKEN);
      itemId = r?.create_item?.id;
      console.log(`[register] ✅ Created item #${itemId} with columns for ${email}`);
    } catch (colErr) {
      // Column values rejected — fall back to name-only so registration isn't lost
      console.warn('[register] create_item with columns failed, trying name-only. Error:', colErr.message);
      const fallbackVars = {
        boardId:  String(MONDAY_BOARD_ID),
        groupId,
        itemName: namn.trim(),
      };
      const fallbackMutation = `
        mutation CreateItem($boardId: ID!, $groupId: String!, $itemName: String!) {
          create_item(board_id: $boardId, group_id: $groupId, item_name: $itemName) { id }
        }
      `;
      const r2 = await monday(fallbackMutation, fallbackVars, MONDAY_API_TOKEN);
      itemId = r2?.create_item?.id;
      console.warn(`[register] ⚠️ Created item #${itemId} NAME-ONLY for ${email} — fix column IDs`);
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[register] Unhandled error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
