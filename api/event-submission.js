/**
 * POST /api/event-submission
 *
 * Receives event-publication requests from /publicera-event (and the EN
 * mirror once enabled). Files are uploaded by the browser straight into
 * Supabase Storage (4.5 MB serverless body limit can't fit 5×10 MB), so
 * this endpoint only handles the JSON payload — including the public URLs
 * of already-uploaded files.
 *
 * Flow:
 *   1. Validate Turnstile/honeypot/required fields
 *   2. Insert a row into event_submissions (service-role key)
 *   3. Send a confirmation email to the submitter (Resend)
 *   4. Send an internal notification to the team (Resend)
 *   5. Return ok:true with the new submission id
 *
 * Required env vars:
 *   PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY
 *
 * Failures in steps 3–4 are non-fatal: the row exists in Supabase regardless,
 * so a missed email never costs us the submission.
 */
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildEventConfirmationEmail, buildEventTeamNotification } from './_email-template.js';
import { resendCall } from './_resend.js';

const TEAM_EMAIL  = 'bohdan@brewhouse.se';
const FROM        = 'Music Hub West <hello@tuneinwest.se>';
const REPLY_TO    = 'hello@musichubwest.se';

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
  if (String(body.description).length > 1500)     return badRequest(res, 'Description too long');

  // File URLs — only accept supabase.co URLs, never trust arbitrary strings
  const fileUrls = Array.isArray(body.fileUrls) ? body.fileUrls.filter(u =>
    typeof u === 'string' && /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/event-uploads\//i.test(u)
  ).slice(0, 5) : [];

  // ── 3. Insert into Supabase
  const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[event-submission] Supabase env vars missing');
    return res.status(500).json({ ok: false, error: 'Server not configured' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const row = {
    first_name:       body.firstName.trim(),
    last_name:        body.lastName.trim(),
    email:            body.email.trim().toLowerCase(),
    phone:            body.phone?.trim() || null,
    organisation:     body.organisation.trim(),
    event_title:      body.eventTitle.trim(),
    event_date:       body.eventDate,
    event_location:   body.eventLocation.trim(),
    description:      body.description.trim(),
    registration_url: body.registrationUrl?.trim() || null,
    publish_type:     body.publishType?.trim() || null,
    file_urls:        fileUrls,
    lang:             body.lang === 'en' ? 'en' : 'sv',
  };

  const { data: inserted, error: insertErr } = await supabase
    .from('event_submissions')
    .insert([row])
    .select('id')
    .single();

  if (insertErr) {
    console.error('[event-submission] Supabase insert failed:', insertErr.message);
    return res.status(500).json({ ok: false, error: 'Could not save submission' });
  }
  const submissionId = inserted?.id;
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
        fileUrls:        row.file_urls,
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
