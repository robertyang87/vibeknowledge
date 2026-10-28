# Baseline Workflow: How a Vibeknowledge Video Gets Made

This is the project's standard production workflow. It merges
three sources, and each step names its source so future edits can
tell borrowed practice from our own rules:

- **[Creator]** the reference creator's stated method, from his
  retrospective video (see `docs/teardown-002-creator-retrospective.md`).
- **[Library]** the Lemo-Opuscar workflow (see `docs/lemo-opuscar.md`).
- **[Ours]** rules this project adds on top, mostly about facts.

## The format in one line

One everyday question, answered by one visual journey, made
entirely in code, with music doing the emotional work. [Creator]

## Step 0. Setup (once, not per episode)

- The library is installed and pinned (`vendor/lemo-opuscar`,
  `docs/lemo-opuscar.md`). Renders happen against the pin.
- The standing general prompt (step 4) lives in this repository
  and is versioned like code. [Creator: the two-part prompt]

## Step 1. Topic gate

A topic passes only if all four are true:

- It is a phenomenon from everyday life that the viewer has
  personally experienced. [Creator]
- It can be asked as a counter-intuitive question that starts
  with "you". If the question does not surprise, the topic does
  not ship. [Creator]
- The answer is a journey the camera can follow from a start to
  an end (a photo crossing an ocean, heat leaving a chip, a
  signal reaching a satellite). No journey, no video. [Ours,
  generalized from teardown 001]
- Every number the question needs can be sourced. [Ours]

Best-fitting categories per the creator: general science,
psychology, Nobel Prize stories. [Creator]

## Step 2. Fact card [Ours]

Before any scripting, write the episode's fact card in the topic
folder: each claim the video will make, its number, and its
source. The reference creator's flagship number was challenged
in his own comments for being idealized; our defense is that the
fact card exists before the edit, and any idealized figure is
labeled as idealized in the video itself.

## Step 3. Brief and style [Library]

One round, in writing: the topic facts that cannot be decided
alone, any material of the user's to include, the film's
language, and one library style chosen from `styles/` in the
vendored library (for science explainers, start from the Evidence
Films family). Decide the voice question here too: the reference
creator ships with **no voiceover** [Creator]; the library
workflow defaults to a synthesized voice [Library]. This project
decides per episode, at brief time, and records the decision.

## Step 4. Treatment, then prompts

- Write `TREATMENT.md` with three candidate structures and the
  chosen one, before opening any demo code. [Library]
- Then write the two-part prompt [Creator]:
  1. the standing general prompt (house style: caption size,
     color, highlight color, title cards, palette, safe areas);
  2. the content prompt for this episode, built from the
     treatment and the fact card.
- Audience-facing copy produced here (narration script, captions,
  titles) is stored under `scripts/` or the episode's `copy/`
  folder, per the language rule in `CONTRIBUTING.md`.

## Step 5. Fifteen-second sample gate

Two checks that are the same gate, seen from both sources:

- Build a sample of about 15 seconds first; never build the full
  video first (the creator's figure for full-first is about 30
  minutes per video, with results that are hard to adjust).
  [Creator]
- Render the sample with the real drawing code and check the
  look against the style's `STYLE.md`. [Library]

The sample must pass three tests before full production:

- **One-second test:** the counter-intuitive question is on
  screen, legibly, within the first second. [Creator]
- **Sync test:** every caption change in the sample has a
  picture change with it. [Creator]
- **Fact test:** every number on screen matches the fact card.
  [Ours]

## Step 6. Full production [Library order]

1. Voice, if the brief chose one, then the speech check.
2. Animation: build the full timeline in code, one timeline
   driving picture, captions, and sound together.
3. Score: choose the music now (step 7), set the rhythm grid,
   then finish the picture against it. [Library: music grid
   first]
4. Mix and render against the pinned library version.

Change requests after this point are code edits with a named
timestamp ("brighten second 8"), never regenerations. [Creator]

## Step 7. Music [Creator]

- Use a track with proven traffic, ideally the same track a
  viral video in the same format already used, via the
  platform's same-track feature where one exists.
- Record the track name and where it came from in the episode
  log; a track we cannot name does not ship.

## Step 8. Self-check before delivery [Library checklist, plus Ours]

- Watch the full render once for facts against the fact card,
  once for feel at full screen with sound.
- Dense frame check (at most 2 second intervals) for drift:
  geometry that changes size, light paths that stop obeying the
  diagram, text that garbles, routes that multiply.
- Opening check: first frame, first second, first line, in that
  order.
- Language check: `python3 tools/check_language.py` passes.
- Real images, if any, are credited on screen (pattern observed
  in teardown 001).

## Step 9. Publish and log

- Publish to Douyin, Kuaishou, and Xiaohongshu; the reference
  creator's flagship drew meaningfully on all three. [Creator]
- Log the episode in its folder: topic, fact card, treatment,
  prompts used, style and library pin, track, links per
  platform, and view counts at 24 hours and 7 days.
- Expect the base rate: in this format, not breaking out is the
  norm; the log, not the mood, decides what the next topic
  changes. [Creator's closing point, adopted]

## Deliverables per episode

```text
episodes/<episode>/
  fact-card.md       Every claim, number, and source
  TREATMENT.md       Three structures, one chosen
  prompt-general.md  The standing prompt version used (link is fine)
  prompt-content.md  This episode's content prompt
  copy/              Narration, captions, titles (the video's language)
  build/             The film's code project
  renders/           Sample (15s) and final renders
  log.md             Style, pin, track, links, 24h and 7d numbers
```
