/**
 * EU funding footer for every outgoing mail (Tillväxtverket / ERDF rules):
 * the colour EU emblem on white and the funding written out in full — no
 * abbreviations. Added at send time so no template can be left without it.
 */
const SITE = 'https://www.musichubwest.com';
const T = {
  sv: { alt: 'Medfinansieras av Europeiska unionen', img: '/eu/eu-sv.png',
        line: 'Tune In West medfinansieras av Europeiska unionen via Tillväxtverket och av Västra Götalandsregionen.' },
  en: { alt: 'Co-funded by the European Union', img: '/eu/eu-en.png',
        line: 'Tune In West is co-funded by the European Union through Tillväxtverket and by Region Västra Götaland.' },
};

function euHtml(lang) {
  const t = T[lang];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
  <tr><td align="center" style="padding:24px 16px 28px;">
    <img src="${SITE}${t.img}" alt="${t.alt}" width="200" style="display:block;width:200px;max-width:100%;height:auto;border:0;margin:0 auto 12px;" />
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#333333;max-width:460px;">${t.line}</p>
  </td></tr>
</table>`;
}

export function withEu(mail) {
  if (!mail || mail.__eu) return mail;
  const out = { ...mail, __eu: true };
  const html = String(mail.html || '');
  const lang = /<html[^>]*lang="en"/i.test(html) || /lang="en"/i.test(html.slice(0, 400)) ? 'en' : 'sv';
  if (html) out.html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, euHtml(lang) + '</body>') : html + euHtml(lang);
  if (mail.text) out.text = String(mail.text) + '\n\n— ' + T[lang].line;
  delete out.__eu;
  return out;
}
