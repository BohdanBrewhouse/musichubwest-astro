/**
 * /api/checkin — door check-in for Music Hub West events (staff only, used by /incheckning).
 *
 * The registration board has one group per event (group title = event slug).
 *   GET  ?events=1        → the event groups with counts and the event date
 *   GET  ?group=<groupId> → the people in that group with their check-in state
 *   POST { ids:[…], state:'in'|'no'|'none' }        → sets the "Incheckning" column
 *   POST { walkin:{ group, name, email } }           → adds a walk-in to the group, checked in
 *
 * The "Incheckning" status column is found by title and created on first use.
 * Labels: "Incheckad", "Uteblev", empty = not marked.
 * Auth: X-Key header, same key / PIN as the Music Tech Summit door app.
 */
import { createHash } from 'node:crypto';

const API = 'https://api.monday.com/v2';
const PIN_SHA256 = 'a5c201d132eec3c919ca8a1740e96cde76374dd3b0f5ba8c43ac4fa0eae432e7';
const KEY_SHA256 = '74d66cfb90b3ea5d5e31c159312bfed855cd6e1a7f4f4d27ad1236fc80800031';
const CHECK_TITLES = /^(incheckning|incheckad|närvaro|narvaro)$/i;
const COL = { email: 'text_mm2d5e9w', company: 'text_mm2d4gxh', food: 'text_mm2f93jv', event: 'text_mm2dg526', date: 'date_mm2dme63' };
const IN = 'Incheckad', NO = 'Uteblev';

async function monday(query, variables) {
  const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: process.env.MONDAY_API_TOKEN, 'API-Version': '2024-01' }, body: JSON.stringify({ query, variables }) });
  const d = await r.json();
  if (d.errors || d.error_message) throw new Error(JSON.stringify(d.errors || d.error_message));
  return d.data;
}

let meta = null; // { check, source }
async function columns(boardId) {
  if (meta) return meta;
  const d = await monday(`{ boards(ids:[${boardId}]) { columns { id title } } }`);
  const list = d.boards[0].columns;
  let check = list.find((c) => CHECK_TITLES.test(c.title.trim()))?.id;
  if (!check) {
    const c = await monday(`mutation($b:ID!){ create_column(board_id:$b, title:"Incheckning", column_type: status) { id } }`, { b: String(boardId) });
    check = c.create_column.id;
  }
  const source = list.find((c) => /^(källa|kalla|source|kampanj)$/i.test(c.title.trim()))?.id;
  return (meta = { check, source });
}

