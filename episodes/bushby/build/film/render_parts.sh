#!/usr/bin/env bash
# Render the film in slices (each its own browser run), retrying a slice if the browser dies, then join them and add the sound.
set -u
cd "$(dirname "$0")"
LIB=${LIB:-$HOME/lemo-opuscar}
export PLAYWRIGHT_CHROME=${PLAYWRIGHT_CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
DUR=$(python3 -c "import re;print(sum(float(x) for x in re.findall(r\"\['\w+', '\w+', ([\d.]+)\", open('main.js').read())))")
CUTS=(0 75 150 225 300 375 $DUR)
mkdir -p out/parts; : > out/parts/list.txt
for i in $(seq 0 $((${#CUTS[@]} - 2))); do
  a=${CUTS[$i]}; b=${CUTS[$((i + 1))]}; f=out/parts/p$i.mp4
  echo "file 'p$i.mp4'" >> out/parts/list.txt
  for try in 1 2 3; do
    [ -s "$f" ] && break
    (cd "$LIB" && node core/render/video.mjs "$OLDPWD" --fps 24 --workers 3 --q "part=$a,$b" --out "$OLDPWD/$f" 2>&1 | grep -v "GPU stall" | tail -2)
  done
  [ -s "$f" ] || { echo "part $i failed"; exit 1; }
done
ffmpeg -loglevel error -y -f concat -safe 0 -i out/parts/list.txt -c copy out/video.mp4 && echo joined
