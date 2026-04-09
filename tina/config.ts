import { defineConfig } from 'tinacms';

export default defineConfig({
  branch: process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main',
  clientId: process.env.TINA_PUBLIC_CLIENT_ID || '',
  token: process.env.TINA_TOKEN || '',

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      // ─── EVENTS (Swedish) ────────────────────────────────────
      {
        name: 'event_sv',
        label: 'Event (Svenska)',
        path: 'src/content/events/sv',
        format: 'md',
        ui: {
          filename: {
            readonly: false,
            slugify: values => values?.title?.toLowerCase().replace(/\s+/g, '-').replace(/[åä]/g, 'a').replace(/ö/g, 'o') || '',
          },
        },
        fields: [
          { type: 'string', name: 'title', label: 'Titel', required: true },
          { type: 'string', name: 'date', label: 'Datum (ÅÅÅÅ-MM-DD)', required: true },
          { type: 'string', name: 'time', label: 'Tid (t.ex. 14:00–17:00)', required: true },
          { type: 'string', name: 'location', label: 'Plats', required: true },
          {
            type: 'string', name: 'category', label: 'Kategori', required: true,
            options: ['Tune In West', 'Kulturverkstaden', 'HSM', 'VGR'],
          },
          { type: 'image', name: 'image', label: 'Bild', required: true },
          { type: 'number', name: 'spots_left', label: 'Platser kvar' },
          { type: 'number', name: 'spots_total', label: 'Totalt antal platser' },
          { type: 'string', name: 'cost', label: 'Kostnad (t.ex. Gratis)' },
          { type: 'string', name: 'organizer', label: 'Arrangör' },
          { type: 'string', name: 'organizer_email', label: 'Arrangörens e-post' },
          { type: 'string', name: 'translationKey', label: 'Translation Key (samma som engelsk version)' },
          { type: 'string', name: 'registration_url', label: 'Anmälningslänk (t.ex. Monday.com)' },
          { type: 'rich-text', name: 'body', label: 'Beskrivning', isBody: true },
        ],
      },

      // ─── EVENTS (English) ────────────────────────────────────
      {
        name: 'event_en',
        label: 'Events (English)',
        path: 'src/content/events/en',
        format: 'md',
        ui: {
          filename: {
            readonly: false,
            slugify: values => values?.title?.toLowerCase().replace(/\s+/g, '-') || '',
          },
        },
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true },
          { type: 'string', name: 'date', label: 'Date (YYYY-MM-DD)', required: true },
          { type: 'string', name: 'time', label: 'Time (e.g. 14:00–17:00)', required: true },
          { type: 'string', name: 'location', label: 'Location', required: true },
          {
            type: 'string', name: 'category', label: 'Category', required: true,
            options: ['Tune In West', 'Kulturverkstaden', 'HSM', 'VGR'],
          },
          { type: 'image', name: 'image', label: 'Image', required: true },
          { type: 'number', name: 'spots_left', label: 'Spots left' },
          { type: 'number', name: 'spots_total', label: 'Total spots' },
          { type: 'string', name: 'cost', label: 'Cost (e.g. Free)' },
          { type: 'string', name: 'organizer', label: 'Organizer' },
          { type: 'string', name: 'organizer_email', label: 'Organizer email' },
          { type: 'string', name: 'translationKey', label: 'Translation Key (same as Swedish version)' },
          { type: 'string', name: 'registration_url', label: 'Registration link (e.g. Monday.com)' },
          { type: 'rich-text', name: 'body', label: 'Description', isBody: true },
        ],
      },

      // ─── ARTICLES (Swedish) ──────────────────────────────────
      {
        name: 'article_sv',
        label: 'Artiklar (Svenska)',
        path: 'src/content/articles/sv',
        format: 'md',
        ui: {
          filename: {
            readonly: false,
            slugify: values => values?.title?.toLowerCase().replace(/\s+/g, '-').replace(/[åä]/g, 'a').replace(/ö/g, 'o') || '',
          },
        },
        fields: [
          { type: 'string', name: 'title', label: 'Titel', required: true },
          { type: 'string', name: 'author', label: 'Författare', required: true },
          { type: 'string', name: 'date', label: 'Datum (ÅÅÅÅ-MM-DD)', required: true },
          {
            type: 'string', name: 'category', label: 'Kategori', required: true,
            options: ['Tune In West', 'Kulturverkstaden', 'HSM', 'VGR'],
          },
          { type: 'image', name: 'image', label: 'Omslagsbild' },
          { type: 'boolean', name: 'featured', label: 'Utvald artikel' },
          { type: 'string', name: 'translationKey', label: 'Translation Key' },
          { type: 'rich-text', name: 'body', label: 'Innehåll', isBody: true },
        ],
      },

      // ─── ARTICLES (English) ──────────────────────────────────
      {
        name: 'article_en',
        label: 'Articles (English)',
        path: 'src/content/articles/en',
        format: 'md',
        ui: {
          filename: {
            readonly: false,
            slugify: values => values?.title?.toLowerCase().replace(/\s+/g, '-') || '',
          },
        },
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true },
          { type: 'string', name: 'author', label: 'Author', required: true },
          { type: 'string', name: 'date', label: 'Date (YYYY-MM-DD)', required: true },
          {
            type: 'string', name: 'category', label: 'Category', required: true,
            options: ['Tune In West', 'Kulturverkstaden', 'HSM', 'VGR'],
          },
          { type: 'image', name: 'image', label: 'Cover image' },
          { type: 'boolean', name: 'featured', label: 'Featured article' },
          { type: 'string', name: 'translationKey', label: 'Translation Key' },
          { type: 'rich-text', name: 'body', label: 'Content', isBody: true },
        ],
      },
    ],
  },
});