const state = (t) => (/^incheckad$/i.test(t) ? 'in' : /^uteblev$/i.test(t) ? 'no' : 'none');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const hk = createHash('sha256').update(String(req.headers['x-key'] || '')).digest('hex');
  if (hk !== KEY_SHA256 && hk !== PIN_SHA256) return res.status(401).json({ error: 'bad_key' });
  const boardId = process.env.MONDAY_BOARD_ID;
  if (!process.env.MONDAY_API_TOKEN || !boardId) return res.status(503).json({ error: 'not_configured' });

  try {
    const c = await columns(boardId);

    if (req.method === 'GET' && req.query.events) {
      const d = await monday(`{ boards(ids:[${boardId}]) { groups { id title archived deleted items_page(limit:1){ items { column_values(ids:["${COL.date}","${COL.event}"]) { id text } } } } } }`);
      const groups = d.boards[0].groups.filter((g) => !g.archived && !g.deleted);
      // Counts: one light query per group would be slow; read item counts in one go.
      const counts = await monday(`{ boards(ids:[${boardId}]) { groups { id items_page(limit:500){ items { id } } } } }`);
      const n = Object.fromEntries(counts.boards[0].groups.map((g) => [g.id, g.items_page.items.length]));
      const events = groups.map((g) => {
        const v = Object.fromEntries((g.items_page.items[0]?.column_values || []).map((x) => [x.id, x.text || '']));
        return { id: g.id, slug: g.title, title: v[COL.event] || g.title, date: v[COL.date] || '', count: n[g.id] || 0 };
      }).filter((e) => e.count > 0);
      events.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      return res.status(200).json({ events });
    }

    if (req.method === 'GET' && req.query.group) {
      const g = String(req.query.group);
      const people = []; let cursor = null;
      const sel = `cursor items { id name column_values(ids:["${COL.email}","${COL.company}","${COL.food}","${c.check}"${c.source ? `,"${c.source}"` : ''}]) { id text } }`;
      do {
        const d = cursor
          ? await monday(`query($c:String!){ next_items_page(cursor:$c, limit:500){ ${sel} } }`, { c: cursor })
          : await monday(`query($b:[ID!],$g:[String]){ boards(ids:$b){ groups(ids:$g){ items_page(limit:500){ ${sel} } } } }`, { b: [String(boardId)], g: [g] });
        const page = cursor ? d.next_items_page : d.boards[0].groups[0]?.items_page;
        if (!page) break;
        for (const it of page.items) {
          const v = Object.fromEntries(it.column_values.map((x) => [x.id, x.text || '']));
          people.push({ id: it.id, name: it.name, email: v[COL.email] || '', company: v[COL.company] || '', food: v[COL.food] || '', source: c.source ? v[c.source] || '' : '', state: state(v[c.check]) });
        }
        cursor = page.cursor;
      } while (cursor);
      return res.status(200).json({ people });
    }

    if (req.method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

      if (b.walkin) {
        const { group, name, email } = b.walkin;
        if (!group || !String(name || '').trim() || !/^\S+@\S+\.\S+$/.test(String(email || ''))) return res.status(400).json({ error: 'bad_input' });
        const vals = { [COL.email]: String(email).trim(), [c.check]: { label: IN } };
        if (c.source) vals[c.source] = 'På plats';
        // Copy event title and date from someone already in the group.
        const s = await monday(`query($b:[ID!],$g:[String]){ boards(ids:$b){ groups(ids:$g){ items_page(limit:1){ items { column_values(ids:["${COL.event}","${COL.date}"]) { id text } } } } } }`, { b: [String(boardId)], g: [String(group)] });
        const first = s.boards[0].groups[0]?.items_page.items[0];
        if (first) for (const x of first.column_values) if (x.text) vals[x.id] = x.id === COL.date ? { date: x.text } : x.text;
        const r = await monday(`mutation($b:ID!,$g:String!,$n:String!,$v:JSON){ create_item(board_id:$b, group_id:$g, item_name:$n, column_values:$v, create_labels_if_missing:true){ id } }`,
          { b: String(boardId), g: String(group), n: String(name).trim(), v: JSON.stringify(vals) });
        return res.status(200).json({ ok: true, id: r.create_item.id });
      }

      const ids = (Array.isArray(b.ids) ? b.ids : [b.id]).map((x) => String(x || '').replace(/\D/g, '')).filter(Boolean).slice(0, 300);
      const want = ['in', 'no', 'none'].includes(b.state) ? b.state : 'in';
      if (!ids.length) return res.status(400).json({ error: 'bad_input' });
      for (const id of ids) {
        if (want === 'none') await monday(`mutation($b:ID!,$i:ID!,$c:String!){ change_column_value(board_id:$b, item_id:$i, column_id:$c, value:"{}"){ id } }`, { b: String(boardId), i: id, c: c.check });
        else await monday(`mutation($b:ID!,$i:ID!,$c:String!,$v:String){ change_simple_column_value(board_id:$b, item_id:$i, column_id:$c, value:$v, create_labels_if_missing:true){ id } }`, { b: String(boardId), i: id, c: c.check, v: want === 'in' ? IN : NO });
      }
      return res.status(200).json({ results: ids.map((id) => ({ id, state: want })) });
    }

    return res.status(405).json({ error: 'method' });
  } catch (e) {
    console.error('[mhw-checkin]', e?.message);
    meta = null;
    return res.status(500).json({ error: 'server' });
  }
}
