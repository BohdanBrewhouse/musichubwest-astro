/**
 * Astro Content Layer loaders that read events and articles from Sanity.
 *
 * The contract these have to honour is the existing site, not Sanity's shape:
 *
 *  1. **Entry ids are `sv/<slug>` and `en/<slug>`.** Every page filters on that
 *     prefix (`e.id.startsWith('sv/')`) and derives the URL from it
 *     (`ev.id.replace('sv/', '')`). Getting this wrong changes 32 live URLs.
 *  2. **One Sanity document becomes two entries**, because the site's zod
 *     schemas describe a single-language event. Localised fields are flattened
 *     per language here, so no page needs to learn about `title.sv`.
 *  3. **Images arrive as URL strings**, matching `image: z.string()`.
 *  4. **`render()` keeps working**: the loader converts Portable Text to HTML
 *     and stores it as `rendered.html`, so `<Content />` on the four detail
 *     pages is untouched.
 *
 * Nothing here runs unless CONTENT_SOURCE=sanity — see src/content.config.ts.
 */
import type { Loader } from 'astro/loaders';
import { createClient } from '@sanity/client';
import { toHTML } from '@portabletext/to-html';

const LANGS = ['sv', 'en'] as const;
type Lang = (typeof LANGS)[number];

function client() {
  const projectId = import.meta.env.SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
  const dataset = import.meta.env.SANITY_DATASET || process.env.SANITY_DATASET || 'production';
  if (!projectId) throw new Error('SANITY_PROJECT_ID is not set — cannot read content from Sanity');
  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-10-01',
    // A build must never serve stale content from the CDN edge: the whole point
    // of the deploy webhook is that a publish is on the site minutes later.
    useCdn: false,
    /* A read token is required, not optional. The dataset is private — and it
       has to be, because eventSubmission documents in it hold people's names,
       emails and phone numbers. Sanity answers an unauthenticated read of a
       private dataset with an empty result rather than a 401, so without this
       check the build would succeed and publish a site with no events at all. */
    token: token(),
  });
}

function token() {
  const t = import.meta.env.SANITY_TOKEN || process.env.SANITY_TOKEN;
  if (!t) {
    throw new Error(
      'SANITY_TOKEN is not set. The dataset is private, and Sanity returns an ' +
      'empty result set for unauthenticated reads instead of an error — so ' +
      'building without a token would quietly produce a site with no content.'
    );
  }
  return t;
}

/**
 * Drop null and undefined keys.
 *
 * GROQ answers a missing attribute with `null`, and zod's `.optional()` accepts
 * `undefined` but rejects `null` — so without this every event with an empty
 * `spots_left` or `organizer_email` fails validation. The error reads
 * "expected string, received object", because `typeof null === 'object'`.
 */
const clean = <T extends Record<string, unknown>>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined)) as T;

/** Pick one language out of a localised object, falling back to the other. */
const pick = <T,>(obj: Record<string, T> | null | undefined, lang: Lang): T | undefined =>
  obj?.[lang] ?? obj?.[lang === 'sv' ? 'en' : 'sv'];

/**
 * Astro's markdown pipeline applies smart typography, so today's pages render
 * "industry’s" with a typographic apostrophe. Portable Text stores the literal
 * character the author typed, so without this the same sentence would come back
 * as "industry's". Only apostrophes between two letters are touched —
 * possessives and contractions — which leaves quotes, measurements and anything
 * else alone.
 */
/**
 * Astro's markdown pipeline applies smart typography, so today's pages render
 * "industry’s" and “quoted” with typographic marks. Portable Text stores the
 * literal characters the author typed, so without this the same sentences come
 * back with straight quotes — a visible change on 11 of the 32 pages.
 *
 * Only two rules, both matched against what the markdown build actually
 * produced: an apostrophe between two letters becomes ’, and a pair of straight
 * double quotes becomes “ ”. Dashes are left alone, because no body relies on
 * them and guessing en/em dashes is how smart typography goes wrong.
 */
