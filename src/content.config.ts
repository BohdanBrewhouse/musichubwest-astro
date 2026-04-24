import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    time: z.string(),
    location: z.string(),
    category: z.enum(['Tune In West', 'Kulturverkstaden', 'Högskolan för scen och musik', 'VGR']),
    image: z.string(),
    spots_left: z.number().optional(),
    spots_total: z.number().optional(),
    cost: z.string().optional(),
    organizer: z.string().optional(),
    organizer_email: z.string().optional(),
    translationKey: z.string(),
    registration_open: z.boolean().optional().default(false),
    external_registration_url: z.string().optional(),
    serve_food: z.boolean().optional().default(false),
    address: z.string().optional(),
    map_query: z.string().optional(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.string(),
    category: z.enum(['Tune In West', 'Kulturverkstaden', 'Högskolan för scen och musik', 'VGR']),
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
