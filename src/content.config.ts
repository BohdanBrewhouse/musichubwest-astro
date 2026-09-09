import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { sanityEvents, sanityArticles } from './loaders/sanity';

/*
  One switch decides where content comes from.

  CONTENT_SOURCE=sanity is set only on Vercel's Preview environment, so
  production physically cannot read Sanity even though the code is present —
  and rolling back is removing one environment variable, not reverting code.

  The zod schemas below are shared by both paths on purpose: they are the
  contract, and the Sanity loader has to satisfy exactly the same shape the
  markdown files do. If a field drifts, the build fails here rather than on a
  page.
*/
const USE_SANITY = (import.meta.env.CONTENT_SOURCE ?? process.env.CONTENT_SOURCE) === 'sanity';

const events = defineCollection({
  loader: USE_SANITY ? sanityEvents() : glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    seo_description: z.string().optional(),
    date: z.string(),
    time: z.string(),
    location: z.string(),
    category: z.enum(['Tune In West', 'Kulturverkstaden', 'Högskolan för scen och musik', 'VGR', 'Partners', 'Externa event', 'External events', 'Kulturakademin']),
    event_type: z.enum(['Event', 'Utlysning']).optional().default('Event'),
    event_language: z.enum(['Svenska', 'Engelska', 'Tvåspråkigt', 'Swedish', 'English', 'Bilingual']).optional(),
    image: z.string(),
    card_image: z.string().optional(),
    spots_left: z.number().optional(),
    spots_total: z.number().optional(),
    cost: z.string().optional(),
    // Practical facts that were only in the body text, so a reader scanning the
    // sidebar could not see them before deciding.
    duration: z.string().optional(),
    deadline: z.string().optional(),
    organizer: z.string().optional(),
    organizer_email: z.string().optional(),
    translationKey: z.string(),
    registration_open: z.boolean().optional().default(false),
    external_registration_url: z.string().optional(),
    serve_food: z.boolean().optional().default(false),
    // Overrides the CTA button text. Without it the label is derived from
    // event_type — never say "biljetter" unless the event really sells them.
    cta_label: z.string().optional(),
    address: z.string().optional(),
    map_query: z.string().optional(),
    // Multi-part events (conference weeks, programmes with several träffar):
    // each session gets its own time, venue and registration link.
    // sessions_title overrides the block heading ("Spelschema", "Kurser"…).
    sessions_title: z.string().optional(),
    sessions: z.array(z.object({
      title: z.string(),
      day: z.string().optional(),
      time: z.string().optional(),
      location: z.string().optional(),
      description: z.string().optional(),
      registration_url: z.string().optional(),
      highlight: z.boolean().optional().default(false),
    })).optional(),
  }),
});

const articles = defineCollection({
  loader: USE_SANITY ? sanityArticles() : glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.string(),
    category: z.enum(['Tune In West', 'Kulturverkstaden', 'Högskolan för scen och musik', 'VGR', 'Scenen']),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    translationKey: z.string(),
  }),
});




/* speakers / agenda / announcements lived here for the live-event PWA, which
   has been removed. Tina never managed them and no page ever read them. */
export const collections = { events, articles };
