import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const events = await getCollection('events', e => e.id.startsWith('sv/'));
  return events.map(ev => ({
    params: { slug: ev.id.replace('sv/', '') },
    props: { ev },
  }));
}

function toIcsDate(dateStr: string, timeStr: string) {
  const [start] = timeStr.split('–');
  const [h, m] = start.trim().split(':');
  const d = new Date(`${dateStr} ${h}:${m}`);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
function toIcsDateEnd(dateStr: string, timeStr: string) {
  const parts = timeStr.split('–');
  const endTime = parts.length > 1 ? parts[1] : parts[0];
  const [h, m] = endTime.trim().split(':');
  const d = new Date(`${dateStr} ${h}:${m}`);
  if (isNaN(d.getTime())) return toIcsDate(dateStr, timeStr);
  d.setHours(d.getHours() + (parts.length === 1 ? 1 : 0));
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export const GET: APIRoute = ({ props, site }) => {
  const { ev } = props;
  const slug = ev.id.replace('sv/', '');
  const eventUrl = new URL(`/evenemang/${slug}`, site).toString();
  const dtStart = toIcsDate(ev.data.date, ev.data.time);
  const dtEnd = toIcsDateEnd(ev.data.date, ev.data.time);

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Music Hub West//Event//SV',
    'BEGIN:VEVENT',
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${ev.data.title}`,
    `LOCATION:${ev.data.location}`,
    `URL:${eventUrl}`,
    `UID:${slug}@musichubwest.vercel.app`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}.ics"`,
    },
  });
};
