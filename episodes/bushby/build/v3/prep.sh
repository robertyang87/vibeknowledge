#!/usr/bin/env bash
# Rebuild generated inputs for the v3 globe build (all git-ignored).
# Needs NOTO_SERIF_SC_VF and NOTO_SANS_SC_VF pointing at the variable Noto SC fonts.
set -euo pipefail
cd "$(dirname "$0")"
cp ../../copy/sample-v3.json copy.json
mkdir -p fonts && ln -sf "$NOTO_SERIF_SC_VF" fonts/serif.ttf && ln -sf "$NOTO_SANS_SC_VF" fonts/sans.ttf
PY=${PY:-$HOME/lemo-opuscar/.venv/bin/python}
"$PY" make_tex.py
"$PY" make_vectors.py
