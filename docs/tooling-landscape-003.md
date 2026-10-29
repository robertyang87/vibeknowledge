# Tooling landscape 003 — a Douyin hands-on tutorial on code-made video

Filed 2026-10-29. Source: a Douyin tutorial by the creator "Yali"
(account name in Chinese; a 915-follower AI-tutorial account), titled
"How does AI make videos with code? A zero-basics hands-on tutorial",
published 2026-10-23, 16:34 long, landscape, presented as text slides.
Engagement at check time (2026-10-29): 229 likes, 214 saves, 40 shares,
14 comments. Evidence level: watched read-only with chapter sampling;
the full prompt the author teaches from lives in his blog, which the
video page does not link and which was not reviewed. Companion files:
`docs/tooling-landscape-001.md` and `docs/tooling-landscape-002.md`.
The production main line is unchanged.

## What he teaches

Core stack: Claude Code driving Claude Opus 5.5. The mechanism, in his
framing: a video is a rapid sequence of still frames, so the model
writes a page whose input is time and whose output is the frame; the
browser renders each frame, frames are captured one by one and then
composited with voice and music. The capture and compositing tools are
not named in the video (neither Playwright nor ffmpeg appears), so our
exact route is not his stated route. Techniques palette he lists for
choosing per topic, lightest first: HTML layout, Canvas, p5.js, brush
tools, shaders, Three.js, Manim, Blender.

His four working rules: fix the direction before rendering anything;
tear down reference films frame by frame; make the model act as a
picky director reviewing its own output; use the music or the voice
track as the clock (upload it first and have the model verify duration
and format before writing code). Build a sample of about 30 seconds
first, then the full film. All four rules match our baseline workflow;
recorded as external validation, no baseline change. His sample length
(~30 s) is longer than our 15-20 s gate; noted, not adopted.

## The four projects he recommends

1. awesome-opus5-5-videos — already on our reference shelf
   (landscape 001). No action.
2. lemo-opuscar — our main line. His figures (4,600+ stars, 51 styles)
   are recording-time numbers; at our check on 2026-10-28 the repo
   stood at roughly 9,000 stars and the pinned catalog carries 59
   styles. No action.
3. HeyChengC/vibe-knowledge-film — NEW to our landscape: a skill built
   specifically to replicate the Vibe Knowledge contest format. It
   ships two styles (a "nocturne" style for deep or hard knowledge, a
   "fable" style for psychology and behaviour shown rather than told)
   and an engine document carrying a pitfall checklist meant to be
   pasted into the prompt up front: subtitle band placement in the
   lower frame zone, a minimum height for rig elements, half-second
   crossfades between overlapping segments, darkening source colours
   before adding glow to avoid blowout, particles drawn as plain
   rectangles rather than per-particle shadow or blur, and a
   quantified width check on the longest subtitle before lock.
   Verdict: joins huashu-art-motion in the named evaluation queue,
   second after it; the up-front checklist format is the part worth
   comparing against our own gates before Ep2. Not adopted, not
   installed.
4. JohnHeibel/PDoomVideo — a watercolour music-video replication in
   which the model wrote its own animation guide and shot list from a
   minimal brief. Reference shelf only.

## Positions recorded, not adopted

- Citing a third-party comparison of 16 video skills, the author
  argues against fetishising skills: the base model is capable enough
  on its own. Recorded as his position. Our measured position differs
  for this pipeline: this week the skill's gates (treatment,
  readcheck, still sheets) caught defects a raw model pass did not.
  The skill line stays.
- Sound: the tutorial itself was observed in web playback as
  near-silent text slides, and a commenter asked the same question;
  an intentionally silent original cannot be distinguished from a
  web-playback artefact on this evidence. His method, though, treats
  voice and music as the time anchor, so finished films in his method
  do carry sound.
- Audience signal: the visible comments cluster on account
  registration barriers for the agent tooling, not on technical
  corrections; the method content went unchallenged in the visible
  thread.

## Net effect

Baseline unchanged. Evaluation queue: (1) huashu-art-motion,
(2) vibe-knowledge-film, for its contest-specific styles and its
up-front pitfall checklist.
