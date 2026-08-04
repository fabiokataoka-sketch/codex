#!/usr/bin/env bash
# Renders proposta-lb-traducoes.html to PDF.
#
# The proposal is written as an Artifact fragment (no <html>/<head>/<body>), so this
# wraps it in a full document, pins the light theme — a proposal gets printed and
# forwarded, and the brand reserves light for long-form reading — and adds print
# rules the on-screen version doesn't need.
#
# Usage: ./build-pdf.sh
set -euo pipefail
cd "$(dirname "$0")"

SRC="proposta-lb-traducoes.html"
OUT="proposta-lb-traducoes.pdf"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

{
  cat <<'HEAD'
<!doctype html>
<html lang="pt-BR" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800;900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @page { size: A4; margin: 14mm 0; }
  body { font-size: 10.5pt; }
  .wrap { max-width: none; padding: 0 16mm 0; }
  /* Keep the small blocks whole, but let sections flow — pinning whole sections
     pushes each one to a fresh page and leaves half-empty spreads. */
  .path, .fact, .call, .tw, ol.steps li, ul.give li { break-inside: avoid; }
  .shead { break-after: avoid; }
  section { padding-top: 26px; }
  .cover { padding-top: 0; break-after: page; }
  h1 { font-size: 30pt; }
  h2 { font-size: 15pt; }
  footer { margin-top: 40px; }
</style>
HEAD
  cat "$SRC"
  echo '</head><body>'
  echo '</body></html>'
} > "$TMP/doc.html"

# The fragment carries its own <title> and <style>; move the body content after </head>.
python3 - "$TMP/doc.html" <<'PY'
import re, sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
head_end = s.index("</head>")
head, rest = s[:head_end], s[head_end:]
# Pull the proposal's markup (everything from the first <div class="wrap">) into <body>.
i = head.index('<div class="wrap">')
head, markup = head[:i], head[i:]
open(p, "w", encoding="utf-8").write(head + "</head>\n<body>\n" + markup + "\n</body></html>")
PY

/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --virtual-time-budget=15000 \
  --print-to-pdf="$OUT" --no-pdf-header-footer \
  "file://$TMP/doc.html" 2>/dev/null

echo "Gerado: $OUT ($(du -h "$OUT" | cut -f1))"
