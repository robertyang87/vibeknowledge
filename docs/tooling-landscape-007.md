# Tooling Landscape 007 — openfilm/openfilm

Source: owner-shared link, checked first-hand against the GitHub API and the repo README on 2026-10-30.

## What it is
openfilm/openfilm — 3,562 stars, 335 forks, MIT, TypeScript, created 2026-10-04, pushed 2026-10-29 (active). "The open source AI video agent: turns any coding agent into a video agent, with an editor to change anything it makes." Homepage openfilm.dev; installs as a skill (`npx skills add openfilm/openfilm`); needs Node 22.2+ and ffmpeg and downloads a headless Chromium on first run.

Its model is the same shape as ours: a film is ONE HTML file; each shot is a web page that draws any moment with a `frame(t)` function, using anything a browser can draw (three.js, WebGL, canvas, SVG, CSS, GSAP, video). It positions itself against frameworks — "No framework (like Remotion or HyperFrames): one function is enough."

Two parts distinguish it from everything else in this landscape:
1. **Studio, a real local editor.** A human can move, scale and rotate any element inside a page, change text, colour and style, and place, crop, trim and cut clips on a timeline — direct manipulation of an agent-made film, by hand or by asking the agent.
2. **A review verb.** The CLI's `look` command produces a contact sheet, a single frame, or a range check of the film — the same stills-gate pattern as our Step 5/8 checks and video-director's QA sheets, arriving as a first-class command. Other verbs: `render` (MP4, with 4k, motion-blur and alpha options), `get` (voice, music, effects, transcripts, images and video from the user's own connected provider keys), `doctor`.

## Verdict
- **Not adopted, and not queued.** It is a third harness (after the adopted library and the declined video-director). Our rule stands: one directing discipline, one gate system. Its render is also headless-Chromium based, so there is no evidence it answers the throughput problem; HyperFrames remains the designated render-backend challenger (evaluation queue no. 3).
- **Reference shelf, two borrowables by name** (recorded in `docs/tooling-index.md`):
  1. Studio's editor as the reference design for a human-tweak surface, IF an episode ever needs frame-level hand adjustment. No baseline change follows from this: our standing rule is that changes are code edits with named timestamps (baseline Step 6), and an editor does not override it — it is a model for a possible review surface, not a new way to change films.
  2. The `look` verb as further external convergence on stills-based review.
- **No baseline amendment was made for this item**, deliberately: unlike shotcraft (Step 4 vocabulary) and HyperFrames (Step 6 backend candidacy), OpenFilm has no pipeline step it can attach to without breaking a standing rule. Filing that honestly is the integration decision.
