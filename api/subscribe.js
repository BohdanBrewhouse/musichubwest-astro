/**
 * Newsletter signup — Resend contacts + segments.
 *
 *   POST /api/subscribe   { email, lang }        → subscribes immediately and
 *                                                  sends the welcome mail
 *   GET  /api/subscribe?action=unsubscribe&…     → verifies the signed link and
 *                                                  unsubscribes the contact
 *
 * Single opt-in: submitting the form is the act of consent, and the subscriber
 * is active from that moment. That is legal, but it means anyone can subscribe
 * any address — including one they mistyped. Every mail therefore carries a
 * one-click unsubscribe link, and the link is HMAC-signed so it cannot be used
 * to unsubscribe somebody else.
 *
 * Unsubscribe tokens are a stateless HMAC over `purpose.email.expiry`, so no
 * database is needed and a link keeps working for as long as the mail exists.
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
import { buildNewsletterWelcomeEmail } from './_email-template.js';
import { resendCall as call } from './_resend.js';

const FROM     = process.env.EMAIL_FROM || 'Music Hub West <hello@musichubwest.com>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'hello@musichubwest.se';
const SITE     = 'https://www.musichubwest.com';

// Unsubscribe links live in the reader's inbox indefinitely, so they must not expire.
const UNSUB_EXP = 0;

/**
 * `purpose` is part of the signed payload, so a token minted for one action can
 * never be replayed as another if more link types are added later.
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

  // ── Unsubscribe (link from the bottom of every mail) ───────────────────
  if (req.method === 'GET') {
    const { token, email: raw, lang } = req.query;
    const base  = lang === 'en' ? `${SITE}/en/newsletter` : `${SITE}/nyhetsbrev`;
    const email = normalise(raw);

    const result = verify(email, token, NEWSLETTER_SECRET, 'unsub');
    if (result !== 'ok') return res.redirect(302, `${base}?status=${result}`);

    // Selected by email; audienceId is deprecated and omitted.
    const err = await call('unsubscribe', resend.contacts.update({ email, unsubscribed: true }));
    // Telling someone they are unsubscribed when the call failed is the one
    // outcome we must never produce — they would keep receiving mail.
    if (err) return res.redirect(302, `${base}?status=error`);

    return res.redirect(302, `${base}?status=unsubscribed`);
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

    // Two plain steps rather than one clever one.
    //
    // An earlier version passed `segments: [{ id }]` to create() so the contact
    // would land in the segment in a single call. That call failed for a brand
    // new address — silently, because the SDK returns errors instead of throwing
    // — and no contact was created at all. The parameter is in the SDK types but
    // not in Resend's own create-contact example, so it is not used here.
    // Creating the contact and adding it to the segment are separate calls, each
    // in the exact shape the API reference documents.
    const createErr = await call('create contact', resend.contacts.create({
      email,
      unsubscribed: false,
    }));

    // create() also rejects when the address is already a contact — an earlier
    // signup, a manual add, or someone who unsubscribed before — leaving the
    // subscription flag untouched. Either way, set it explicitly.
    //
    // Note this re-activates a contact who had unsubscribed. With single opt-in
    // that is the intended reading of a fresh form submission, but it also means
    // a third party could put an unsubscribed address back on the list. Double
    // opt-in is what would prevent it.
    if (createErr) {
      const updateErr = await call('reactivate', resend.contacts.update({ email, unsubscribed: false }));
      // Neither create nor update worked — we cannot claim they are subscribed.
      if (updateErr) return res.status(500).json({
        ok: false, error: 'subscribe_failed',
        // Which step broke, and Resend's error code — an enum, not free text, so
        // it carries no address or key. Saves digging through Vercel logs.
        step: 'create+update', code: `${createErr.name}|${updateErr.name}`,
      });
    }

    // Always: segment membership is what decides whether broadcasts reach them,
    // and it is needed for a new contact just as much as an existing one.
    // Idempotent, so re-adding an existing member is harmless.
    const segErr = await call('add to segment', resend.contacts.segments.add({
      email,
      segmentId: SEGMENT_ID,
    }));
    // Subscribed but not in the segment means they would silently receive
    // nothing, so this is worth failing the request over.
    if (segErr) return res.status(500).json({
      ok: false, error: 'subscribe_failed',
      step: 'segment', code: segErr.name,
    });

    // Welcome mail. A failure is logged but does not fail the request — they are
    // subscribed either way, and an error would invite a duplicate submission.
    // Watch for daily_quota_exceeded here: on the free plan the newsletter and
    // the event-registration confirmations share one quota.
    const mail = buildNewsletterWelcomeEmail({
      unsubscribeUrl: unsubscribeUrl(email, NEWSLETTER_SECRET, lang),
      lang,
    });
    await call('welcome mail', resend.emails.send({
      from: FROM,
      to: email,
      replyTo: REPLY_TO,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    }));

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[subscribe] failed:', err?.message || err);
    return res.status(500).json({ ok: false, error: 'send_failed' });
  }
}
