/* One place that decides which town an event is in, for the city pages.
   The town is the last comma-separated part of the location, the same rule
   the event card uses for its place line; online events have no town. */
export const ONLINE = /online|zoom|digital|webbinar|teams|stream|självstudier/i;
export function cityOf(ev: any): string | null {
  const loc = `${ev.data.location ?? ''}`;
  if (!loc || ONLINE.test(`${loc} ${ev.data.address ?? ''}`)) return null;
  const c = (loc.includes(',') ? loc.split(',').pop()! : loc).trim().replace(/\s*\(.*\)$/, '');
  return c || null;
}
export const citySlug = (c: string) =>
  c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
