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
<meta name="color-scheme" content="dark only">
<meta name="supported-color-schemes" content="dark only">
<title>${subject}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Syne+Mono&display=swap');
  body { margin:0; padding:0; background:#050505; }
  a { color:#CCFF00; }
  @media (prefers-color-scheme: light) {
    body, table, td { background:#050505 !important; color:#ffffff !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#050505;font-family:'Outfit',-apple-system,'Helvetica Neue',Arial,sans-serif;color:#ffffff;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#050505;padding:40px 16px;">
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
          <a href="mailto:hello@musichubwest.com" style="color:#CCFF00;text-decoration:none;">hello@musichubwest.com</a>
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
hello@musichubwest.com
https://musichubwest.com`;

  return { subject, html, text };
}
