import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const allEntries = await getCollection('events');

  // Only Swedish entries (sv/)
  const svEntries = allEntries.filter(e => e.id.startsWith('sv/'));

  const data = svEntries.map(entry => {
    const slug = entry.id.replace('sv/', '').replace(/\.md$/, '');

    // Get first non-empty, non-heading paragraph as description
    const bodyLines = (entry.body || '').split('\n');
    const descLine = bodyLines.find(l => l.trim() && !l.startsWith('#') && !l.startsWith('*') && !l.startsWith('-')) || '';

    return {
      slug,
      title: entry.data.title,
      date: entry.data.date ? String(entry.data.date) : null,
      time: entry.data.time || null,
      location: entry.data.location || null,
      image: entry.data.image || null,
      category: entry.data.category || null,
      description: descLine.trim() || null,
    };
  }).sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
