# Tooling landscape 020: methodology - the Opus 5.5 Motion Lab guide (Florence, @flxrnc)

Filed 2026-11-03 at the owner's direction, methodology first.
Source: the long-form X article "Opus 5.5 Motion Lab: Make
Claude Animate Like a Studio" (@flxrnc, 2026-09-30; at this
check 1,470,275 views, 8,630 bookmarks, 2,133 likes), read in
full via a linked card in her 2026-11-03 list post. Numbers
below are the article's own, quoted as defaults from one
practitioner's lab, not as universal constants.

## The rendering contract

Her name for the assumption this repo's main line already
runs on: the model outputs text and code, never pixels. A
piece is a single file that can be reproduced exactly,
modified cheaply and checked by the agent itself before
export. Everything else in the guide hangs off that contract.

## Prompt anatomy and the directed-prompt experiment

- Her prompt template has nine fields: GOAL, OUTPUT, SUBJECT,
  MATERIALS, CAMERA, TIMELINE, AUDIO, POST, NEVER. The NEVER
  field (explicit exclusions) is the one our own Treatment
  documents do least formally; worth borrowing as a heading.
- Experiment 1 made the same earbud advertisement twice. The
  vague prompt (27 words, no follow-ups) took about 30
  minutes. The directed prompt (448 words, 15 follow-ups)
  took about 90 minutes and specified material values
  (satin ceramic roughness 0.38, clearcoat 0.35, chrome
  roughness 0.05), a 30-degree camera, a 34-to-10-degree
  orbit, 120 BPM, 3 frames of anticipation and damping 0.6.
  Direction costs time; vagueness costs the cheap look.
- She keeps receipts per piece - word count, follow-up
  count, frame count (her four pieces: 416/10/360, 27/0/360,
  448/15/360, 399/4/480) - the same accounting habit as this
  repo's production reports.

## Numbers worth keeping

- Interface motion: 100 to 200 ms. At 24 fps a frame is about
  42 ms; at 120 BPM and 24 fps, one beat is exactly 12
  frames.
- Text dwell: at least 0.3 seconds per word, plus 0.5
  seconds. A floor in the same family as the main line's
  readcheck dwell gate; compare before adopting, do not
  replace ours by default.
- Contrast floor 4.5:1 for text. Spring defaults quoted for
  Remotion: mass 1, damping 10, stiffness 100 (damping ratio
  0.5). Disney's twelve principles are her animation
  reference, cited to Thomas and Johnston.
- Export defaults: sound normalised to -14 LUFS (matching
  this repo's mux standard); MP4 as H.264 High profile,
  yuv420p, faststart, CRF 18.

## The lab loop

Render stills first; inspect any moment frozen via a ?t=
time parameter; build a 12-frame contact sheet with ffmpeg;
check motion with onion-skin overlays. This is the same
self-check loop as our baseline's dense-frame verification
and contact-sheet reviews, described from the motion-design
side - convergence recorded, no change needed.

## Where she does not reach

Her lab makes advertisements and abstract loops at the
ten-second scale. The guide has no fact layer at all: nothing
about sourcing, verification or claims, because her subjects
have no facts to get wrong. Our baseline's fact gates remain
ours alone. Her numbers are also one lab's defaults, measured
on her content, not on knowledge films.

## The list post itself, corrected

The 2026-11-03 post that carried this article listed 14
infrastructure repositories, almost all already on record
here (Remotion and its official skills, HyperFrames,
Three.js, GSAP, FFmpeg, faster-whisper, yt-dlp, Blender, the
Remotion skills repo now at 6,213 stars, up from 5,627 on
2026-10-25). Two of its descriptions were wrong and are
corrected here so they do not propagate: Impeccable is the
frontend design command set filed in landscape 015, not a
timeline editor; HyperFrames is an HTML video framework, not
a video model. Three names were new to this index and were
verified the same day: resemble-ai/chatterbox (27,524 stars,
MIT), an open-source English voice-cloning TTS - the account's
Chinese voice line is settled, so it is a name to know only;
ChromeDevTools/chrome-devtools-mcp (54,718 stars,
Apache-2.0), the official server that lets an agent inspect
its own rendered pages; ahujasid/mcp-for-blender (33,158
stars, MIT), agent control of Blender scenes - a possible
interface to the owner's separate 3D venue work, noted, not
adopted.

## Verdict

Reference shelf as methodology: nothing installed, no trial,
no queue change. Borrow the NEVER field for Treatments and
compare the dwell floor at the next baseline review; the rest
is confirmation that the contract this repo runs on is shared
by the most-bookmarked public account of the same method.
