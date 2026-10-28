# Tooling landscape 002 — four more field reports

Filed 2026-10-29. Sources: four X posts the owner shared the same night.
Evidence levels are marked per item; nothing here was hands-on tested by
us unless stated. Companion file: `docs/tooling-landscape-001.md`
(the 369-project survey). The production main line is unchanged:
Lemo-Opuscar, pinned; huashu-art-motion remains the named next
evaluation.

## 1. The Vibe Knowledge contest tutorial (@guanmo_ai, X article, 2026-10-20)

A complete playbook for Douyin's official Vibe Knowledge campaign,
written by a practitioner. Author-reported figures: the campaign
hashtag passed 1.2 billion plays; the leading account in the format
posted its first video on 2026-10-01 and reached roughly 662k
followers on Bilibili plus 127k on Douyin in 20 days; two further
accounts are cited at 8 posts / 1.165M likes and 34 posts / 212k
followers / 2.8M likes. Treat these as the article's claims, not
audited numbers.

Campaign facts (from the campaign page reproduced in the article):
submissions run until **2026-10-31**; quality entries receive official
traffic support (10k–100k+); to be seen by the officials the title
must start with the campaign name and the post must carry the
campaign hashtag; listed content directions are broad (science and
engineering principles, history stories, science concepts, art and
aesthetics, technical mechanisms, industry knowledge, everyday
knowledge) — a perception-science episode fits the letter of that
list. Participation is a publishing decision for the owner; it is
recorded here as a dated option, not adopted by default.

Method, and how it maps to our baseline workflow:

- One knowledge point per film; every shot serves the last line.
  Same as our topic gate.
- The first 2 seconds decide survival: no fade-in, no black opening
  frame, the hook line lands on frame one; a turn or a "guess?" beat
  every 10–15 s; an open question at the end to wake the comments.
  Matches the creator method in `docs/teardown-002` and our
  treatment rules.
- Four title patterns: (1) a counter-intuitive number or formula;
  (2) a current hotspot with the jargon translated into plain words;
  (3) an emotional pain point; (4) a classic or canonical motif run
  as a series. **Adopted** as a checklist at the topic gate (baseline
  Step 1 amendment, this filing).
- Style is extracted from a hit reference, never invented — "free
  invention ends up looking like an old PPT". Extraction parameter
  list: palette (background, main, accent, exact values), light
  (key direction, contrast, glow/vignette), texture (grain, noise,
  particles, blur), subtitles (font, size hierarchy, position,
  in/out motion and hold), rhythm (average shot length, cut style,
  relation to the music's beats), composition (subject position,
  negative space, portrait title/subtitle zones). **Adopted** as the
  extraction template at the brief step (baseline Step 3 amendment);
  it formalises what our benchmark step already does.
- 15-second sample before the full render; before that, a contact
  sheet of 9 key-moment stills is self-checked (occlusion,
  composition, exposure) and revised for **at least two rounds**.
  **Adopted** (baseline Step 5 amendment): our sample gate gains the
  two-round still-sheet rule.
- Every data point is source-checked before scripting; news topics
  are cross-checked across outlets. Same as our fact-card step.
- Music: pick a proven track from the CapCut library by mood,
  analyse BPM and first beat, cut on bar lines, trim whole phrases
  to length, fade the ending. Same proven-track rule as our Step 7.

Not taken: the article's embedded grey-market route to a cheap AI
account (out of scope for this project and against our own tooling
arrangements), and its one-prompt end-to-end framing — we run the
library's staged workflow with gates, which its own sample-first
rule agrees with anyway.

## 2. Creator Buddy / space-video (@Haosen9527, X article, 2026-10-28)

A suite of nine skills under one dispatcher (repo:
SpaceZephyr/creator-buddy). **Evidence level: the author states he
has not installed it — this is a documentation summary, untested by
him and by us.** Modules: a dispatcher that routes by task and
hands work over as files; topic (reference teardown from a link:
download, transcript, opening/structure/title analysis); script
(article to a speakable script with per-shot timing written in);
edit (transcribe, mark silences, slips, repeats and fragments on a
review page, cut only after the user approves the cut list);
b-roll (HTML-described animation rendered frame-wise to MP4);
b-roll-sketch (an article split into 6–10 hand-drawn diagram
frames — white ground, black line, one blue accent — then animated
by a video model); subtitle (segmentation by breath and meaning,
name and homophone proofing, SRT/ASS out, optional burn-in);
audio (edge-tts as the default voice route, Pixabay for music,
ducking and fades, loudness target about −14 LUFS); cover (fixed
palette and type, per-platform ratios and information hierarchy).

