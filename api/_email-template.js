/**
 * Branded MHW confirmation email — dark theme, lime accent.
 * Inline CSS only (no <link>, no external stylesheets) for max email-client compat.
 * Logo hosted at https://musichubwest.com/logo-mhw.png
 */

const LOGO_URL = 'https://musichubwest.com/logo-mhw.png';

export function buildMhwEmail({ namn }) {
  const safeName = (namn || '').replace(/[<>]/g, '').trim() || 'där';

  const subject = `Tack för ditt meddelande, ${safeName}!`;

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${subject}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Syne+Mono&display=swap');
  body { margin:0; padding:0; background:#F7F6F2; }
  a { color:#CCFF00; }
  @media (prefers-color-scheme: light) {
    body { background:#F7F6F2 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#F7F6F2;font-family:'Outfit',-apple-system,'Helvetica Neue',Arial,sans-serif;color:#1C1C1E;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F6F2;padding:40px 16px;">
  <tr><td align="center">

    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#050505;border:1px solid #1a1a1a;border-radius:16px;overflow:hidden;">

      <tr><td align="center" style="padding:48px 32px 32px;background:#050505;">
        <img src="${LOGO_URL}" alt="Music Hub West" width="240" style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:240px;">
      </td></tr>

      <tr><td style="padding:0 32px;">
        <div style="height:1px;background:#1a1a1a;line-height:1px;font-size:1px;">&nbsp;</div>
      </td></tr>

      <tr><td style="padding:40px 32px 16px;background:#050505;">
        <h1 style="font-family:'Syne Mono','Courier New',monospace;font-size:28px;font-weight:400;color:#CCFF00;margin:0;line-height:1.2;letter-spacing:-0.01em;">
          TACK FÖR DITT<br>MEDDELANDE!
        </h1>
      </td></tr>

      <tr><td style="padding:0 32px 32px;background:#050505;">
        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:16px;line-height:1.7;color:#ffffff;margin:0 0 16px;">
          Hej ${safeName}!
        </p>
        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:16px;line-height:1.7;color:#e5e5e5;margin:0 0 16px;">
          Vi har tagit emot ditt meddelande till Music Hub West och återkommer så snart vi kan.
        </p>
        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:14px;line-height:1.7;color:#888888;margin:0;">
          Du får detta meddelande från Tune In West — projektet bakom Music Hub West.
        </p>
      </td></tr>

      <tr><td align="center" style="padding:8px 32px 48px;background:#050505;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:#CCFF00;border-radius:8px;">
            <a href="https://musichubwest.com" target="_blank" style="display:inline-block;padding:14px 28px;font-family:'Syne Mono','Courier New',monospace;font-size:14px;font-weight:400;color:#050505;text-decoration:none;letter-spacing:0.02em;">
              BESÖK MUSICHUBWEST.COM →
            </a>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:32px;background:#0a0a0a;border-top:1px solid #1a1a1a;">
        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:12px;line-height:1.6;color:#666666;margin:0 0 8px;text-align:center;">
          Music Hub West · Göteborg
        </p>
        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:12px;line-height:1.6;color:#666666;margin:0;text-align:center;">
          <a href="mailto:hello@musichubwest.se" style="color:#CCFF00;text-decoration:none;">hello@musichubwest.se</a>
          &nbsp;·&nbsp;
          <a href="https://musichubwest.com" style="color:#CCFF00;text-decoration:none;">musichubwest.com</a>
        </p>
      </td></tr>

    </table>

  </td></tr>
</table>

</body>
</html>`;

  const text = `Hej ${safeName}!

Tack för ditt meddelande till Music Hub West. Vi har tagit emot det och återkommer så snart vi kan.

Du får detta meddelande från Tune In West — projektet bakom Music Hub West.

— Music Hub West
hello@musichubwest.se
https://musichubwest.com`;

  return { subject, html, text };
}

/**
 * Confirmation sent to the person who submitted an event via /publicera-event.
 * Mirrors the MHW dark template above.
 */
export function buildEventConfirmationEmail({ firstName, eventTitle, eventDate, eventLocation }) {
  const safe = (s) => (s || '').toString().replace(/[<>]/g, '').trim();
  const name = safe(firstName) || 'där';
  const title = safe(eventTitle);
  const date = safe(eventDate);
  const location = safe(eventLocation);

  const subject = `Tack för din eventansökan${title ? `: ${title}` : ''}!`;

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${subject}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Syne+Mono&display=swap');
  body { margin:0; padding:0; background:#F7F6F2; }
  a { color:#CCFF00; }
  @media (prefers-color-scheme: light) {
    body { background:#F7F6F2 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#F7F6F2;font-family:'Outfit',-apple-system,'Helvetica Neue',Arial,sans-serif;color:#1C1C1E;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F6F2;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#050505;border:1px solid #1a1a1a;border-radius:16px;overflow:hidden;">

      <tr><td align="center" style="padding:48px 32px 32px;background:#050505;">
        <img src="https://musichubwest.com/logo-mhw.png" alt="Music Hub West" width="240" style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:240px;">
      </td></tr>

      <tr><td style="padding:0 32px;">
        <div style="height:1px;background:#1a1a1a;line-height:1px;font-size:1px;">&nbsp;</div>
      </td></tr>

      <tr><td style="padding:40px 32px 16px;background:#050505;">
        <h1 style="font-family:'Syne Mono','Courier New',monospace;font-size:28px;font-weight:400;color:#CCFF00;margin:0;line-height:1.2;letter-spacing:-0.01em;">
          TACK FÖR DIN<br>ANSÖKAN!
        </h1>
      </td></tr>

      <tr><td style="padding:0 32px 24px;background:#050505;">
        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:16px;line-height:1.7;color:#ffffff;margin:0 0 16px;">
          Hej ${name}!
        </p>
        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:16px;line-height:1.7;color:#e5e5e5;margin:0 0 16px;">
          Vi har tagit emot din eventansökan och återkommer inom 5 arbetsdagar
          med besked.
        </p>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;width:100%;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:8px;">
          ${title ? `<tr><td style="padding:14px 18px;border-bottom:1px solid #1a1a1a;">
            <span style="font-family:'Outfit',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#888;">Event</span><br>
            <span style="font-family:'Outfit',Arial,sans-serif;font-size:15px;color:#ffffff;">${title}</span>
          </td></tr>` : ''}
          ${date ? `<tr><td style="padding:14px 18px;border-bottom:1px solid #1a1a1a;">
            <span style="font-family:'Outfit',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#888;">Datum</span><br>
            <span style="font-family:'Outfit',Arial,sans-serif;font-size:15px;color:#ffffff;">${date}</span>
          </td></tr>` : ''}
          ${location ? `<tr><td style="padding:14px 18px;">
            <span style="font-family:'Outfit',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#888;">Plats</span><br>
            <span style="font-family:'Outfit',Arial,sans-serif;font-size:15px;color:#ffffff;">${location}</span>
          </td></tr>` : ''}
        </table>

        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:14px;line-height:1.7;color:#888888;margin:20px 0 0;">
          Den här tjänsten är till för dig som är aktör inom musikbranschen i Västra Götaland.
        </p>
      </td></tr>

      <tr><td align="center" style="padding:8px 32px 48px;background:#050505;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:#CCFF00;border-radius:8px;">
            <a href="https://musichubwest.com/evenemang" target="_blank" style="display:inline-block;padding:14px 28px;font-family:'Syne Mono','Courier New',monospace;font-size:14px;font-weight:400;color:#050505;text-decoration:none;letter-spacing:0.02em;">
              UTFORSKA EVENT →
            </a>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:32px;background:#0a0a0a;border-top:1px solid #1a1a1a;">
        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:12px;line-height:1.6;color:#666666;margin:0 0 8px;text-align:center;">
          Music Hub West · Göteborg
        </p>
        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:12px;line-height:1.6;color:#666666;margin:0;text-align:center;">
          <a href="mailto:hello@musichubwest.se" style="color:#CCFF00;text-decoration:none;">hello@musichubwest.se</a>
          &nbsp;·&nbsp;
          <a href="https://musichubwest.com" style="color:#CCFF00;text-decoration:none;">musichubwest.com</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>

</body>
</html>`;

  const text = `Hej ${name}!

Tack för din eventansökan${title ? ` "${title}"` : ''}. Vi har tagit emot den och återkommer inom 5 arbetsdagar med besked.
${date ? `\nDatum: ${date}` : ''}${location ? `\nPlats: ${location}` : ''}

Den här tjänsten är till för dig som är aktör inom musikbranschen i Västra Götaland.

— Music Hub West
hello@musichubwest.se
https://musichubwest.com`;

  return { subject, html, text };
}

/**
 * Wraps free-typed admin text in the MHW dark brand shell. Used when the team
 * replies to an applicant from the dashboard (approve / reject / ask).
 */
export function buildAdminEmail({ subject, bodyText }) {
  const esc = (s) => String(s || '').replace(/[<>&]/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;' }[c]));
  const bodyHtml = esc(bodyText)
    .split(/\n{2,}/)
    .map(p => `<p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:16px;line-height:1.7;color:#e5e5e5;margin:0 0 16px;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${esc(subject)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Syne+Mono&display=swap');
  body { margin:0; padding:0; background:#F7F6F2; }
  a { color:#CCFF00; }
</style>
</head>
<body style="margin:0;padding:0;background:#F7F6F2;font-family:'Outfit',-apple-system,'Helvetica Neue',Arial,sans-serif;color:#1C1C1E;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F6F2;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#050505;border:1px solid #1a1a1a;border-radius:16px;overflow:hidden;">
      <tr><td align="center" style="padding:40px 32px 24px;background:#050505;">
        <img src="https://musichubwest.com/logo-mhw.png" alt="Music Hub West" width="220" style="display:block;border:0;height:auto;max-width:220px;">
      </td></tr>
      <tr><td style="padding:0 32px;"><div style="height:1px;background:#1a1a1a;line-height:1px;font-size:1px;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 32px 24px;background:#050505;">${bodyHtml}</td></tr>
      <tr><td style="padding:24px 32px;background:#0a0a0a;border-top:1px solid #1a1a1a;">
        <p style="font-family:'Outfit',Arial,sans-serif;font-size:12px;line-height:1.6;color:#666;margin:0;text-align:center;">
          Music Hub West · Göteborg ·
          <a href="mailto:hello@musichubwest.se" style="color:#CCFF00;text-decoration:none;">hello@musichubwest.se</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  return { subject, html, text: bodyText };
}

/**
 * Internal notification sent to the team when someone submits an event.
 */
export function buildEventTeamNotification(data) {
  const safe = (s) => (s || '').toString().replace(/[<>]/g, '').trim();
  const firstName = safe(data.firstName);
  const lastName  = safe(data.lastName);
  const email     = safe(data.email);
  const phone     = safe(data.phone);
  const org       = safe(data.organisation);
  const title     = safe(data.eventTitle);
  const date      = safe(data.eventDate);
  const location  = safe(data.eventLocation);
  const desc      = safe(data.description);
  const regUrl    = safe(data.registrationUrl);
  const publish   = safe(data.publishType);
  const files     = Array.isArray(data.fileUrls) ? data.fileUrls : [];
  const submissionId = safe(data.submissionId);

  const subject = `🎵 Ny eventansökan: ${title || `${firstName} ${lastName}`}`;

  const fileRows = files.length
    ? files.map((url, i) => `<li style="margin:4px 0;"><a href="${url}" style="color:#CCFF00;">Fil ${i + 1}</a> <span style="color:#777;font-size:11px;">${url}</span></li>`).join('')
    : '<li style="color:#888;">Inga bifogade filer.</li>';

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#F7F6F2;font-family:-apple-system,Helvetica,Arial,sans-serif;color:#1C1C1E;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F6F2;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;">

      <tr><td style="padding:24px 28px;border-bottom:1px solid #1a1a1a;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#CCFF00;text-transform:uppercase;">Ny eventansökan</p>
        <h1 style="margin:0;font-size:22px;color:#ffffff;font-weight:700;">${title || '(ingen titel)'}</h1>
      </td></tr>

      <tr><td style="padding:24px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;color:#e5e5e5;line-height:1.6;">
          <tr><td style="padding:6px 0;width:140px;color:#888;">Namn</td><td>${firstName} ${lastName}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">E-post</td><td><a href="mailto:${email}" style="color:#CCFF00;">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding:6px 0;color:#888;">Telefon</td><td>${phone}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#888;">Organisation</td><td>${org}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Datum</td><td>${date}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Plats</td><td>${location}</td></tr>
          ${regUrl ? `<tr><td style="padding:6px 0;color:#888;">Anmälningslänk</td><td><a href="${regUrl}" style="color:#CCFF00;">${regUrl}</a></td></tr>` : ''}
          ${publish ? `<tr><td style="padding:6px 0;color:#888;">Publicering</td><td>${publish}</td></tr>` : ''}
        </table>
      </td></tr>

      <tr><td style="padding:0 28px 24px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;color:#888;text-transform:uppercase;">Beskrivning</p>
        <div style="background:#050505;border:1px solid #1a1a1a;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.6;color:#e5e5e5;white-space:pre-wrap;">${desc}</div>
      </td></tr>

      <tr><td style="padding:0 28px 24px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;color:#888;text-transform:uppercase;">Bifogade filer</p>
        <ul style="margin:0;padding:0 0 0 20px;font-size:13px;color:#e5e5e5;">${fileRows}</ul>
      </td></tr>

      ${submissionId ? `<tr><td style="padding:16px 28px;background:#050505;border-top:1px solid #1a1a1a;">
        <p style="margin:0;font-size:11px;color:#666;">Submission ID: <code style="color:#888;">${submissionId}</code></p>
      </td></tr>` : ''}

    </table>
  </td></tr>
</table>

</body></html>`;

  const text = `🎵 NY EVENTANSÖKAN

Titel: ${title}
Från: ${firstName} ${lastName} (${org})
E-post: ${email}
${phone ? `Telefon: ${phone}\n` : ''}Datum: ${date}
Plats: ${location}
${regUrl ? `Anmälan: ${regUrl}\n` : ''}${publish ? `Publicering: ${publish}\n` : ''}
Beskrivning:
${desc}

Filer:
${files.length ? files.map((u, i) => `  ${i + 1}. ${u}`).join('\n') : '  (inga)'}

${submissionId ? `Submission ID: ${submissionId}` : ''}`;

  return { subject, html, text };
}

/**
 * Confirmation email sent to a person who registered for one of OUR OWN events
 * (via /api/register → Monday). Bilingual (sv/en). This is a "your spot is
 * booked, see you there" email — NOT the event-application flow above.
 */
export function buildRegistrationConfirmationEmail({ firstName, eventTitle, eventDate, eventLocation, lang }) {
  const safe = (s) => (s || '').toString().replace(/[<>]/g, '').trim();
  const isEn = lang === 'en';
  // First name only, for a warmer greeting
  const name = (safe(firstName).split(/\s+/)[0]) || (isEn ? 'there' : 'där');
  const title = safe(eventTitle);
  const date = safe(eventDate);
  const location = safe(eventLocation);

  const t = isEn ? {
    subject: `You're registered${title ? `: ${title}` : ''} 🎵`,
    heading: `SEE YOU<br>THERE!`,
    hi: `Hi ${name}!`,
    lead: `Your spot is booked. We've received your registration${title ? ` for <strong style="color:#ffffff;">${title}</strong>` : ''} and look forward to seeing you.`,
    labelEvent: 'Event', labelDate: 'Date', labelPlace: 'Location',
    changeNote: `Can't make it after all? Just reply to this email and we'll take you off the list.`,
    cta: 'EXPLORE MORE EVENTS →', ctaUrl: 'https://musichubwest.com/en/events',
  } : {
    subject: `Din plats är bokad${title ? `: ${title}` : ''} 🎵`,
    heading: `VI SES<br>DÄR!`,
    hi: `Hej ${name}!`,
    lead: `Din plats är bokad. Vi har tagit emot din anmälan${title ? ` till <strong style="color:#ffffff;">${title}</strong>` : ''} och ser fram emot att träffa dig.`,
    labelEvent: 'Event', labelDate: 'Datum', labelPlace: 'Plats',
    changeNote: `Får du förhinder? Svara bara på det här mejlet så tar vi bort dig från listan.`,
    cta: 'UTFORSKA FLER EVENT →', ctaUrl: 'https://musichubwest.com/evenemang',
  };

  const html = `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'sv'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${t.subject}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Syne+Mono&display=swap');
  body { margin:0; padding:0; background:#F7F6F2; }
  a { color:#CCFF00; }
  @media (prefers-color-scheme: light) {
    body { background:#F7F6F2 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#F7F6F2;font-family:'Outfit',-apple-system,'Helvetica Neue',Arial,sans-serif;color:#1C1C1E;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F6F2;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#050505;border:1px solid #1a1a1a;border-radius:16px;overflow:hidden;">

      <tr><td align="center" style="padding:48px 32px 32px;background:#050505;">
        <img src="${LOGO_URL}" alt="Music Hub West" width="240" style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:240px;">
      </td></tr>

      <tr><td style="padding:0 32px;">
        <div style="height:1px;background:#1a1a1a;line-height:1px;font-size:1px;">&nbsp;</div>
      </td></tr>

      <tr><td style="padding:40px 32px 16px;background:#050505;">
        <h1 style="font-family:'Syne Mono','Courier New',monospace;font-size:28px;font-weight:400;color:#CCFF00;margin:0;line-height:1.2;letter-spacing:-0.01em;">
          ${t.heading}
        </h1>
      </td></tr>

      <tr><td style="padding:0 32px 24px;background:#050505;">
        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:16px;line-height:1.7;color:#ffffff;margin:0 0 16px;">
          ${t.hi}
        </p>
        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:16px;line-height:1.7;color:#e5e5e5;margin:0 0 16px;">
          ${t.lead}
        </p>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;width:100%;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:8px;">
          ${title ? `<tr><td style="padding:14px 18px;border-bottom:1px solid #1a1a1a;">
            <span style="font-family:'Outfit',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#888;">${t.labelEvent}</span><br>
            <span style="font-family:'Outfit',Arial,sans-serif;font-size:15px;color:#ffffff;">${title}</span>
          </td></tr>` : ''}
          ${date ? `<tr><td style="padding:14px 18px;${location ? 'border-bottom:1px solid #1a1a1a;' : ''}">
            <span style="font-family:'Outfit',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#888;">${t.labelDate}</span><br>
            <span style="font-family:'Outfit',Arial,sans-serif;font-size:15px;color:#ffffff;">${date}</span>
          </td></tr>` : ''}
          ${location ? `<tr><td style="padding:14px 18px;">
            <span style="font-family:'Outfit',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#888;">${t.labelPlace}</span><br>
            <span style="font-family:'Outfit',Arial,sans-serif;font-size:15px;color:#ffffff;">${location}</span>
          </td></tr>` : ''}
        </table>

        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:14px;line-height:1.7;color:#888888;margin:20px 0 0;">
          ${t.changeNote}
        </p>
      </td></tr>

      <tr><td align="center" style="padding:8px 32px 48px;background:#050505;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:#CCFF00;border-radius:8px;">
            <a href="${t.ctaUrl}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:'Syne Mono','Courier New',monospace;font-size:14px;font-weight:400;color:#050505;text-decoration:none;letter-spacing:0.02em;">
              ${t.cta}
            </a>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:32px;background:#0a0a0a;border-top:1px solid #1a1a1a;">
        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:12px;line-height:1.6;color:#666666;margin:0 0 8px;text-align:center;">
          Music Hub West · Göteborg
        </p>
        <p style="font-family:'Outfit',-apple-system,Arial,sans-serif;font-size:12px;line-height:1.6;color:#666666;margin:0;text-align:center;">
          <a href="mailto:hello@musichubwest.se" style="color:#CCFF00;text-decoration:none;">hello@musichubwest.se</a>
          &nbsp;·&nbsp;
          <a href="https://musichubwest.com" style="color:#CCFF00;text-decoration:none;">musichubwest.com</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>

</body>
</html>`;

  const text = isEn
    ? `Hi ${name}!

Your spot is booked. We've received your registration${title ? ` for "${title}"` : ''} and look forward to seeing you.
${date ? `\nDate: ${date}` : ''}${location ? `\nLocation: ${location}` : ''}

Can't make it after all? Just reply to this email and we'll take you off the list.

— Music Hub West
hello@musichubwest.se
https://musichubwest.com`
    : `Hej ${name}!

Din plats är bokad. Vi har tagit emot din anmälan${title ? ` till "${title}"` : ''} och ser fram emot att träffa dig.
${date ? `\nDatum: ${date}` : ''}${location ? `\nPlats: ${location}` : ''}

Får du förhinder? Svara bara på det här mejlet så tar vi bort dig från listan.

— Music Hub West
hello@musichubwest.se
https://musichubwest.com`;

  return { subject: t.subject, html, text };
}
