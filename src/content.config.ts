import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
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
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
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

const speakers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/speakers' }),
  schema: z.object({
    name: z.string(),
    title: z.string().optional(),
    company: z.string().optional(),
    photo: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    website: z.string().optional(),
    email: z.string().optional(),
  }),
});

const agenda = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/agenda' }),
  schema: z.object({
    title: z.string(),
    event_date: z.string(),
    start_time: z.string(),
    end_time: z.string().optional(),
    location: z.string().optional(),
    speaker_name: z.string().optional(),
    type: z.enum(['Talk', 'Workshop', 'Panel', 'Break', 'Networking', 'Keynote']).optional(),
  }),
});

const announcements = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/announcements' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    category: z.enum(['Info', 'Update', 'Reminder', 'News']).optional(),
    pinned: z.boolean().optional().default(false),
  }),
});

export const collections = { events, articles, speakers, agenda, announcements };
