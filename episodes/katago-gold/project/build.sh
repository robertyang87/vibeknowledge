#!/bin/sh
set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
EPISODE=$(dirname "$HERE")
REPO_ROOT=$(CDPATH= cd -- "$HERE/../../.." && pwd)
export KATAGO_REPO="$REPO_ROOT"
ASSETS="$REPO_ROOT/tools/remotion/public/gold-katago"
mkdir -p "$EPISODE/renders"
if [ "${REBUILD_SPATIAL:-0}" = 1 ] || [ ! -f "$ASSETS/abstract/katago-spatial-lattice.glb" ]; then
  blender --background --factory-startup --python "$HERE/build_spatial.py"
fi
if [ "${REBUILD_AUDIO:-0}" = 1 ] || [ ! -f "$ASSETS/mix.wav" ]; then
  python3 "$HERE/mix_audio.py"
  cp "$EPISODE/audio/mix.wav" "$ASSETS/mix.wav"
fi
cd "$REPO_ROOT/tools/remotion"
npm ci --no-audit --no-fund
npm run lint
npx remotion still src/index.ts KataGoGoldCover "$EPISODE/renders/cover.png" \
 --browser-executable="${REMOTION_BROWSER_EXECUTABLE:-/usr/bin/chromium}" \
 --gl="${REMOTION_GL:-swangle}"
npx remotion render src/index.ts KataGoGold "$EPISODE/renders/katago-gold.mp4" \
 --browser-executable="${REMOTION_BROWSER_EXECUTABLE:-/usr/bin/chromium}" \
 --gl="${REMOTION_GL:-swangle}" --codec=h264 --crf=18 --concurrency=3
