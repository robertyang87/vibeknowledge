# vibeknowledge

A production workspace for creating **vibe knowledge videos** — short,
visually driven explainer videos that turn one interesting question into a
clear, memorable, and shareable story.

The reference style is the kind of AI-assisted science explainer popular on
Douyin: a strong everyday hook, a journey the viewer can follow visually,
and a payoff that makes an invisible process feel concrete.

Example hook:

> You send a photo from Shanghai. Your friend in Los Angeles sees it
> 0.07 seconds later. What did that photo actually travel through?

## What this repo is for

- Developing topics for knowledge explainer shorts
- Fact-checking the science and numbers behind each script
- Writing narration scripts and storyboards
- Generating and organizing visuals, voiceover, and edits
- Recording what was made, what worked, and what to reuse next time

## Production workflow

1. **Topic** — Start with one question anyone can relate to, not a lecture topic.
2. **Fact check** — Verify every number, distance, time, and claim against a
   reliable source before writing. Keep the sources with the topic.
3. **Script** — One hook, one journey, one payoff. Short sentences written
   for voiceover, not for reading on a page.
4. **Storyboard** — One visual idea per narration beat. Every shot must show
   what the narration is talking about at that moment.
5. **Visuals** — Generate or source each shot, then check it for physical
   plausibility, consistency, and obvious AI artifacts.
6. **Voice and edit** — Record or synthesize the voiceover, cut to the
   narration, and add captions, sound, and music underneath — never over —
   the voice.
7. **Review** — Watch the full cut once for facts and once for feel. Fix
   anything a first-time viewer would not understand in one pass.
8. **Publish and log** — Ship it, then record the topic, sources, final
   script, and result so the next video starts from this one.

## Principles

- **Facts first.** A beautiful shot never rescues a wrong number.
- **One video, one question.** If it needs a second question, it is a second video.
- **Show the journey.** Prefer a visual path the viewer can follow over
  abstract slides or text cards.
- **No filler visuals.** Every shot earns its place by explaining something.
- **Reuse what works.** Hooks, shot patterns, and workflows that perform
  well get documented here, not rediscovered.

## Planned structure

```text
topics/       Topic ideas, research notes, and source links
scripts/      Approved narration scripts
storyboards/  Shot-by-shot plans for each episode
assets/       Generated images, clips, audio, and music references
episodes/     One folder per finished video, with its final script and log
docs/         Workflow notes, style rules, and reusable checklists
tools/        Small checkers and helpers, including the language check
```

## Production library: Lemo-Opuscar

Films in this project are made in code with
[Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar), a library of
59 film styles for Claude Code by Lemomo (MIT license). It is vendored
here as a git submodule at `vendor/lemo-opuscar`, pinned to a fixed
upstream commit so every episode renders against a known version.

```bash
git clone --recurse-submodules <this repo>
# or, in an existing clone:
git submodule update --init
```

Rules for the vendored copy:

- Never edit files inside `vendor/lemo-opuscar`. Copy what an episode
  needs into that episode's project folder and change it there.
- The English-only language rule covers our own files. Upstream
  submodule content is third-party code under its own license and is
  excluded from the language check (the checker skips submodule
  paths).
- Bump the pin deliberately, in its own commit, and record the new
  commit in the episode log of the next film made with it.

How we use it, step by step: see `docs/lemo-opuscar.md`.

## Language policy

**English only, with one narrow exception.**

- All code, code comments, documentation, file and folder names, branch
  names, issues, and commit messages in this repository must be in English.
- The only place another language may appear is in the audience-facing
  copy of a video itself: its narration script, on-screen text, captions,
  title, and publishing copy, when that video is made in that language.
- Copy files live only in `scripts/` or in an episode's `copy/` folder
  (`episodes/<episode>/copy/`). Anywhere else, non-English text is a
  defect and must be removed, even inside a quote or an example.
- Run `python3 tools/check_language.py` before committing. It fails if
  Chinese characters appear outside the copy locations above.


## Status

Created on 2026-10-28. The first task is a teardown of the reference video
above: how it was scripted, generated, and edited — and which parts of that
pipeline this repo will adopt.
