// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.musichubwest.com',
  // Content images live on Sanity's CDN once CONTENT_SOURCE=sanity. Both the
  // Astro <Image> component and Vercel's image service refuse remote hosts they
  // were not told about — and they refuse silently, so the images would simply
  // not appear while the build stayed green.
  image: {
    domains: ['cdn.sanity.io'],
  },
  integrations: [mdx(), sitemap()],
  i18n: {
    defaultLocale: 'sv',
    locales: ['sv', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  // Vercel adapter unlocks the platform image-optimization endpoint
  // (/_vercel/image), used by Astro's <Image> component for /public
  // assets uploaded via TinaCMS. Output stays static — the adapter
  // just adds the image route on top of the SSG output.
  adapter: vercel({
    imageService: true,
    imagesConfig: {
      sizes: [320, 640, 768, 1024, 1280, 1920],
      formats: ['image/webp'],
      domains: ['cdn.sanity.io'],
    },
  }),
});
