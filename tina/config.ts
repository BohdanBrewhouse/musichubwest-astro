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
          { type: 'string', name: 'seo_description', label: 'SEO-beskrivning (visas i Google & social media — max 160 tecken)', ui: { component: 'textarea' } },
          { type: 'string', name: 'date', label: 'Datum (ÅÅÅÅ-MM-DD)', required: true },
          { type: 'string', name: 'time', label: 'Tid (t.ex. 14:00–17:00)', required: true },
          { type: 'string', name: 'location', label: 'Plats', required: true },
          { type: 'string', name: 'address', label: 'Adress (gatuadress, postnummer)' },
          { type: 'string', name: 'map_query', label: 'Kartsökning (t.ex. "Högskolan för scen och musik Göteborg")' },
          {
            type: 'string', name: 'category', label: 'Kategori', required: true,
            options: ['Tune In West', 'Kulturverkstaden', 'Högskolan för scen och musik', 'VGR', 'Partners', 'Kulturakademin'],
          },
          {
            type: 'string', name: 'event_type', label: 'Typ av event',
            options: ['Event', 'Utlysning'],
          },
          {
            type: 'string', name: 'event_language', label: 'Eventets språk',
            options: ['Svenska', 'Engelska', 'Tvåspråkigt'],
          },
          { type: 'image', name: 'image', label: 'Huvudbild (16:9, ~1920×1080 px — används i hero & detaljsida)', required: true },
          { type: 'image', name: 'card_image', label: 'Kortbild (4:3, ~1200×900 px — frivillig, används bara i eventlistan om angiven)' },
          { type: 'number', name: 'spots_left', label: 'Platser kvar' },
          { type: 'number', name: 'spots_total', label: 'Totalt antal platser' },
          { type: 'string', name: 'cost', label: 'Kostnad (t.ex. Gratis)' },
          { type: 'string', name: 'organizer', label: 'Arrangör' },
          { type: 'string', name: 'organizer_email', label: 'Arrangörens e-post' },
          { type: 'string', name: 'translationKey', label: 'Translation Key (samma som engelsk version)' },
          { type: 'boolean', name: 'registration_open', label: '✅ Anmälan öppen' },
          { type: 'string', name: 'external_registration_url', label: '🔗 Extern anmälningslänk (lämna tom om vi hanterar anmälan)' },
          { type: 'boolean', name: 'serve_food', label: '🍕 Serveras mat / fika? (visar allergifält i anmälningsformuläret)' },
          {
            type: 'object', name: 'sessions', label: '📅 Programpunkter (för event med flera delar — t.ex. konferensveckor)',
            list: true,
            ui: { itemProps: item => ({ label: [item?.day, item?.time, item?.title].filter(Boolean).join(' · ') || 'Ny programpunkt' }) },
            fields: [
              { type: 'string', name: 'title', label: 'Titel', required: true },
              { type: 'string', name: 'day', label: 'Dag (t.ex. "31 aug")' },
              { type: 'string', name: 'time', label: 'Tid (t.ex. 10:50–11:45)' },
              { type: 'string', name: 'location', label: 'Plats (t.ex. Stationshuset eller Digitalt)' },
              { type: 'string', name: 'description', label: 'Kort beskrivning', ui: { component: 'textarea' } },
              { type: 'string', name: 'registration_url', label: '🔗 Anmälningslänk för just denna punkt' },
              { type: 'boolean', name: 'highlight', label: '⭐ Extra relevant för musikbranschen' },
            ],
          },
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
          { type: 'string', name: 'seo_description', label: 'SEO description (shown in Google & social media — max 160 chars)', ui: { component: 'textarea' } },
          { type: 'string', name: 'date', label: 'Date (YYYY-MM-DD)', required: true },
          { type: 'string', name: 'time', label: 'Time (e.g. 14:00–17:00)', required: true },
          { type: 'string', name: 'location', label: 'Location', required: true },
          { type: 'string', name: 'address', label: 'Address (street, postcode)' },
          { type: 'string', name: 'map_query', label: 'Map search (e.g. "Högskolan för scen och musik Göteborg")' },
          {
            type: 'string', name: 'category', label: 'Category', required: true,
            options: ['Tune In West', 'Kulturverkstaden', 'Högskolan för scen och musik', 'VGR', 'Partners', 'Kulturakademin'],
          },
          {
            type: 'string', name: 'event_type', label: 'Event type',
            options: ['Event', 'Utlysning'],
          },
          {
            type: 'string', name: 'event_language', label: 'Event language',
            options: ['Swedish', 'English', 'Bilingual'],
          },
          { type: 'image', name: 'image', label: 'Main image (16:9, ~1920×1080 px — used in hero & detail page)', required: true },
          { type: 'image', name: 'card_image', label: 'Card image (4:3, ~1200×900 px — optional, used only in event list when provided)' },
          { type: 'number', name: 'spots_left', label: 'Spots left' },
          { type: 'number', name: 'spots_total', label: 'Total spots' },
          { type: 'string', name: 'cost', label: 'Cost (e.g. Free)' },
          { type: 'string', name: 'organizer', label: 'Organizer' },
          { type: 'string', name: 'organizer_email', label: 'Organizer email' },
          { type: 'string', name: 'translationKey', label: 'Translation Key (same as Swedish version)' },
          { type: 'boolean', name: 'registration_open', label: '✅ Registration open' },
          { type: 'string', name: 'external_registration_url', label: '🔗 External registration link (leave empty if we handle registration)' },
          { type: 'boolean', name: 'serve_food', label: '🍕 Food / fika served? (shows allergy field in registration form)' },
          {
            type: 'object', name: 'sessions', label: '📅 Programme sessions (for multi-part events — e.g. conference weeks)',
            list: true,
            ui: { itemProps: item => ({ label: [item?.day, item?.time, item?.title].filter(Boolean).join(' · ') || 'New session' }) },
            fields: [
              { type: 'string', name: 'title', label: 'Title', required: true },
              { type: 'string', name: 'day', label: 'Day (e.g. "31 Aug")' },
              { type: 'string', name: 'time', label: 'Time (e.g. 10:50–11:45)' },
              { type: 'string', name: 'location', label: 'Venue (e.g. Stationshuset or Digital)' },
              { type: 'string', name: 'description', label: 'Short description', ui: { component: 'textarea' } },
              { type: 'string', name: 'registration_url', label: '🔗 Registration link for this session' },
              { type: 'boolean', name: 'highlight', label: '⭐ Especially relevant for the music industry' },
            ],
          },
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
            options: ['Tune In West', 'Kulturverkstaden', 'Högskolan för scen och musik', 'VGR'],
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
            options: ['Tune In West', 'Kulturverkstaden', 'Högskolan för scen och musik', 'VGR'],
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
