/**
 * POST /api/register
 * Vercel Serverless Function — Event Registration → Monday.com
 *
 * Environment variables (Vercel Dashboard → Settings → Environment Variables):
 *   MONDAY_API_TOKEN  — Monday API token (Avatar → Developers → My Access Tokens)
 *   MONDAY_BOARD_ID   — Numeric board ID from the URL: monday.com/boards/XXXXXXXXXX
 *
 * Monday board column IDs (update after creating your board):
 *   email__1    → Email column
 *   text__1     → Telefon column
 *   text1__1    → Event column
 *   date__1     → Datum column
 *   status__1   → Status column
 *
 * How to find column IDs:
 *   Monday board → Integrate → API → open GraphQL explorer →
 *   run: { boards(ids: [YOUR_BOARD_ID]) { columns { id title } } }
 */

const MONDAY_API = 'https://api.monday.com/v2';

// ── Helper: call Monday GraphQL ──────────────────────────────
async function monday(query, token) {
  const res = await fetch(MONDAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  if (data.errors) throw new Error(JSON.stringify(data.errors));
  return data.data;
}

// ── Helper: find group ID by name ────────────────────────────
async function findGroupId(boardId, groupName, token) {
  const data = await monday(
    `{ boards(ids: [${boardId}]) { groups { id title } } }`,
    token
  );
  const groups = data?.boards?.[0]?.groups ?? [];
  const match = groups.find(
    g => g.title.toLowerCase().trim() === groupName.toLowerCase().trim()
  );
  return match?.id ?? null;
}

// ── Main handler ─────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://musichubwest.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      namn, epost, telefon,
      eventTitle, eventSlug, eventDate,
      translationKey, lang,
    } = req.body;

    // ── Validation ─────────────────────────────────────────
    if (!namn?.trim() || !epost?.trim()) {
      return res.status(400).json({ error: 'Namn och e-post krävs' });
    }
    const email = epost.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Ogiltig e-postadress' });
    }

    const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
    const MONDAY_BOARD_ID  = process.env.MONDAY_BOARD_ID;

    if (!MONDAY_API_TOKEN || !MONDAY_BOARD_ID) {
      // Env vars not set yet — log and return OK so form still works
      console.warn('[register] Monday env vars missing — logging only');
      console.log('[register]', { namn: namn.trim(), email, telefon, eventTitle, translationKey, lang });
      return res.status(200).json({ ok: true });
    }

    // ── Find Monday group ───────────────────────────────────
    // Group name = translationKey (same for SV and EN versions of the event)
    const groupKey = (translationKey || eventSlug || eventTitle || '').trim();
    const groupId  = await findGroupId(MONDAY_BOARD_ID, groupKey, MONDAY_API_TOKEN);

    if (!groupId) {
      // Group doesn't exist yet — log warning but don't fail the user
      console.warn(`[register] No Monday group found for "${groupKey}". Create a group with this exact name.`);
      console.log('[register] Registration data:', { namn: namn.trim(), email, telefon, eventTitle, translationKey });
      return res.status(200).json({ ok: true });
    }

    // ── Column values ───────────────────────────────────────
    const colObj = {
      text_mm2d5e9w: email,
      text_mm2d9f29: telefon?.trim() || '',
      text_mm2dg526: eventTitle || '',
    };
    if (eventDate) colObj.date_mm2dme63 = { date: eventDate };
    const colVals = JSON.stringify(colObj);

    const safeName = namn.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    // ── Try create_item with columns in one shot ────────────
    let itemId = null;
    try {
      const r = await monday(`
        mutation {
          create_item(
            board_id: ${MONDAY_BOARD_ID},
            group_id: "${groupId}",
            item_name: "${safeName}",
            column_values: ${JSON.stringify(colVals)}
          ) { id }
        }
      `, MONDAY_API_TOKEN);
      itemId = r?.create_item?.id;
      console.log(`[register] ✅ Created item #${itemId} with columns for ${email}`);
    } catch (fullErr) {
      // Columns rejected — fall back to name-only
      console.warn('[register] create_item with columns failed:', fullErr.message);
      try {
        const r2 = await monday(`
          mutation {
            create_item(
              board_id: ${MONDAY_BOARD_ID},
              group_id: "${groupId}",
              item_name: "${safeName}"
            ) { id }
          }
        `, MONDAY_API_TOKEN);
        itemId = r2?.create_item?.id;
        console.warn(`[register] ⚠️ Created item #${itemId} WITHOUT columns for ${email}`);
      } catch (nameErr) {
        console.error('[register] create_item name-only also failed:', nameErr.message);
        throw nameErr;
      }
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[register] Error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
