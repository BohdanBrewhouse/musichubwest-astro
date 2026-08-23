/**
 * Push a newsletter HTML file into an existing Resend broadcast draft.
 *
 * Replaces the copy-to-clipboard-and-paste flow: no encoding surprises, no
 * chance of pasting the wrong version, and the repo file stays the source of
 * truth.
 *
 *   node newsletters/push-to-resend.mjs <broadcast-id> <file.html>
 *
 * Needs RESEND_API_KEY. Read from the environment, or from a local .env in the
 * project root — .env is gitignored, so the key never reaches the repository.
 *
 * Deliberately limited: it reads one broadcast and updates one broadcast. It
 * refuses to touch anything that is not still a draft, so a sent newsletter can
 * never be rewritten by accident. It never prints the key.
 */
import { readFileSync, existsSync } from 'node:fs';
import { Resend } from 'resend';

const FROM     = 'Music Hub West <hello@tuneinwest.se>';
const REPLY_TO = 'hello@musichubwest.se';

// ── Config from the command line ──────────────────────────────────────
const [id, file] = process.argv.slice(2);
if (!id || !file) {
  console.error('usage: node newsletters/push-to-resend.mjs <broadcast-id> <file.html>');
  process.exit(1);
}
if (!existsSync(file)) {
  console.error(`no such file: ${file}`);
  process.exit(1);
}

// ── API key: environment first, then .env ─────────────────────────────
function keyFromDotenv() {
  if (!existsSync('.env')) return null;
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*RESEND_API_KEY\s*=\s*(.+?)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, '');
  }
  return null;
}
const apiKey = process.env.RESEND_API_KEY || keyFromDotenv();
if (!apiKey) {
  console.error('RESEND_API_KEY not found — set it in the environment or add a line to .env');
  process.exit(1);
}

const resend = new Resend(apiKey);

/** The SDK resolves with { data, error } instead of throwing. */
async function call(label, promise) {
  const res = await promise;
  if (res?.error) {
    console.error(`✗ ${label}: ${res.error.name} — ${res.error.message}`);
    process.exit(1);
  }
  return res.data;
}

// ── Read the current broadcast before changing anything ───────────────
const current = await call('read broadcast', resend.broadcasts.get(id));
console.log(`broadcast: ${current.name}`);
console.log(`status:    ${current.status}`);

if (current.status !== 'draft') {
  console.error(`\n✗ Refusing to update a broadcast with status "${current.status}".`);
  console.error('  Only drafts can be changed — a sent newsletter must stay as it went out.');
  process.exit(1);
}

// ── Update ────────────────────────────────────────────────────────────
const html = readFileSync(file, 'utf8');

// The unsubscribe placeholder is a hard requirement, both legally and for
// Gmail's bulk sender rules. Better to stop here than to upload a draft that
// cannot be sent.
if (!html.includes('{{{RESEND_UNSUBSCRIBE_URL}}}')) {
  console.error('\n✗ The file has no {{{RESEND_UNSUBSCRIBE_URL}}} — refusing to upload.');
  process.exit(1);
}

const subject = process.env.NEWSLETTER_SUBJECT || 'Det här händer i höst';

await call('update broadcast', resend.broadcasts.update(id, {
  html,
  subject,
  from: FROM,
  replyTo: [REPLY_TO],
}));

console.log(`\n✓ Uploaded ${(html.length / 1024).toFixed(1)} KB from ${file}`);
console.log(`  subject:  ${subject}`);
console.log(`  from:     ${FROM}`);
console.log(`  reply-to: ${REPLY_TO}`);
console.log('\nStill a draft. Send a test email from the Resend editor before publishing.');
