/**
 * GET/POST /api/rebuild
 * Triggered by Vercel Cron once a day (see vercel.json "crons").
 *
 * Why this exists:
 *   The events page (/evenemang) splits events into "Kommande" vs "Arkiv"
 *   using `new Date()` — which, on a static Astro build, is frozen to the
 *   moment of the last deploy. So a passed event only moves to the archive
 *   when the site is rebuilt. This cron rebuilds the site every night so
 *   `today` refreshes and passed events drop into the archive automatically.
 *
 * Setup (one-time, in the Vercel dashboard):
 *   1. Settings → Git → Deploy Hooks → create a hook on branch `main`,
 *      name it "Daily rebuild". Copy the URL.
 *   2. Settings → Environment Variables → add:
 *        VERCEL_DEPLOY_HOOK_URL = <the hook URL>
 *        CRON_SECRET            = <any long random string>
 *   3. Redeploy once so the cron in vercel.json registers.
 *
 * Security: Vercel automatically sends `Authorization: Bearer <CRON_SECRET>`
 * on cron invocations when CRON_SECRET is set, so we reject anything else.
 */
export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers['authorization'];
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // Keep the Supabase free-tier project from auto-pausing: a tiny real query
  // each night counts as activity, so event submissions never hit a sleeping
  // database. Runs regardless of whether the deploy hook is configured, and
  // is best-effort — never blocks anything.
  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const pingRes = await fetch(`${SUPABASE_URL}/rest/v1/event_submissions?select=id&limit=1`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      });
      console.log(`[rebuild] Supabase keep-alive ping → status ${pingRes.status}`);
    } catch (e) {
      console.warn('[rebuild] Supabase ping failed (non-fatal):', e?.message || e);
    }
  }

  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    console.warn('[rebuild] VERCEL_DEPLOY_HOOK_URL not set — pinged Supabase only, no rebuild');
    return res.status(200).json({ ok: true, pinged: true, triggered: false });
  }

  try {
    const r = await fetch(hook, { method: 'POST' });
    console.log(`[rebuild] Deploy hook triggered → status ${r.status}`);
    return res.status(200).json({ ok: true, triggered: true });
  } catch (err) {
    console.error('[rebuild] Failed to trigger deploy hook:', err?.message || err);
    return res.status(500).json({ error: 'Failed to trigger rebuild' });
  }
}
