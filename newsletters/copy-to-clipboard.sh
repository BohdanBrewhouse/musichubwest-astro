#!/bin/bash
# Copy a newsletter to the clipboard in a form Resend's editor cannot mangle.
#
# Why this exists: pasting the raw UTF-8 file into the Resend editor turned
# "Hösten" into "H√∂sten". macOS `pbcopy` interprets its input using the shell's
# locale, and with LANG unset that means Mac OS Roman — so the UTF-8 bytes for
# å/ä/ö (C3 A5, C3 A4, C3 B6) were read as the two characters they happen to
# spell in MacRoman.
#
# Forcing a UTF-8 locale fixes the immediate cause, but every non-ASCII
# character is still one encoding guess away from breaking somewhere between
# clipboard, editor and mail client. So we also convert them to HTML entities:
# the result is pure ASCII, renders identically in every mail client, and has
# nothing left to misinterpret.
#
# Usage:  ./newsletters/copy-to-clipboard.sh newsletters/2026-08-augusti.html

set -euo pipefail

FILE="${1:?usage: copy-to-clipboard.sh <file.html>}"
[ -f "$FILE" ] || { echo "no such file: $FILE" >&2; exit 1; }

python3 - "$FILE" <<'PY' | LC_ALL=en_US.UTF-8 pbcopy
import sys, html

src = open(sys.argv[1], encoding='utf-8').read()

# Escape every non-ASCII character, but leave the HTML structure alone —
# html.escape() would also mangle the tags, so we go character by character.
out = []
for ch in src:
    if ord(ch) < 128:
        out.append(ch)
    else:
        named = html.entities.codepoint2name.get(ord(ch))
        out.append(f'&{named};' if named else f'&#{ord(ch)};')
result = ''.join(out)

assert result.isascii(), 'conversion left non-ASCII characters behind'
sys.stdout.write(result)
sys.stderr.write(f'{len(result)} bytes, pure ASCII\n')
PY

echo "clipboard: $(pbpaste | wc -c | tr -d ' ') bytes"
pbpaste | grep -q 'RESEND_UNSUBSCRIBE_URL' \
  && echo "unsubscribe token: present" \
  || echo "unsubscribe token: MISSING — do not send this" >&2
