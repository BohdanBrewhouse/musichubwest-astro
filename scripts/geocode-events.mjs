#!/usr/bin/env node
/**
 * Geocode event addresses → src/data/geocache.json
 *
 * Runs as a prebuild step. Reads every event MD under src/content/events,
 * pulls the address (or map_query / location fallback), and asks OpenStreetMap
 * Nominatim for lat/lng. Results are cached in src/data/geocache.json so
 * subsequent builds are instant — only new addresses hit the API.
 *
 * Nominatim usage policy: max 1 req/sec + a real User-Agent. We throttle to
 * 1.1s between live calls. If an address fails to geocode, we just skip it
 * (the event won't show on the map but the build still succeeds).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.resolve(__dirname, '..');
const EVENTS_DIR = path.join(ROOT, 'src/content/events');
const CACHE_FILE = path.join(ROOT, 'src/data/geocache.json');
const USER_AGENT = 'musichubwest.com geocoder (hello@musichubwest.com)';
const THROTTLE_MS = 1100;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function parseFrontmatter(md) {
  const match = md.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const out = {};
  for (const raw of match[1].split('\n')) {
    const m = raw.match(/^([a-z_]+):\s*(.*)$/i);
    if (!m) continue;
    let val = m[2].trim();
    // Strip surrounding quotes if present
    if ((val.startsWith("'") && val.endsWith("'")) ||
        (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1);
    }
    out[m[1]] = val;
  }
  return out;
}

/**
 * Read events from Sanity instead of the disk.
 *
 * This is the one part of the migration that fails without an error: with the
 * content in Sanity there are no markdown files, readAllEvents() would find
 * nothing, the old cache would still be there, the build would stay green — and
 * every new event would simply have no pin on the map. So a zero result is a
 * hard failure here, not an empty list.
 */
async function readAllEventsFromSanity() {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET || 'production';
  const token = process.env.SANITY_TOKEN;
  if (!projectId || !token) {
    throw new Error('CONTENT_SOURCE=sanity but SANITY_PROJECT_ID / SANITY_TOKEN are not set');
  }
  // Only the three fields pickQuery() looks at. Address and location are
  // localised; map_query is shared.
  const groq = encodeURIComponent(
    '*[_type == "event"]{ "sv": {"address": address.sv, "location": location.sv, "map_query": map_query}, "en": {"address": address.en, "location": location.en, "map_query": map_query} }'
  );
  const url = `https://${projectId}.api.sanity.io/v2024-10-01/data/query/${dataset}?query=${groq}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status} ${await res.text().catch(() => '')}`);
  const { result } = await res.json();
  if (!Array.isArray(result) || result.length === 0) {
    throw new Error('Sanity returned 0 events. A private dataset answers an unauthenticated read with an empty set, so this is almost certainly the token.');
  }
  const events = [];
  for (const d of result) {
    for (const lang of ['sv', 'en']) {
      const e = d[lang] || {};
      events.push({ lang, file: `${lang}/sanity`, address: e.address ?? undefined, location: e.location ?? undefined, map_query: e.map_query ?? undefined });
    }
  }
  return events;
}

async function readAllEventsFromDisk() {
  const events = [];
  for (const lang of ['sv', 'en']) {
    const dir = path.join(EVENTS_DIR, lang);
    let files;
    try { files = await fs.readdir(dir); } catch { continue; }
    for (const f of files) {
      if (!f.endsWith('.md')) continue;
      const md = await fs.readFile(path.join(dir, f), 'utf8');
      const fm = parseFrontmatter(md);
      events.push({ lang, file: f, ...fm });
    }
  }
  return events;
}

async function loadCache() {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2) + '\n');
}

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'sv,en' } });
  if (!res.ok) {
    console.warn(`  ↳ HTTP ${res.status} for "${query}"`);
    return null;
  }
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    display_name: data[0].display_name,
  };
}

function pickQuery(ev) {
  // Priority: address (most precise) → map_query (curated) → location + Sweden
  if (ev.address)   return ev.address;
  if (ev.map_query) return ev.map_query;
  if (ev.location)  return `${ev.location}, Sweden`;
  return null;
}

async function main() {
  const useSanity = process.env.CONTENT_SOURCE === 'sanity';
  console.log(`📍 Source: ${useSanity ? 'Sanity' : 'markdown on disk'}`);
  const events = useSanity ? await readAllEventsFromSanity() : await readAllEventsFromDisk();
  const cache  = await loadCache();
  const queries = new Set();

  for (const ev of events) {
    const q = pickQuery(ev);
    if (q) queries.add(q);
  }

  const todo = [...queries].filter(q => !cache[q]);
  console.log(`📍 Geocoding: ${queries.size} unique queries, ${todo.length} new, ${queries.size - todo.length} cached`);

  for (let i = 0; i < todo.length; i++) {
    const q = todo[i];
    process.stdout.write(`  [${i + 1}/${todo.length}] ${q.slice(0, 60)}… `);
    try {
      const hit = await geocode(q);
      if (hit) {
        cache[q] = { lat: hit.lat, lng: hit.lng, source: 'nominatim' };
        console.log(`→ ${hit.lat.toFixed(4)}, ${hit.lng.toFixed(4)} ✓`);
      } else {
        cache[q] = { lat: null, lng: null, source: 'nominatim', failed: true };
        console.log('→ not found ✗');
      }
    } catch (err) {
      console.log(`→ error: ${err.message}`);
    }
    if (i < todo.length - 1) await sleep(THROTTLE_MS);
  }

  await saveCache(cache);
  const hits = Object.values(cache).filter(v => v.lat !== null).length;
  console.log(`✅ Cache saved. ${hits} addresses with coordinates, ${Object.keys(cache).length - hits} failed.`);
}

main().catch(err => {
  console.error('Geocoding failed:', err);
  // Don't fail the build — map just won't have new pins until next run.
  process.exit(0);
});
