# Tooling landscape 019: Vincentwei1021/mg-styles-15 - fifteen motion styles published with film, prompt and full source

Checked first-hand 2026-11-03 (GitHub API repository data,
README and file tree read directly). Trigger: a Portuguese
list post by @victorpfreitas (2026-11-02) of eight
Claude-video repositories. Only this one is filed, at the
owner's direction; the other seven are recorded in one line
each at the end.

## Repository facts

- 2,962 stars, 367 forks, MIT with a licence file, created
  2026-10-02, last pushed 2026-10-05. About 568 MB - the
  finished films are committed in the repository, which is
  why it is heavy; browse it on its showcase page rather than
  cloning it.
- The author is Vincentwei1021, whose video-shotcraft is
  already on record here (landscape 006; the account's shot
  list vocabulary and the subject of an owner-run trial on
  2026-10-30). This is the same author's style specimen
  library.

## What it is

- Fifteen motion-design styles, one 10-second film each, all
  made by Claude Opus 5.5 writing code. For every style the
  repository publishes the complete set: the film with sound,
  the style notes, the full prompt, and the entire source.
- No image or video generation anywhere: the picture is code
  (SVG, Canvas, WebGL, Three.js; Blender renders the one 3D
  film), and the sound is code too - each film's audio script
  synthesises its music and effects from 103 recorded
  instrument samples. A few films use CC0 or public-domain
  photographs.
- Same render architecture as this repo's main line: every
  film is a web page that draws the frame for any time given
  to it, captured frame by frame in headless Chrome and
  joined with ffmpeg. Each film went through two review and
  revision rounds, and the AI jury's scores are published
  (7.57 to 8.21 of 10), along with the rubric itself.
- The prompt structure is the reusable part: in each prompt
  only the "Creative seed" block is story-specific; replacing
  the seed, brand, copy and colours is the documented route
  to a film of one's own.

## Assessment

- Reference shelf, beside video-shotcraft: where shotcraft
  supplies the shot vocabulary, this supplies complete worked
  specimens - a style can be studied end to end (look, prompt,
  code, score) instead of guessed from a preview. It is a
  motion-graphics library, not a knowledge-film system, and
  under the single-harness rule nothing here is adopted or
  installed; read the prompts and the rubric when a style
  question is open.
- Cross-reference that closes an earlier loose end: landscape
  017 recorded showheyohtaki/motion-prompt at 1,160 stars
  against its source post's claim of about 2,900. This
  repository's real figure is 2,962 - the earlier post most
  likely conflated two same-shaped "15 styles" projects.

## The other seven from the same list (checked, not filed)

- lemomo-ai/lemo-opuscar: the main line itself; the post's
  "51 styles" is stale (the pin carries 59, upstream 66).
- yihui-dev/awesome-opus5-5-videos (13,348 stars, MIT): the
  prompt catalogue deep-checked on 2026-10-21 at 7,217 stars -
  a curated index and marketing funnel whose prompts are too
  thin to reproduce the films. It has nearly doubled since;
  the verdict is unchanged.
- mexicat/pdoom-video (3,759 stars, MIT) and JohnHeibel/
  PDoomVideo (2,810 stars, no licence): two single-song
  three.js music-video showcases, the same song in two
  renderings. Works, not tools.
- JohnHeibel/ClaudeAnimationBase (2,490 stars, MIT): a ready
  character rig with 31 emotions; built in two days in
  September 2026 and quiet since.
- athemeroy/awesome-claude-5-5-videos (928 stars,
  CC-BY-4.0): a catalogue of the same wave, 424 videos with
  sources - and, corrected here on 2026-11-04 after a second
  source post (@Ryrenz) described its research layer, more
  than a catalogue: nine-frame preview sampling for 199 of
  the 424 entries, an analysis pass over 1,119 files (games
  and interactive pieces about 70 percent 3D-rendered, ads
  and launches over 70 percent motion graphics and UI,
  median coloured-pixel share 45.5 percent for music videos
  against 17.6 percent for ads), per-piece cost cases, and
  honest labelling where a model attribution is only the
  creator's own claim. A benchmark corpus with statistics;
  still a corpus, not a tool.
- joeseesun/opus-video-prompts (922 stars, no licence,
  about 40 KB, created and last pushed the same day): a thin
  prompt dump.

## Verdict

Reference shelf: not installed, no trial, no evaluation queue
position, no change to the main line.
