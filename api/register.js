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
 *   text_mm2d4gxh  → Roll / Arbetsplats (previously Företag)
 *   text_mm2f93jv  → Matpreferenser
 *
 * Run api/debug-columns.js endpoint to get/verify all column IDs and types.
 */

import { Resend } from 'resend';
import { buildRegistrationConfirmationEmail } from './_email-template.js';
import { resendCall } from './_resend.js';

const MONDAY_API = 'https://api.monday.com/v2';
const FROM     = process.env.EMAIL_FROM || 'Music Hub West <hello@musichubwest.com>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'hello@musichubwest.se';

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


/**
 * Find a column id by its title.
 *
 * Column ids on a Monday board are generated, not chosen, so hard-coding new
 * ones means someone has to go dig them out first. Matching on the title means
 * the team can create the column and it just works. Several spellings are
 * accepted because nobody remembers the exact wording.
 */
async function findColumnId(boardId, titles, token) {
  const data = await monday(
    `{ boards(ids: [${boardId}]) { columns { id title type } } }`,
    null,
    token
  );
  const cols = data?.boards?.[0]?.columns ?? [];
  const wanted = titles.map(t => t.toLowerCase().trim());
  const match = cols.find(c => wanted.includes(c.title.toLowerCase().trim()));
  if (!match) {
    console.warn(`[register] No column titled ${titles.map(t => `"${t}"`).join(' / ')} on board ${boardId}. Available: ${cols.map(c => c.title).join(', ')}`);
  }
  return match ?? null;
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
      namn, epost, telefon, foretag, matpreferenser,
      harBolag, orgnr, source,
      eventTitle, eventSlug, eventDate, eventLocation,
      translationKey, lang,
    } = req.body;

    console.log('[register] Incoming:', { namn, epost, telefon, foretag, matpreferenser, harBolag, hasOrgnr: !!orgnr, source, eventTitle, eventSlug, eventDate, translationKey, lang });

    // ── Validation ─────────────────────────────────────────
    if (!namn?.trim() || !epost?.trim()) {
      return res.status(400).json({ error: 'Namn och e-post krävs' });
    }
    const email = epost.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Ogiltig e-postadress' });
    }

    // Where the registration came from. Sent by the form as a single readable
    // string ("meta / paid / lev-pa-din-musik / 178-foto") so the team can read
    // the board without decoding parameters. Trimmed and capped because it goes
    // into a cell, and stripped of characters that would break a CSV export.
    const trafficSource = String(source || 'direkt')
      .replace(/[\r\n\t]/g, ' ')
      .trim()
      .slice(0, 120) || 'direkt';

    // Required for the Tillväxtverket report, so a missing answer is rejected
    // rather than stored as unknown.
    const hasCompany = harBolag === 'Ja' ? 'Ja' : harBolag === 'Nej' ? 'Nej' : null;
    if (!hasCompany) {
      return res.status(400).json({ error: 'Ange om du har bolag' });
    }

    // Ten digits, hyphen optional on input, always stored as NNNNNN-NNNN.
    let orgNumber = null;
    if (hasCompany === 'Ja') {
      const digits = String(orgnr || '').replace(/\D/g, '');
      if (digits.length !== 10) {
        return res.status(400).json({ error: 'Ogiltigt organisationsnummer' });
      }
      orgNumber = `${digits.slice(0, 6)}-${digits.slice(6)}`;
    }

    // ── Confirmation email to the registrant (non-fatal) ────
    // Sent regardless of the Monday outcome below — the person signed up, so
    // they get their "your spot is booked" email even if the CRM write hiccups.
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      try {
        const mail = buildRegistrationConfirmationEmail({
          firstName:     namn.trim(),
          eventTitle,
          eventDate,
          eventLocation,
          lang,
        });
        const mailErr = await resendCall('register', new Resend(RESEND_API_KEY).emails.send({
          from: FROM,
          to: email,
          replyTo: REPLY_TO,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
        }));
        // Still non-fatal — the registration itself succeeded — but no longer
        // logged as sent when Resend rejected it.
        if (mailErr) {
          console.error(`[register] ⚠️ Confirmation email NOT sent to ${email} (${mailErr.name})`);
        } else {
          console.log(`[register] ✅ Confirmation email sent to ${email}`);
        }
      } catch (e) {
        console.error('[register] Confirmation email failed (non-fatal):', e?.message || e);
      }
    } else {
      console.warn('[register] RESEND_API_KEY missing — confirmation email skipped');
    }

    const MONDAY_API_TOKEN    = process.env.MONDAY_API_TOKEN;
    const MONDAY_BOARD_ID     = process.env.MONDAY_BOARD_ID;
    const MONDAY_COMPANY_COL  = 'text_mm2d4gxh'; // Roll / Arbetsplats column
    const MONDAY_FOOD_COL     = 'text_mm2f93jv';  // Matpreferenser column

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

    // Roll / Arbetsplats (optional)
    if (foretag?.trim()) {
      colObj[MONDAY_COMPANY_COL] = foretag.trim();
    }

    // Matpreferenser / allergier (optional)
    if (matpreferenser?.trim()) {
      colObj[MONDAY_FOOD_COL] = matpreferenser.trim();
    }

    // Company answer. Ids are looked up by title so the team can add the columns
    // without anyone hunting for generated ids; env vars pin them if wanted.
    // Whatever cannot be written to a column is posted as an update on the item
    // below, so the answer is never silently dropped.
    const unwritten = [];

    const hasCol = process.env.MONDAY_HAS_COMPANY_COL
      ? { id: process.env.MONDAY_HAS_COMPANY_COL, type: 'text' }
      : await findColumnId(MONDAY_BOARD_ID, ['Har bolag', 'Har du bolag', 'Bolag'], MONDAY_API_TOKEN);
    if (hasCol) {
      // A status column needs {"label": …}; a text column takes the string.
      colObj[hasCol.id] = hasCol.type === 'status' ? { label: hasCompany } : hasCompany;
    } else {
      unwritten.push(`Har bolag: ${hasCompany}`);
    }

    const srcCol = process.env.MONDAY_SOURCE_COL
      ? { id: process.env.MONDAY_SOURCE_COL, type: 'text' }
      : await findColumnId(MONDAY_BOARD_ID, ['Källa', 'Kalla', 'Source', 'Kampanj'], MONDAY_API_TOKEN);
    if (srcCol) {
      colObj[srcCol.id] = trafficSource;
    } else {
      unwritten.push(`Källa: ${trafficSource}`);
    }

    if (orgNumber) {
      const orgCol = process.env.MONDAY_ORGNR_COL
        ? { id: process.env.MONDAY_ORGNR_COL, type: 'text' }
        : await findColumnId(MONDAY_BOARD_ID, ['Organisationsnummer', 'Orgnr', 'Org.nr'], MONDAY_API_TOKEN);
      if (orgCol) {
        colObj[orgCol.id] = orgNumber;
      } else {
        unwritten.push(`Organisationsnummer: ${orgNumber}`);
      }
    }

    console.log('[register] Column values to send:', JSON.stringify(colObj));

    // ── Create item using GraphQL variables (avoids escaping issues) ──
    //
    // create_labels_if_missing matters more than it looks. "Har bolag" is a
    // status column, and Monday rejects a label that is not already defined on
    // it — so a column created with Monday's default labels (Klar / Arbetar på
    // det / …) refused "Ja". That rejection killed the whole mutation, and the
    // catch below then recreated the item with NO columns at all: one bad field
    // silently emptied every other one. With this flag Monday adds Ja/Nej
    // itself, so the team does not have to name the labels by hand.
    const mutation = `
      mutation CreateItem($boardId: ID!, $groupId: String!, $itemName: String!, $colVals: JSON) {
        create_item(
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName,
          column_values: $colVals,
          create_labels_if_missing: true
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
      console.warn('[register] create_item with columns failed:', colErr.message);

      // Before giving up on every column, drop only the ones Monday is fussy
      // about. A status column is the usual culprit — its value must match an
      // existing label — and losing the whole registration's data because of
      // one dropdown is a bad trade. Text columns take anything.
      const fussy = Object.keys(colObj).filter((id) => id.startsWith('color_'));
      if (fussy.length) {
        const reduced = { ...colObj };
        for (const id of fussy) {
          unwritten.push(`${id}: ${JSON.stringify(colObj[id])}`);
          delete reduced[id];
        }
        try {
          const r1 = await monday(mutation, { ...variables, colVals: JSON.stringify(reduced) }, MONDAY_API_TOKEN);
          itemId = r1?.create_item?.id;
          console.warn(`[register] ⚠️ Created item #${itemId} without ${fussy.join(', ')} — values posted as an update instead`);
        } catch (reducedErr) {
          console.warn('[register] reduced column set also failed:', reducedErr.message);
        }
      }
    }

    // Last resort: name-only, so a registration is never lost outright.
    if (!itemId) {
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

    // Anything that could not go into a column is posted as an update on the
    // item. Tillväxtverket reporting depends on the bolag answer, so it must be
    // visible somewhere in Monday even when the column is missing or fussy —
    // silently dropping it would be discovered at reporting time, too late.
    if (itemId && unwritten.length) {
      try {
        await monday(
          `mutation AddNote($itemId: ID!, $body: String!) {
             create_update(item_id: $itemId, body: $body) { id }
           }`,
          { itemId: String(itemId), body: unwritten.join('\n') },
          MONDAY_API_TOKEN
        );
        console.warn(`[register] Posted ${unwritten.length} unwritten value(s) as an update on #${itemId}`);
      } catch (noteErr) {
        console.error('[register] Could not post unwritten values:', noteErr.message, unwritten.join(' | '));
      }
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[register] Unhandled error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
