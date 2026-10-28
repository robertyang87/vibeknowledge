# Tooling landscape 001 — agent-made video, distilled for this project

Source: Liu Laoban (@leo_xiaolei), "I evaluated 369 Claude/Codex
AI-video and auto-editing open-source projects", X long article,
2026-10-27 (43k views, 804 bookmarks at read time). His method is
worth keeping on its own: he refuses the GitHub star filter (stars
do not equal production value; brand-new low-star repos often solve
the sharpest problems) and admits a project only if it (1) outputs
video or motion an agent can re-render, (2) is built to be called
by an agent (Skill, plugin, MCP, or an agent toolkit), and (3) has
a complete README. Star counts below are his 2026-10-27 GitHub API
snapshot, not live figures.

## Where this project already stands

- **lemo-opuscar** (lemomo-ai/lemo-opuscar; his snapshot: 8,322
  stars) is ranked first in his survey and is already this
  project's adopted production library (vendored, pinned at
  413a6bd6 — see docs/lemo-opuscar.md). Nothing to change.
- Watch item: upstream is moving fast. The author's own update
  post (2026-10-22, embedded in the survey) announces 8 new
  real-footage documentary editing styles, a shift from "style
  library" to "style-making toolbox" (adapt an existing style
  into a house asset), and one-click install via the Claude
  plugin marketplace. Before episode 2, diff upstream main
  against our pin and decide what to take; do not drift the pin
  mid-episode.

## Candidates, in the order we would evaluate them

1. **huashu-art-motion** (alchaincyf/huashu-art-motion; 5,418) —
   the strongest candidate for this project. Where Opuscar ships
   styles, Huashu ships an explanation method: 36 art styles,
   **9 explainer grammars**, 8 parameterized segments, and a
   no-voiceover animation practice. That maps directly onto our
   format (no voiceover; the picture must explain). A creator
   quoted in the author's follow-up post reports a science video
   made with this skill passing 100k plays in 5 hours on Douyin.
   Status: evaluate next, after episode 1 closes; trial rules
   from docs/baseline-workflow.md apply (a trial stays a trial
   until a measured pass, never a mid-episode swap).
2. **huashu-motion** (alchaincyf/huashu-motion; 1,766) —
   commercial product films; workflow is brief, three creative
   directions, confirmation, full write-up, ABC-notation score.
   Its killer feature is an interaction, not a style: press C in
   the preview, click any frame, type the change, and the agent
   revises that exact spot. Status: do not adopt for knowledge
   films; **borrow the interaction** — point-at-frame feedback is
   how sample-gate revisions should be given and recorded here.
3. **sweety-handdraw-video** (threerocks/sweety-handdraw-video;
   903) — a hand-drawn explainer pipeline: topic or draft in,
   script, storyboard and illustrations out, stroke-order
   handwriting, frame-level audio-visual alignment, VoxCPM 2
   voice synthesis, Codex-friendly. Status: reference for a
   possible hand-drawn lane and for its voice option if an
   episode ever wants narration; not needed for episode 1.
4. **awesome-opus5-5-videos** (yihui-dev/awesome-opus5-5-videos)
   — a bank of 703 Opus 5.5 code-film prompts. Status: reference
   shelf. When a shot needs an effect we cannot name, search the
   bank before inventing one.
5. **video-shotcraft** (Vincentwei1021/video-shotcraft) — 152
   structured shot-recipe cards and 209 motion previews for
   Remotion commercial work. Status: reference for shot-list
   design (our treatments already write shot lists; this is a
   vocabulary source, not a toolchain change).
6. **motion2code** (lovisdotio/motion2code) and **cutloupe**
   (bryankwandou/cutloupe) — verification ideas. motion2code
   rebuilds an existing motion video as SVG/GSAP with
   frame-accurate comparison against the original; cutloupe
   feeds real rendered frames back to the model so it can see
   its own edit. Status: reference. Both mirror this project's
   existing discipline (dense frame checks, verify from the
   delivered file); revisit if our review loop needs tooling.
7. **video-use** (browser-use/video-use) — transcript-first
   automatic editing of real footage (word-level cuts, filler
   removal, subtitles, colour via FFmpeg; the model cuts on text
   logic and does not see frames). Status: landscape only; our
   films are code-drawn, but the transcript-first rough cut is
   noted for any future real-footage episode.

## Explicitly not adopted

- Digital-human presenter tools (lanshu, digital-human-koubo):
  this account has no presenter, by format.
- Music-video codebases (PDoomVideo, mondo-music-video): out of
  scope for knowledge shorts.
- Timeline editors for human fine-tuning (OpenChatCut, BaoCut):
  our change surface is code and timestamps, not a timeline UI.

## Rule carried into the baseline

Tool selection for this project follows his first lesson, not
the star chart: fit to the format, agent-callable, documented —
then a measured trial under docs/baseline-workflow.md before
anything touches the main line.
