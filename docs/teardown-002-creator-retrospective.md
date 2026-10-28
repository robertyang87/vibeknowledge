# Teardown 002: The Creator's Own Retrospective (8 Days, Near 10M Views)

Reference teardown. Source: the same creator's follow-up video,
published 2026-10-20, about 6 minutes 24 seconds, landscape, in
which he explains how his vibe knowledge videos are made and why
some of them travel. Paraphrased throughout; on-screen phrases are
summarized, not transcribed.

## The results he reports

- 8 videos in 8 days, close to 10 million views across platforms,
  and close to 30 thousand new followers. One person plus AI.
- No voiceover and no presenter in any of them.
- His biggest single video is the fiber journey studied in
  teardown 001: about 2.15 million views on Douyin, 0.60 million
  on Kuaishou, 0.78 million on Xiaohongshu, shown on a data card
  in this video.
- He states the mindset explicitly at the end: a video in this
  format has breakout potential, but not breaking out is the norm.

## The principle

Do not ask a video generation model for a finished explainer. Have
the AI write code that generates 3D animation, then render the
code. He lists three advantages, in his order: the picture stays
sharp; any moment can be changed by instruction (his example is
brightening a single second) instead of regenerating the shot;
and the work can be reused across videos.

## His three rules

1. **Topic.** Topic choice sets the ceiling. Pick a phenomenon
   from everyday life, open the question with the word "you", and
   make it counter-intuitive. His own example is the fiber video's
   question. He rates general science, psychology, and Nobel Prize
   stories as the best-fitting categories.
2. **Opening.** The first seconds decide the video. His chapter
   framing says the first three seconds are life or death; an
   on-screen card tightens it to holding the viewer within the
   first second. The first line throws the counter-intuitive
   question directly, with no warm-up.
3. **Visuals.** Captions and picture must change together. His
   negative example: captions cycling over a static picture reads
   as cheap and loses people.

## His four production steps

1. **Prepare the AI.** His on-screen tool list prefers Claude Code
   and Codex, with three domestic agent tools (DeepSeek's Harness,
   Tencent's WorkBuddy, ByteDance's Trae) rated only slightly
   behind.
2. **Prompt in two parts.** A standing general prompt, sent every
   time, that fixes the house style (caption size and color are
   the visible examples), then the content prompt for this video.
3. **Sample first.** Generate a 15 second sample, approve it, and
   only then build the full video. Building the full video first
   is his cautionary case: roughly 30 minutes per video, and hard
   to adjust when the result disappoints.
4. **Music.** Treat music as the soul of the format: use a hot
   track, ideally the same track a viral video already used. In a
   comment reply he says to use the platform's same-track feature
   or download the track.

## Evidence boundaries

- The review of this video, like teardown 001, worked from
  on-screen text and platform chapter summaries; its audio was
  not captured. The creator's own caption says there is no
  voiceover, which is consistent with that limitation.
- The video names tools only at the product level. It gives no
  model version, no cost figures, no full prompt text, and no
  editing software. Model versions and cost claims appear only
  in comments by viewers and are not his statements.
- One commenter explicitly describes this kind of video as made
  with Claude plus the Lemo repository's video skill. That is a
  comment, not the creator's claim, and it is recorded here
  because it independently points at the library this project
  adopted in `docs/lemo-opuscar.md`.
- The roughly daily cadence is an inference from "8 days" plus
  "my 8 videos", not a stated publishing plan.
