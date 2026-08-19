/**
 * Newsletter signup with double opt-in — Resend Contacts/Audiences.
 *
 *   POST /api/subscribe        { email, lang }  → creates the contact as
 *                                                unsubscribed:true and mails a
 *                                                confirmation link
 *   GET  /api/subscribe?token= &email= &lang=  → verifies and flips the contact
 *                                                to unsubscribed:false
 *
 * Why double opt-in: a broadcast may only go to addresses whose owner asked for
 * it. Confirming by click is what makes that provable, and it keeps typos and
 * malicious signups out of the list.
 *
 * The token is a stateless HMAC over `email.expiry` — no database needed.
 *
 * Required environment variables (Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY               — same key as the other endpoints
 *   RESEND_NEWSLETTER_SEGMENT_ID — the "Newsletter" segment. Find it in Resend:
 *     Audience → Segments → click the segment; it is the `segmentId` in the URL.
 *   NEWSLETTER_SECRET            — any long random string; signs the links
 *
 * Note on segments vs audiences: Resend has migrated from audiences to
 * segments, and `audienceId` is deprecated across the contacts API. Contacts
 * are created straight into a segment instead.
 * @see https://resend.com/docs/dashboard/segments/migrating-from-audiences-to-segments
 */
import crypto from 'node:crypto';
import { Resend } from 'resend';
import {
  buildNewsletterConfirmEmail,
  buildNewsletterWelcomeEmail,
} from './_email-template.js';

const FROM     = 'Music Hub West <hello@tuneinwest.se>';
const REPLY_TO = 'hello@musichubwest.se';
const SITE     = 'https://www.musichubwest.com';

// Confirmation links stay valid for a week — long enough for a mail that got
// buried, short enough that a leaked link is not useful forever.
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// Unsubscribe links live in the reader's inbox indefinitely, so they must not expire.
const UNSUB_EXP = 0;

/**
 * `purpose` is part of the signed payload so a confirm token can never be
 * replayed as an unsubscribe token, or the other way round.
 */
function sign(email, exp, secret, purpose) {
  return crypto.createHmac('sha256', secret)
    .update(`${purpose}.${email}.${exp}`)
    .digest('base64url');
}

function verify(email, token, secret, purpose) {
  const [exp, sig] = String(token || '').split('.');
  if (!email || !exp || !sig) return 'invalid';
  // exp === '0' means "never expires" (unsubscribe links).
  if (exp !== '0' && Date.now() > Number(exp)) return 'expired';
  const expected = sign(email, exp, secret, purpose);
  // Constant-time compare — a plain === leaks timing information about the
  // signature and would let someone brute-force it byte by byte.
  const ok = expected.length === sig.length
    && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  return ok ? 'ok' : 'invalid';
}

function normalise(email) {
  return String(email || '').trim().toLowerCase();
}

function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function unsubscribeUrl(email, secret, lang) {
  const token = `${UNSUB_EXP}.${sign(email, UNSUB_EXP, secret, 'unsub')}`;
  return `${SITE}/api/subscribe?action=unsubscribe&token=${encodeURIComponent(token)}`
    + `&email=${encodeURIComponent(email)}&lang=${lang}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const RESEND_API_KEY    = process.env.RESEND_API_KEY;
  const SEGMENT_ID        = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
  const NEWSLETTER_SECRET = process.env.NEWSLETTER_SECRET;

  if (!RESEND_API_KEY || !SEGMENT_ID || !NEWSLETTER_SECRET) {
    console.error('[subscribe] missing env:', {
      key: !!RESEND_API_KEY, segment: !!SEGMENT_ID, secret: !!NEWSLETTER_SECRET,
    });
    if (req.method === 'GET') return res.redirect(302, `${SITE}/nyhetsbrev?status=error`);
    return res.status(500).json({ ok: false, error: 'not_configured' });
  }

  const resend = new Resend(RESEND_API_KEY);

  // ── Confirm / unsubscribe (links from the emails) ─────────────────────
  if (req.method === 'GET') {
    const { token, email: raw, lang, action } = req.query;
    const base   = lang === 'en' ? `${SITE}/en/newsletter` : `${SITE}/nyhetsbrev`;
    const email  = normalise(raw);
    const unsub  = action === 'unsubscribe';
    const result = verify(email, token, NEWSLETTER_SECRET, unsub ? 'unsub' : 'confirm');

    if (result !== 'ok') return res.redirect(302, `${base}?status=${result}`);

    try {
      // Selected by email; audienceId is deprecated and omitted.
      await resend.contacts.update({ email, unsubscribed: unsub });
    } catch (err) {
      console.error(`[subscribe] ${unsub ? 'unsubscribe' : 'confirm'} failed:`, err?.message || err);
      return res.redirect(302, `${base}?status=error`);
    }

    if (unsub) return res.redirect(302, `${base}?status=unsubscribed`);

    // Thank-you mail — the first one they get as a confirmed subscriber.
    // Non-fatal: a failure here must not make a successful confirmation look broken.
    try {
      const mail = buildNewsletterWelcomeEmail({
        unsubscribeUrl: unsubscribeUrl(email, NEWSLETTER_SECRET, lang === 'en' ? 'en' : 'sv'),
        lang: lang === 'en' ? 'en' : 'sv',
      });
      await resend.emails.send({
        from: FROM, to: email, replyTo: REPLY_TO,
        subject: mail.subject, html: mail.html, text: mail.text,
      });
    } catch (err) {
      console.error('[subscribe] welcome mail failed:', err?.message || err);
    }

    return res.redirect(302, `${base}?status=confirmed`);
  }

  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  // ── Signup ────────────────────────────────────────────────────────────
  try {
    const body  = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const email = normalise(body.email);
    const lang  = body.lang === 'en' ? 'en' : 'sv';

    // Honeypot: a hidden field only a bot fills in. Answer 200 so it learns nothing.
    if (body.website) return res.status(200).json({ ok: true });

    if (!isEmail(email)) return res.status(400).json({ ok: false, error: 'invalid_email' });

    // Created as unsubscribed and placed straight into the newsletter segment:
    // the contact exists but receives nothing until the confirm click.
    //
    // Non-fatal on purpose. If the address is already a contact this call
    // fails, and that is a normal case — someone re-subscribing, or finishing
    // a signup they abandoned. We still want to send them a fresh confirm
    // link. Because we never call update() here, an already-confirmed
    // subscriber cannot be knocked back to unsubscribed by someone else
    // typing their address into the form.
    try {
      await resend.contacts.create({
        email,
        unsubscribed: true,
        segments: [{ id: SEGMENT_ID }],
      });
    } catch (err) {
      console.warn('[subscribe] contact exists or create failed:', err?.message || err);
    }

    const exp        = Date.now() + TOKEN_TTL_MS;
    const token      = `${exp}.${sign(email, exp, NEWSLETTER_SECRET, 'confirm')}`;
    const confirmUrl = `${SITE}/api/subscribe?token=${encodeURIComponent(token)}`
      + `&email=${encodeURIComponent(email)}&lang=${lang}`;

    const mail = buildNewsletterConfirmEmail({ confirmUrl, lang });
    await resend.emails.send({
      from: FROM,
      to: email,
      replyTo: REPLY_TO,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[subscribe] failed:', err?.message || err);
    return res.status(500).json({ ok: false, error: 'send_failed' });
  }
}