function smart(t: string): string {
  return t
    .replace(/(\p{L})'(\p{L})/gu, '$1\u2019$2')
    .replace(/"([^"]*)"/g, '\u201C$1\u201D');
}

/** Apply smart typography to every text span, leaving the block structure be. */
const typographed = (blocks: any[]) =>
  blocks.map((b) =>
    b?.children
      ? { ...b, children: b.children.map((c: any) => (typeof c?.text === 'string' ? { ...c, text: smart(c.text) } : c)) }
      : b
  );

const html = (blocks: unknown) =>
  Array.isArray(blocks) && blocks.length
    ? toHTML(typographed(blocks as any[]), {
        components: {
          block: {
            // Astro's markdown pipeline wraps blockquote content in <p>; match
            // it so `.event-content blockquote` keeps rendering the same lime
            // line it does today.
            blockquote: ({ children }) => `<blockquote><p>${children}</p></blockquote>`,
          },
          marks: {
            link: ({ children, value }) => {
              const href = String(value?.href ?? '');
              const external = /^https?:\/\//i.test(href) && !href.includes('musichubwest.com');
              return external
                ? `<a href="${href}" target="_blank" rel="noopener">${children}</a>`
                : `<a href="${href}">${children}</a>`;
            },
          },
        },
      })
    : '';

/**
 * Plain text of a Portable Text body, blocks separated by blank lines.
 *
 * The glob loader puts the raw markdown on `entry.body`, and six pages plus
 * api/site-events.json.ts read it — `.slice(0, 120)` for card descriptions and
 * `.split('\n')` for the JSON feed. So the loader has to provide it too.
 * Plain text rather than markdown, which also stops `**bold**` markers from
 * showing up inside excerpts the way they do today.
 */
const plain = (blocks: unknown): string =>
  Array.isArray(blocks)
    ? blocks
        .map((b: any) => (b?.children || []).map((c: any) => c?.text ?? '').join(''))
        .filter(Boolean)
        .join('\n\n')
    : '';

/* Drafts must never reach the site. The client reads with a token and no
   perspective, which is the raw one — so an unpublished document comes back
   from a bare `*[_type == "event"]` exactly like a published one, and the
   team's work-in-progress would go live the moment the next deploy ran. */
const EVENT_QUERY = `*[_type == "event" && !(_id in path("drafts.**"))]{
  _id, _updatedAt, tinaKey, slug, title, seo_description, date, time, location, address,
  map_query, category, event_type, format, event_language, spots_left, spots_total, cost, duration,
  deadline, organizer, organizer_email, registration_open, external_registration_url,
  serve_food, cta_label, sessions_title, sessions, body,
  "imageUrl":     { "sv": image.sv.asset->url, "en": image.en.asset->url },
  "cardImageUrl": { "sv": card_image.sv.asset->url, "en": card_image.en.asset->url }
}`;

const ARTICLE_QUERY = `*[_type == "article" && !(_id in path("drafts.**"))]{
  _id, _updatedAt, tinaKey, slug, title, author, date, category, featured, body,
  "imageUrl": { "sv": image.sv.asset->url, "en": image.en.asset->url }
}`;