What we take:

- Its pre-step: **write down your expression and design habits
  first** — a few short rules (sentences you dislike, pause habits,
  palette, fonts, layout) that script, B-roll and cover all inherit,
  so a new topic does not restart the explanation. This is what this
  repo's docs and the standing production prompt already do;
  recorded as external validation.
- The b-roll-sketch format (hand-drawn diagram sequence) is a
  second explainer grammar worth a trial, filed on the reference
  shelf next to huashu-art-motion. Not adopted.
- Its audio module's licence caution joins our music step:
  royalty-free is not copyright-free — check each track's licence
  and keep the record. Our CREDITS file already logs music; when a
  library track is used at publish, log the licence evidence too.
- Its workflow warning: fix the voice timing first — if the speech
  rate changes after the timeline is locked, everything is
  re-timed. Mirrors the library's one-timeline rule; noted.

Not adopted: the suite itself. It is built around a talking-head
recording workflow (record, de-slip, patch with B-roll); our line
is code-drawn with no camera footage and no presenter.

## 3. Three survivors from 20+ code-video skills (@AIExplorerTim, X post, 2026-10-28)

One practitioner's keep-list after trying more than twenty
code-video skills (evidence: his post plus its comments; no
hands-on by us):

- **ClaudeAnimationBase** (JohnHeibel; about 2k stars per the
  post): cartoon/anime style, kept for cross-shot continuity —
  "eye-catching". Commenters name the genre's failure mode
  precisely: single shots look fine, strung together the style
  drifts; and complex camera moves can break it.
- **mg-styles-15** (Vincentwei1021): a 15-style motion-graphics
  prompt set (the post links a single prompt file). Filed on the
  reference shelf beside awesome-opus5-5-videos.
- **video-shotcraft** (Vincentwei1021): already filed in
  landscape-001 as a reference; this is a second independent
  endorsement. Standing unchanged.

What we take: the selection criterion itself. A practitioner who
kept 3 of 20+ kept them for **continuity across shots over
single-shot beauty** — the same law our camera grammar, one
timeline and dense-frame review enforce. Recorded as external
validation of the review loop. ClaudeAnimationBase is a cartoon
lane, not our explainer lane: landscape only.

## 4. Ten open-source AI-video projects (@wanerfu, X post, 2026-10-28)

A link list with one-line descriptions and no evaluation behind it
(evidence level accordingly). Most of it is the generative-model
lane this project deliberately does not use — video models and
image animation (LTX-2, ComfyUI WanVideoWrapper, CogVideoX, VACE,
DiffSynth-Studio) and lip-sync (MuseTalk). Our films are drawn in
code; no video model is involved, per the baseline workflow.

The rest, all landscape only, nothing adopted:

- **OpenChatCut** — its second mention in a week (also
  landscape-001). Standing unchanged: conversational timeline
  editing is not our change surface; ours is code.
- **FireRed-OpenStoryline** — plain-language editing agent with
  reusable skills and consistent style; same family as OpenChatCut.
- **AutoSubs** — local subtitle generation handed into Resolve /
  Premiere / After Effects. Our SRT flow lives inside the library.
- **Editly** — declarative, programmatic video assembly via CLI or
  API. A code-assembly relative worth knowing exists.

One corroborating comment under the post: for this class of tools,
the most time-consuming part is getting the environment running —
which matches our install-and-smoke-test-before-committing
discipline.

## Standing after 002

- Main line: Lemo-Opuscar (pinned). Next evaluation:
  huashu-art-motion. New reference-shelf entries: mg-styles-15,
  the b-roll-sketch format, Editly.
- Baseline amendments filed with this note: four title patterns at
  the topic gate; the style-extraction parameter list at the brief
  step; two still-sheet revision rounds before a full render.
- Dated option, owner's call: the Douyin Vibe Knowledge campaign
  runs to 2026-10-31 under a title-prefix plus hashtag entry rule.
