# KataGo: spatial gold edition

A 301.5-second Mandarin educational film, remade in landscape at 1920x1080,
30 fps. The user's supplied reference establishes a dark field, golden light,
spatial particles, traveling highlights and camera movement through diagrams.

## Actual production tools

Blender 4.3.2 creates a coordinate lattice with 361 modeled intersections,
metallic/emissive filaments, an editable scene and an exported glTF model.
Remotion 4.0.543 and Three.js render genuine XYZ geometry, perspective-camera
moves, spatial neural/search illustrations, curved signal paths, particles,
selective bloom and localized typography. They also sequence captions, the
reviewed narration, the music/effects master and the final H.264 export.

The original narration is retained. The new visuals are teaching diagrams,
not KataGo engine measurements or a tactical best-move analysis. Read
`research/FACTS.md` and `research/REVIEW.md` for sources and boundaries.

## Sound

Existing Mandarin synthetic narration: Microsoft Edge TTS Yunxi, rate +5%.
The user's library track is We Never (Remix), Hi Noise / Qiu Cheng. It is
extended with a phrase crossfade and ducked under speech. Original synthesized
node contacts, electronic ticks, travel/return cues and air sweeps accompany
scene actions. The final mix is included; the raw song is not redistributed
as a standalone archive asset. All music rights remain with its owners.

## Rebuild

The source archive preserves repository paths:

```text
episodes/katago-gold/     copy, evidence, scripts, narration
tools/remotion/           pinned React project, fonts, glTF model, final mix
```

Install Node.js, Blender, FFmpeg/ffprobe, Python and a supported Chromium.
From the extracted repository root:

```bash
sh episodes/katago-gold/project/build.sh
```

The included glTF model and final mix are reused. Set `REBUILD_SPATIAL=1` to
regenerate the Blender scene and model. Set `REBUILD_AUDIO=1` to remix; provide
the repository music library path or set `BGM_PATH` to the selected original
track. Remixing requires NumPy and SciPy. Fonts are already subsetted and
included with their OFL notice. A browser executable can be selected with
`REMOTION_BROWSER_EXECUTABLE`; `REMOTION_GL` defaults to `swangle` for the
software-rendered cloud computer.

Final files belong in a versioned GitHub Release, preserving earlier editions.
