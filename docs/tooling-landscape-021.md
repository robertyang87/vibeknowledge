# Tooling landscape 021: JuneYaooo/rea-video - shot-by-shot reverse engineering of reference videos, with a trial plan

Checked first-hand 2026-11-03 (GitHub API repository data and
README read directly). Trigger: an X post by @ganfanren_ai
(2026-11-03). Filed at the owner's direction, together with
the trial plan at the end of this document. The trial is a
plan only; nothing has been installed or run.

## Repository facts

- 78 stars, 19 forks, created 2026-10-29 (five days before
  this check), last pushed 2026-11-02, about 52 MB, no open
  issues yet. Very young and small: nothing about its
  durability is proven.
- NO LICENCE. The repository carries no licence file, so all
  rights are reserved by default. The author's stated terms
  are that learning and research use are welcome and
  commercial use needs permission first. Consequence for this
  repo: read its method and its published case reports freely;
  copy none of its code into any production line; any use
  beyond local study waits for the author's permission.

## What it does

- An agent-side tool (driven from Claude Code, Codex and
  similar) that reverse-engineers a video file shot by shot.
  Each shot is classified into one of seven kinds: real
  footage, AI-generated, digital human, 3D or animation, code
  or template motion, screen recording, or a mixture resolved
  shot by shot. For each kind it emits a different teardown:
  camera sessions and positions, shot sizes, camera movement,
  lighting (twelve schemes with gear) and colour grade for
  real footage; the evidence for the judgement, an inferred
  prompt, and a merged generation count for AI shots; text,
  layout and motion rhythm, rebuildable as a Remotion
  project, for code shots.
- Beyond the picture: subtitle lines with in and out times
  (exportable as SRT or ASS) and caption styling; sticker and
  picture-in-picture placement; cut points and beat fit; the
  voice (human or synthetic), the music (generated or library,
  with BPM) and sound-effect hit points; and a list of assets
  the user must supply themselves.
- Output is threefold: a one-line verdict (the README's
  example shape: "AI video 41 percent plus code interface 59
  percent, 8 seconds of real screen recording, library music
  at 122 BPM"), a replication plan split by real, AI and
  code, and a full report.html with per-shot screenshots,
  judgement evidence and inferred prompts. Four complete
  case reports ship in the repository.
- It runs offline with local tools alone (ffmpeg, Python
  3.10 or later); a vision model (Gemini or Doubao class) can
  be attached for harder shots, billed by usage.

## Claimed accuracy, with its limits stated

The author publishes his own test numbers: over 98 percent
shot-classification accuracy on original files with the tool
alone, 88.6 percent on platform-compressed downloads with the
tool alone, back above 99 percent with a vision model
attached. The set behind those numbers is 41 videos in total
(15 tuning, 16 held out, 10 platform-recompressed) and the
judge is the author. Treat the figures as a hypothesis sized
for exactly the trial below, not as a result.

## Why it is on this shelf

Teardown of benchmark videos is an upstream step this
account already pays for in agent time: the 45-video Iwanau
audit, repeated single-video teardowns, all done by hand
with dense frame sampling. rea-video is the first tool seen
here that structures that exact step - classification with
evidence, per-shot method, replication plan - instead of
another production tool. If it works, it slots between topic
selection and production; it does not touch the main line.

## Trial plan (owner-approved to draft, not yet to run)

Scope: three videos whose ground truth is already known to
us, one per class that matters:

1. One of this account's own published episodes (code film;
   ground truth total - we wrote every line of it).
2. The benchmark tennis-addiction video torn down by hand
   for Ep2 (peer code film; dense-frame notes already on
   file to score against).
3. One official real-footage interview clip from the tennis
   material library (real footage; production record known).

Method: tool-only pass first (offline, no attached model),
then, only if the first pass leaves shots unresolved, a
second pass with a vision model attached. Both passes scored
against the known ground truth on four measures: shot
classification agreement; whether each shot's stated
evidence is actually visible in the frames; whether the
inferred prompts and replication plan are usable or generic;
report completeness against our own teardown checklist.

Pass mark, fixed before the run: classification agreement of
at least 90 percent of shots on all three videos, with zero
real-footage shots misread as generated or the reverse, and
evidence statements that survive spot-checking. Below that,
it stays a read-only method reference and the trial closes.

Bounds: local study only under the no-licence rule above;
reference videos are copies already held for teardown work;
no output of the trial feeds a published video. Time and
cost are estimates only: setup plus three videos should fit
in one working session, and the optional vision-model pass
is the only metered spend.

## Verdict

Reference shelf with a drafted, bounded trial awaiting the
owner's go. Not installed; the trial does not run on the
strength of this filing alone.
