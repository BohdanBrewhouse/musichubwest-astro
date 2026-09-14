/**
 * POST /api/event-submission
 *
 * Receives event-publication requests from /publicera-event and
 * /en/publish-event and writes them into Sanity as `eventSubmission`
 * documents, which the team reads in the Studio.
 *
 * No file uploads: submitters give links instead, and we ask for artwork by
 * email once a submission is accepted. A browser cannot write to Sanity
 * without a write token, and a Vercel function cannot receive the 10 MB
 * bodies the old form allowed — so the feature was traded away deliberately
 * rather than quietly reduced.
 *
 * Flow:
 *   1. Validate honeypot + required fields
 *   2. Create an eventSubmission document (write token)
 *   3. Send a confirmation email to the submitter (Resend)
 *   4. Send an internal notification to the team (Resend)
 *
 * Required env vars:
 *   SANITY_PROJECT_ID · SANITY_DATASET · SANITY_TOKEN · RESEND_API_KEY
 *
 * Failures in steps 3–4 are non-fatal: the document exists regardless, so a
 * missed email never costs us the submission.
 */
import { createClient } from '@sanity/client';
import { Resend } from 'resend';
import { buildEventConfirmationEmail, buildEventTeamNotification } from './_email-template.js';
import { resendCall } from './_resend.js';

const TEAM_EMAIL  = 'bohdan@brewhouse.se';
const FROM        = process.env.EMAIL_FROM || 'Music Hub West <hello@musichubwest.com>';
const REPLY_TO    = process.env.EMAIL_REPLY_TO || 'hello@musichubwest.com';

function badRequest(res, msg) {
  return res.status(400).json({ ok: false, error: msg });
}

function isValidEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const body = req.body || {};

  // ── 1. Honeypot: bots fill hidden "website" field that real users can't see.
  if (body.website && body.website.trim() !== '') {
    console.warn('[event-submission] Honeypot triggered, ignoring');
    return res.status(200).json({ ok: true }); // act normal so bot doesn't retry
  }

  // ── 2. Required-field validation
  const required = ['firstName', 'lastName', 'email', 'organisation', 'eventTitle', 'eventDate', 'eventLocation', 'description'];
  for (const k of required) {
    if (!body[k] || !String(body[k]).trim()) return badRequest(res, `Missing field: ${k}`);
  }
  if (!isValidEmail(body.email))             return badRequest(res, 'Invalid email');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.eventDate)) return badRequest(res, 'Invalid date');
  /* A date that has already passed is always a mistake — an event cannot be
     announced for a day that is gone. The browser refuses it too, but that
     guard lives in page JS and is the easy half to bypass. Compared against
     Stockholm's date, not the server's UTC clock, so an evening submission in
     Sweden is not judged against tomorrow. */
  const todaySE = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date());
  if (body.eventDate < todaySE) return badRequest(res, 'Event date is in the past');
  /* 3000 characters, roughly 500 words — the same number the form states and
     counts down to, so a description that passed the page cannot fail here. */
  if (String(body.description).length > 3000)     return badRequest(res, 'Description too long');

  // A free-text list of links. Kept as text on purpose: submitters paste
  // whatever they have — Drive folders, Instagram posts, WeTransfer — and
  // validating that into a URL field would reject more than it protects.
  const links = String(body.links || '').trim().slice(0, 2000);

  // ── 3. Create the document in Sanity
  const { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_TOKEN } = process.env;
  if (!SANITY_PROJECT_ID || !SANITY_TOKEN) {
    console.error('[event-submission] Sanity env vars missing');
    return res.status(500).json({ ok: false, error: 'Server not configured' });
  }

  const sanity = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET || 'production',
    token: SANITY_TOKEN,
    apiVersion: '2024-10-01',
    useCdn: false,
  });

  // Field names match the Supabase columns they replace, so the email
  // templates below keep working untouched.
  const row = {
    first_name:       body.firstName.trim(),
    last_name:        body.lastName.trim(),
    email:            body.email.trim().toLowerCase(),
    phone:            body.phone?.trim() || undefined,
    organisation:     body.organisation.trim(),
    event_title:      body.eventTitle.trim(),
    event_date:       body.eventDate,
    event_location:   body.eventLocation.trim(),
    description:      body.description.trim(),
    registration_url: body.registrationUrl?.trim() || undefined,
    publish_type:     body.publishType?.trim() || undefined,
    links:            links || undefined,
    lang:             body.lang === 'en' ? 'en' : 'sv',
  };

  let submissionId;
  try {
    const created = await sanity.create({
      _type: 'eventSubmission',
      ...row,
      status: 'new',
      submitted_at: new Date().toISOString(),
    });
    submissionId = created._id;
  } catch (e) {
    console.error('[event-submission] Sanity create failed:', e?.message || e);
    return res.status(500).json({ ok: false, error: 'Could not save submission' });
  }

  console.log(`[event-submission] ✅ Saved #${submissionId} from ${row.email}`);

  // ── 4. Send emails (non-fatal)
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY) {
    const resend = new Resend(RESEND_API_KEY);

    // Confirmation to submitter
    try {
      const userEmail = buildEventConfirmationEmail({
        firstName:     row.first_name,
        eventTitle:    row.event_title,
        eventDate:     row.event_date,
        eventLocation: row.event_location,
      });
      const userErr = await resendCall('event-submission/user', resend.emails.send({
        from: FROM,
        to: row.email,
        replyTo: REPLY_TO,
        subject: userEmail.subject,
        html: userEmail.html,
        text: userEmail.text,
      }));
      if (userErr) console.error(`[event-submission] ⚠️ Confirmation NOT sent to ${row.email} (${userErr.name})`);
    } catch (e) {
      console.error('[event-submission] User email failed (non-fatal):', e?.message || e);
    }

    // Internal team notification
    try {
      const teamEmail = buildEventTeamNotification({
        firstName:       row.first_name,
        lastName:        row.last_name,
        email:           row.email,
        phone:           row.phone,
        organisation:    row.organisation,
        eventTitle:      row.event_title,
        eventDate:       row.event_date,
        eventLocation:   row.event_location,
        description:     row.description,
        registrationUrl: row.registration_url,
        publishType:     row.publish_type,
        links:           row.links,
        submissionId,
      });
      const teamErr = await resendCall('event-submission/team', resend.emails.send({
        from: FROM,
        to: TEAM_EMAIL,
        replyTo: row.email, // reply jumps straight back to the submitter
        subject: teamEmail.subject,
        html: teamEmail.html,
        text: teamEmail.text,
      }));
      // The team not hearing about a submission is the worse failure of the two:
      // the submitter got their confirmation and will expect a reply.
      if (teamErr) console.error(`[event-submission] ⚠️ TEAM NOT NOTIFIED of ${submissionId} (${teamErr.name})`);
    } catch (e) {
      console.error('[event-submission] Team email failed (non-fatal):', e?.message || e);
    }
  } else {
    console.warn('[event-submission] RESEND_API_KEY missing — emails skipped');
  }

  return res.status(200).json({ ok: true, id: submissionId });
}
