# Tooling landscape 017: four new names from the daaihq list - huashu-motion, teardown, vibe-knowledge-film, animate

Checked first-hand 2026-11-03 (GitHub API repository data and
each README read directly). Trigger: an X post by @daaihq
(2026-11-03) listing eight Claude video-making projects. Three of
the eight were already on record here: anatomy (landscape 016,
filed the same day), lemo-opuscar (the main line itself; upstream
now 11,409 stars, still 66 styles) and patch-gg/pixelfx
(landscape 013; now 3,790 stars, and the post's "244 effects" is
its 232 effects plus 12 character actions counted together). The
four below are new and are filed at the owner's direction. The
eighth name, showheyohtaki/motion-prompt, is recorded in one line
at the end: its star count in the source post was inflated.

## 1. alchaincyf/huashu-motion - product launch films, point-at-the-frame editing

- 2,180 stars, 213 forks, MIT, created 2026-10-18, last pushed
  2026-10-22, about 43 MB. An agent skill for commercial product
  launch films and promo motion, with a workflow that also
  exports JianYing draft projects.
- Two methods worth recording. First, the revision loop: press C
  in the preview, click the exact spot on the frame and write
  what to change; the comment travels with its timestamp, scene,
  element and source position, the agent zooms into that frame
  region before editing, changes only that spot, and keeps every
  version (undo at any time); plain values such as titles,
  numbers, colours and hold durations become direct editor
  fields. Second, composer mode: the agent writes a text score
  (ABC notation) whose markers align to the scenes, performed
  locally from instrument samples - score first, film second,
  no paid music API.
- Model-agnostic in practice: its own demo reel was made with a
  low-cost model (DeepSeek V4.1 Flash, one 22-second film for
  about CNY 1.95 of API spend) with the skill supplying the
  unified palette, motif and beat-locked music.
- Assessment: a different lane from this account (product promos,
  not knowledge films). Reference shelf for two borrowable ideas
  only: point-at-the-frame commenting as a revision interface,
  and score-first local music generation. Not installed.

## 2. elvarofficial/teardown - machines as take-apart 3D simulators, filmed frame by frame

- 1,438 stars, 217 forks, MIT, created 2026-10-30 (four days
  before this check; the source post's figure of about 1,280 was
  already stale), last pushed 2026-10-31, about 18 MB.
- A Claude Code skill that builds any machine as one offline
  HTML page: the machine runs in the middle, the panels around
  it read the real numbers from the same model, a button opens
  the part doing the work, and an idle page tours itself. Three
  complete machines ship as examples (a V8 engine, a Cessna, a
  Strandbeest), each split into the machine model, the live page
  and the filmed tour.
- The film route matters: a capture script renders the tour
  frame by frame to a 60 fps MP4, or to review sheets of stills;
  procedural sound is mastered to -14 LUFS. Built on
  whaleyxbt/claude-motion (MIT), from which the runtime, frame
  capture, sound engine and review rules come.
- Assessment: the natural pair to anatomy (landscape 016) - the
  same mechanism-as-explanation grammar, one shelf up in
  dimension: where anatomy draws the figure, teardown runs the
  machine and can be filmed deterministically. Reference shelf:
  borrow the model / live page / film split and the
  capture-to-review-sheets loop by reading. Not installed; at
  four days old it is a watch item, not a trial candidate.

## 3. HeyChengC/vibe-knowledge-film - a genre peer with a split licence

- 965 stars, 98 forks, created 2026-10-06, last pushed
  2026-10-13, about 47 MB. GitHub reports its licence as
  NOASSERTION; its own README resolves the split: the engine,
  scripts and method documents are MIT (a licence file exists),
  while two bundled worked examples and the filled-in briefs in
  its references are teardowns of other creators' hit films and
  are learning material only, not publishable as one's own work.
- A skill aimed squarely at this account's genre: it was written
  in response to the same Douyin Vibe Knowledge campaign this
  account deliberately stayed out of. Two modes distilled from
  hit films: Nocturne for abstract, hard knowledge, and Fable
  for psychology and behaviour acted out as a story. Given a
  script or a topic it confirms content first, writes subtitles
  and a shot table, then builds a code project (Canvas frames
  captured through a local Chrome, frame by frame) and delivers
  a roughly 30-second sample before the full film.
- Assessment: reference shelf, read-only. Borrowable: the
  two-mode genre split as a positioning read, nothing else; its
  sample-first gate merely matches our own baseline. The split
  licence is the standing caution: method yes, bundled examples
  never.

## 4. cth9191/animate - style plug-ins behind a three-gate approval chain

- 1,432 stars, 184 forks, MIT, created 2026-10-04, last pushed
  2026-10-05 (quiet for a month at this check), about 9 MB.
- A Claude Code skill that draws short animated films on one
  canvas, deterministically frame by frame, rendered to MP4
  with a headless browser and ffmpeg. Seven built-in styles
  (cut paper, crosshatch ink, riso print, sketchbook, math,
  pixel, isometric) plus an eighth slot: a new look matched
  from the user's own references. A style is a plug-in supplying
  the drawing kit while story grammar, timing, sound and the
  renderer stay fixed.
- Its workflow is the notable part: intake questions, then three
  cheap approvals before any animation is spent - a numbered
  beat table with facts web-checked, full-size style frames
  approved one by one, and a storyboard approved panel by
  panel - then a delivery check that measures cuts against the
  beat grid, loudness arc, hero anchoring and narration pace.
- Assessment: reference shelf. The gate chain independently
  converges on this repo's own baseline discipline (facts
  checked at the beat table, stills approved before motion,
  delivery measured rather than eyeballed); borrow the
  style-plug-in split by reading. Not installed, and stale.

## Checked, not filed

- showheyohtaki/motion-prompt (1,160 stars, MIT, pushed
  2026-10-29): 15 motion-graphics styles as a prompt library.
  The source post claimed about 2,900 stars, roughly 2.5 times
  the real figure. Prompt libraries are already covered here;
  no filing.

## Verdict

All four to the reference shelf: none installed, no trials, no
evaluation queue positions, no change to the main line. The two
ideas with lasting value are huashu-motion's point-at-the-frame
revision loop and the anatomy / teardown pair's shared rule -
one model drives the machine, the numbers and the film.
