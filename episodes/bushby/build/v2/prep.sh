#!/bin/sh
# Copy the on-screen copy in for a render and subset the CJK font to exactly the characters used.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LEMO_LIB:-$HOME/lemo-opuscar}; SRC=${NOTO_SC_VF:?set NOTO_SC_VF to NotoSansSC[wght].ttf}
cp "$HERE/../../copy/sample-v2.json" "$HERE/copy.json"
"$LIB/.venv/bin/python" - "$HERE/copy.json" "$HERE/chars.txt" <<'PY'
import json, sys
c = json.load(open(sys.argv[1], encoding='utf-8'))
def walk(x):
    if isinstance(x, str): return x
    if isinstance(x, dict): return ''.join(walk(v) for v in x.values())
    if isinstance(x, list): return ''.join(walk(v) for v in x)
    return ''
open(sys.argv[2], 'w', encoding='utf-8').write(''.join(sorted(set(walk(c)) | set('0123456789 .,·:：→→—–-+'))))
PY
for w in 500 700 900; do
  "$LIB/.venv/bin/python" -m fontTools.varLib.instancer "$SRC" wght=$w -o "$HERE/fonts/.sc-$w.ttf" -q
  "$LIB/.venv/bin/pyftsubset" "$HERE/fonts/.sc-$w.ttf" --text-file="$HERE/chars.txt" --flavor=woff2 --output-file="$HERE/fonts/SC-$w.woff2"
  rm -f "$HERE/fonts/.sc-$w.ttf"
done
rm -f "$HERE/chars.txt"