export function sanityEvents(): Loader {
  return {
    name: 'sanity-events',
    load: async ({ store, logger, parseData, generateDigest }) => {
      const docs = await client().fetch<any[]>(EVENT_QUERY);
      // Zero documents is never a legitimate state for this site, and it is
      // what a permissions problem looks like from here.
      if (!docs.length) throw new Error('[sanity-events] Sanity returned 0 events — check the token and dataset');
      store.clear();
      let count = 0;
      const missing: string[] = [];

      for (const d of docs) {
        for (const lang of LANGS) {
          const slug = d.slug?.[lang];
          if (!slug) { missing.push(`${d._id} has no ${lang} slug`); continue; }

          const image = pick<string>(d.imageUrl, lang);
          if (!image) { missing.push(`${d._id} [${lang}] has no image`); continue; }

          const raw = {
            title: pick<string>(d.title, lang),
            seo_description: pick<string>(d.seo_description, lang),
            date: d.date,
            time: pick<string>(d.time, lang),
            location: pick<string>(d.location, lang),
            address: pick<string>(d.address, lang),
            map_query: d.map_query,
            category: pick<string>(d.category, lang),
            event_type: d.event_type ?? 'Event',
            format: d.format ?? undefined,
            event_language: pick<string>(d.event_language, lang),
            image,
            card_image: pick<string>(d.cardImageUrl, lang),
            spots_left: d.spots_left,
            spots_total: d.spots_total,
            cost: pick<string>(d.cost, lang),
            duration: pick<string>(d.duration, lang),
            deadline: pick<string>(d.deadline, lang),
            organizer: pick<string>(d.organizer, lang),
            organizer_email: d.organizer_email,
            // translationKey is what pairs the two languages on the site. It is
            // the Tina key, kept so /en switching keeps working unchanged.
            translationKey: d.tinaKey || pick<string>(d.slug, "sv") || d._id,
            registration_open: d.registration_open ?? false,
            external_registration_url: pick<string>(d.external_registration_url, lang),
            serve_food: d.serve_food ?? false,
            cta_label: pick<string>(d.cta_label, lang),
            sessions_title: pick<string>(d.sessions_title, lang),
            sessions: pick<any[]>(d.sessions, lang),
          };

          const id = `${lang}/${slug}`;
          const data = await parseData({ id, data: clean(raw) });
          store.set({
            id,
            data,
            digest: generateDigest({ ...raw, _updatedAt: d._updatedAt }),
            body: plain(pick(d.body, lang)),
            rendered: { html: html(pick(d.body, lang)) },
          });
          count++;
        }
      }

      // Loud, because a quietly halved event list is exactly the failure this
      // migration has to avoid.
      for (const m of missing) logger.error(`[sanity-events] skipped: ${m}`);
      if (missing.length) throw new Error(`[sanity-events] ${missing.length} entr(ies) could not be built — refusing to build a partial site`);
      logger.info(`Loaded ${count} event entries from ${docs.length} documents`);
    },
  };
}

export function sanityArticles(): Loader {
  return {
    name: 'sanity-articles',
    load: async ({ store, logger, parseData, generateDigest }) => {
      const docs = await client().fetch<any[]>(ARTICLE_QUERY);
      if (!docs.length) throw new Error('[sanity-articles] Sanity returned 0 articles — check the token and dataset');
      store.clear();
      let count = 0;
      const missing: string[] = [];

      for (const d of docs) {
        for (const lang of LANGS) {
          const slug = d.slug?.[lang];
          if (!slug) { missing.push(`${d._id} has no ${lang} slug`); continue; }

          const raw = {
            title: pick<string>(d.title, lang),
            author: d.author,
            date: d.date,
            category: d.category,
            image: pick<string>(d.imageUrl, lang),
            featured: d.featured ?? false,
            translationKey: d.tinaKey || pick<string>(d.slug, "sv") || d._id,
          };

          const id = `${lang}/${slug}`;
          const data = await parseData({ id, data: clean(raw) });
          store.set({
            id,
            data,
            digest: generateDigest({ ...raw, _updatedAt: d._updatedAt }),
            body: plain(pick(d.body, lang)),
            rendered: { html: html(pick(d.body, lang)) },
          });
          count++;
        }
      }

      for (const m of missing) logger.error(`[sanity-articles] skipped: ${m}`);
      if (missing.length) throw new Error(`[sanity-articles] ${missing.length} entr(ies) could not be built — refusing to build a partial site`);
      logger.info(`Loaded ${count} article entries from ${docs.length} documents`);
    },
  };
}
