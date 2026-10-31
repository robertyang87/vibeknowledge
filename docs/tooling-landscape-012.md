# Tooling landscape 012: wshuyi/remotion-video-skill - a Remotion workflow skill for Claude Code

Checked first-hand 2026-10-31 (repository metadata, full file tree,
SKILL.md structure and README read directly). Source: an X post by
@awe0_io listing five code-video projects; four of the five were already
in this index (HyperFrames, Remotion, Manim Community, video-shotcraft)
and this was the only new name. Filed at the owner's direction; no trial
authorised.

## Repository facts

- wshuyi/remotion-video-skill - "A Claude Code Skill for creating
  programmatic videos with Remotion framework."
- 440 stars, 76 forks, 3 open issues, one release (v1.8.3).
- Created 2026-01-25 and last pushed the same day: 2 commits in total,
  nothing since. The star count is still moving (the repository metadata
  was touched the day of this check), but the code is a single-day drop
  that has been dormant for nine months.
- The whole repository is 56 KB across six files. The substance is one
  SKILL.md (42 KB, about 33,000 characters), two Python TTS scripts
  (Edge TTS 2.6 KB, MiniMax 5.8 KB), one template (audioConfig.ts,
  841 bytes) and two READMEs. There is no Remotion code of its own; it
  instructs an agent to scaffold a Remotion project.
- Licence position is unverified: the README closes with the word MIT,
  but the repository contains no licence file and GitHub detects no
  licence. Until that is clarified, treat its text and scripts the same
  way this index treats other no-licence packs: ideas may be noted,
  code is not borrowable.

## What the skill does

- Install route: copy the folder into the Claude Code skills directory
  and trigger it by prompt. It then scaffolds a project with a Root.tsx
  composition, scene components, TTS audio under public/audio and a
  generated audioConfig.ts holding scene timing.
- Timing model: generate narration first (Edge TTS free, or MiniMax
  paid with voice cloning), measure each clip with ffprobe, and derive
  scene durations and the total frame count from the audio.
- Teaching content in SKILL.md: Remotion basics (interpolate, spring,
  Sequence), a tutorial architecture (scene-driven, with a camera
  controller pattern and a scene-switch hook), captions via
  @remotion/captions, 3D via @remotion/three, Lambda rendering, a
  3Blue1Brown style guide for tutorial videos, and a process-animation
  pattern set (StepByStep, ValueFlyIn, CompareHighlight,
  SlidingWindow).
- Notable bulk is pitfall notes: MiniMax TTS quirks, tutorial-video
  traps, 3D traps (WebGL context overflow, camera jitter, rotated grid
  images) and a resumable-work design note. Its TTS price references
  are dated 2025.
- SKILL.md is written largely in Chinese, with English code and terms;
  recorded here because it affects direct reuse in this repository,
  whose own documents are English only.

## Assessment

- This is downstream of Remotion, which the index already records as
  ecosystem context only: the single-harness rule keeps the directing
  discipline in Lemo-Opuscar, so a skill whose whole job is to stand up
  Remotion projects inherits that position. Adopting it would mean a
  second harness, which this account has repeatedly declined.
- Its timing model is a weaker relative of our one-timeline principle:
  scene timing derived from audio durations, but with no fact gate, no
  subtitle dwell check, no stills proof and no post-render review. The
  overlap confirms the shape of our pipeline without adding to it.
- The genuinely borrowable layer is vocabulary, by reading only: the
  four named process-animation patterns are a compact grammar for
  showing a computation unfold, the same kind of sharpening the
  shotcraft cards gave shot language. If a future episode needs that
  grammar, name the patterns in the Treatment; do not vendor the skill.
- The TTS routes add nothing here: Edge TTS and MiniMax are both
  already known quantities in the owner's wider stack, with local
  workarounds and gates of their own.

## Verdict

Reference shelf only. Not installed, no trial queued, no evaluation
queue position, and the main line is unchanged. Re-check only if the
licence is clarified and the author resumes pushing, or if a
Remotion-specific side project is ever started outside this account.
