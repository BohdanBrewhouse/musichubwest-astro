import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const events = await getCollection('events', e => e.id.startsWith('en/'));
  return events.map(ev => ({
    params: { slug: ev.id.replace('en/', '') },
    props: { ev },
  }));
}

// Extract all HH:MM tokens — handles both '–' (en-dash) and '-' (hyphen)
function extractTimes(s: string): string[] {
  return s.match(/\d{1,2}:\d{2}/g) || [];
}

// Format as local Stockholm datetime (no Z, no UTC conversion)
function fmtLocal(dateStr: string, hhmm: string): string {
  const [year, month, day] = dateStr.split('-');
  const [h, m] = hhmm.split(':');
  return `${year}${month}${day}T${h.padStart(2,'0')}${(m || '00').padStart(2,'0')}00`;
}

function toIcsStart(dateStr: string, timeStr: string): string {
  const t = extractTimes(timeStr);
  return t.length ? fmtLocal(dateStr, t[0]) : '';
}

function toIcsEnd(dateStr: string, timeStr: string): string {
  const t = extractTimes(timeStr);
  if (t.length > 1) return fmtLocal(dateStr, t[1]);
  if (!t.length) return '';
  // No explicit end time → start + 1 hour (still local, just add 1h numerically)
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [h, m] = t[0].split(':').map(Number);
  const endH = h + 1;
  return `${String(y)}${String(mo).padStart(2,'0')}${String(d).padStart(2,'0')}T${String(endH).padStart(2,'0')}${String(m).padStart(2,'0')}00`;
}

export const GET: APIRoute = ({ props, site }) => {
  const { ev } = props;
  const slug = ev.id.replace('en/', '');
  const eventUrl = new URL(`/en/events/${slug}`, site).toString();
  const dtStart = toIcsStart(ev.data.date, ev.data.time);
  const dtEnd   = toIcsEnd(ev.data.date, ev.data.time);

  if (!dtStart) {
    return new Response('', { status: 204 });
  }

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Music Hub West//Event//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Stockholm',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'TZNAME:CEST',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'TZNAME:CET',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `DTSTART;TZID=Europe/Stockholm:${dtStart}`,
    `DTEND;TZID=Europe/Stockholm:${dtEnd}`,
    `SUMMARY:${ev.data.title}`,
    `LOCATION:${ev.data.location}`,
    `URL:${eventUrl}`,
    `UID:${slug}-en@musichubwest.vercel.app`,
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
