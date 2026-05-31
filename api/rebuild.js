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

  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    console.error('[rebuild] VERCEL_DEPLOY_HOOK_URL is not set');
    return res.status(500).json({ error: 'Deploy hook not configured' });
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
