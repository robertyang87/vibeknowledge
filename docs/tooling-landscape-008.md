# Tooling landscape 008 - a field list of 20 code-driven video tools (X post)

Source: X post by @tkz_aiart (a Japanese account that tests AI video
tools hands-on), posted 2026-10-29 14:20, about 11.3k views, 295
bookmarks at check time (2026-10-30). First-hand reading of the post;
the list itself is the author's selection, not a benchmark.

## What the post lists
Twenty free, code-drivable open-source tools in seven groups: engines
(Remotion; HyperFrames by HeyGen), animation (Anime.js; React Spring),
2D drawing (PixiJS; p5.js; Paper.js), 3D and physics (Matter.js;
Three.js; Rapier), effects and assets (OGL; tsParticles; glTF Transform;
GL Transitions), recording, audio and subtitles (OBS Studio; Chatterbox
by Resemble AI; Tone.js; faster-whisper), editing and export (OpenCut;
FFmpeg). One reply adds Motion Canvas as a twenty-first candidate.

## Overlap with our shelf
Already known, used, or queued here: Remotion (engine under the
shotcraft skill; recorded, not adopted - single-harness rule),
HyperFrames (evaluation queue, render-backend A/B candidate), Three.js
(the Ep1 world), Paper.js (Blueprint prototype), faster-whisper and
FFmpeg (infrastructure). The post is external confirmation of the stack,
not new information, for these six.

## Genuinely new names for this shelf
- Chatterbox (resemble-ai/chatterbox) - open-source AI narration /
  text-to-speech. Relevant the day a knowledge episode needs a spoken
  track rather than caption-carried narration; candidate for a listening
  test at that point, not before.
- GL Transitions (gl-transitions/gl-transitions) - a library of shader
  transitions. A cheap quality increment for drawn films if a transition
  vocabulary beyond cuts and grows is ever wanted.
- Matter.js and Rapier - 2D and 3D physics engines. The baseline
  requires animation to convey information precisely; a real physics
  solver beats hand-tuned motion for mechanics demonstrations.
- Noted and passed over: PixiJS and OGL (alternative WebGL lanes; no
  gap they fill today), p5.js (sibling of the Paper.js lane), OpenCut
  (timeline editor; conflicts with the code-exact timeline, see the
  index's rejected editor lane), OBS Studio (recording, not our route),
  glTF Transform (asset optimisation; only if external 3D models enter).

## Disposition
Reference shelf. No adoption, no queue change: HyperFrames stays the
next backend experiment, and the three names above are recorded so a
future need (narration voice, transition vocabulary, physics
demonstration) starts from this page instead of a fresh search.
