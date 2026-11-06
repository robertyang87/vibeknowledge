#!/bin/sh
# Render the look sample. Needs a working copy of Lemo-Opuscar at the pinned commit in ~/lemo-opuscar
# (cp -r vendor/lemo-opuscar ~/lemo-opuscar; npm install; python3 -m venv .venv; .venv/bin/pip install -r requirements.txt).
# The on-screen copy lives in episodes/bushby/copy/; it is copied in only for the render and removed afterwards.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LEMO_LIB:-$HOME/lemo-opuscar}
cp "$HERE/../../copy/sample-15s.json" "$HERE/copy.json"
trap 'rm -f "$HERE/copy.json"' EXIT
mkdir -p "$HERE/out"
"$LIB/.venv/bin/python" "$HERE/mix.py" "$HERE/out/mix.wav"
(cd "$LIB" && node core/render/readcheck.mjs "$HERE" --step 0.1 && node core/render/video.mjs "$HERE" --fps 24 --workers 4 --out "$HERE/out/video.mp4")
ffmpeg -y -loglevel error -i "$HERE/out/video.mp4" -i "$HERE/out/mix.wav" -map 0:v -map 1:a -c:v libx264 -crf 24 -preset slow -tune grain \
  -pix_fmt yuv420p -c:a aac -b:a 192k -af "loudnorm=I=-14:TP=-1.2" -shortest "$HERE/../../renders/bushby-sample-v1.mp4"
echo "wrote episodes/bushby/renders/bushby-sample-v1.mp4"
