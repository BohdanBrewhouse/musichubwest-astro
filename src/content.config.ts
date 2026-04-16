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
    serve_food: z.boolean().optional().default(false),
    registration_url: z.string().optional(),
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

export const collections = { events, articles };
