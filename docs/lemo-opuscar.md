# Lemo-Opuscar: our production library

## What it is

Lemo-Opuscar (https://github.com/lemomo-ai/lemo-opuscar) is a library
of film styles made entirely in code, built for Claude Code by Lemomo
and released under the MIT license. Each of its 59 styles ships with:

- a `STYLE.md` that fixes the style: look, color, type, motion,
  camera grammar, sound palette, and known pitfalls;
- one demo film made entirely in code, with its source, so techniques
  can be learned from working code;
- guides for the directing and building process (`AGENTS.md`,
  `DIRECTOR.md`, `TECHNIQUE.md` in the library root).

There is no video generation model in this pipeline. An agent directs
and writes code; frames are drawn with Canvas, WebGL, or Three.js;
voice and music are synthesized; ffmpeg assembles the film. That is
why text stays sharp, diagrams stay exact, and a light path can be
made to reflect at a correct angle: every frame is a function of
time, computed, not sampled.

## Why this library

The reference format studied in `docs/teardown-001-fiber-photo.md`
is a code-made schematic explainer: a following camera, exact
diagrams, clean title cards. That is this library's native output.
Adopting it gives vibeknowledge a proven style system and a written
production workflow instead of a blank page. (Adoption is our own
decision, recorded here; the library's author does not endorse or
certify any particular creator's use of it.)

## How it is vendored here

- Location: `vendor/lemo-opuscar`, a git submodule.
- Pinned commit: `413a6bd6d78ebd3bdd5abaec9538a26867f890df`
  (upstream `main`, 2026-10-24). The pin is the version every
  episode renders against until it is deliberately bumped.
- Get it after cloning: `git submodule update --init`
- Never edit inside the submodule. Per the library's own rules,
  work happens in the film's project folder; copy techniques and
  assets there.
- The submodule is upstream third-party content. Our English-only
  rule applies to files we author, and `tools/check_language.py`
  skips submodule paths.

## The library workflow we follow

From the library's `AGENTS.md`, condensed:

1. **Brief.** One round of questions: topic facts that cannot be
   decided alone, the user's own material (voice, music, photos,
   fonts, data), the film's language, and whether a storyboard
   review is wanted.
2. **Treatment.** Write `TREATMENT.md` with three candidate
   structures and the chosen one, before opening any demo. Demos
   teach technique, never story.
3. **Look.** Render style frames with the real drawing code and
   check them against the style's `STYLE.md`.
4. **Storyboard.** Only if the brief asked for one; then stop for
   approval.
5. **Produce.** Voice, then a speech check; score in parallel;
   animation; mix; render.
6. **Self-check and deliver.** Run the delivery checklist in
   `DIRECTOR.md` section 11 before calling a film done.

Directing rules worth keeping open while working (`DIRECTOR.md`):
find a benchmark first; sound is half the film; set the music grid
before cutting picture; every shot needs a reason; copyright red
lines are a separate chapter, not a footnote.

## Styles most relevant to knowledge explainers

From the library gallery (https://lemomo-ai.github.io/lemo-opuscar/):

- Evidence Films: Satellite Briefing, Engineering Briefing Board,
  LiDAR Survey, Data Physicalization, Exploded Teardown,
  Microscope Story.
- Hand-drawn and Painting: Whiteboard Explainer.
- Edit and Documentary: Caption News, Visual Investigation,
  Broadcast News Package.

Start from one of these families for a science explainer like the
fiber reference. Choose the style in the brief, not mid-render.

## Using the library as a Claude Code skill

Upstream also ships the library as a skill: its `setup.sh` clones
or updates a working copy (default `~/lemo-opuscar`) and the skill
is launched as `/lemo-opuscar:lemo-opuscar`. The submodule in this
repository is our pinned reference copy; a working clone used for
rendering may live outside this repository, but it must be checked
out at the pinned commit for an episode render.

## Updating the pin

1. Review the upstream changes since the current pin.
2. Move the submodule to the new commit in its own commit here,
   with an English commit message that names the new pin.
3. Re-render one known style frame and compare it with the frame
   from the old pin before using the new pin on an episode.
