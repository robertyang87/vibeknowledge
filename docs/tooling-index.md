# Tooling Index

Status: consolidated 2026-10-29, updated the same day with landscapes 004 and 005. This is the lookup table for every tool, library and repository evaluated for this account: what it is, where it sits, and exactly how it is used. Full evaluations live in `docs/tooling-landscape-001.md` through `-005.md`; this index is the summary that an episode kickoff should read first.

## Main line (adopted, in production)

### Lemo-Opuscar — the engine and the directing discipline
- lemomo-ai/lemo-opuscar, MIT, pinned at commit 413a6bd6 (upstream main, 2026-10-24) as the repo submodule `vendor/lemo-opuscar` and installed locally for production.
- How used: pick one of the 59 film styles as the episode's visual system; write the Treatment first (three structures, one chosen; shot list; beat sheet; sound design); prove the look on stills rendered with the real code; one timeline drives picture, subtitles and sound; render with the library's `core/render` tools; subtitle dwell checked by its readcheck; mux to -14 LUFS; deliver against the DIRECTOR section 11 checklist.
- Upstream watch: the author has since moved toward real-footage documentary styles and a style-making toolbox. Checked 2026-10-29 (landscape 004): upstream is at 9,270 stars and its description now reads 66 ready-to-use styles, pushed the same day — the pre-episode diff has a concrete delta of seven added styles over our pin. Diff upstream against the pin before a new episode starts; never change the pin mid-episode.

### Our baseline layer — the account's own gates around the engine
- `docs/baseline-workflow.md` plus `docs/topic-selection-standard.md`. Topic gate with a Douyin prior-work check, FACTS.md before any copy, the sample gate (one-second hook, caption-picture sync, facts), two still-sheet revision rounds before a full render, dense-frame self-review of the finished file, and a per-episode log with 24-hour and 7-day numbers. The engine guarantees a film can be drawn; this layer guarantees it is right.

## Evaluation queue (decided order, not yet installed)
1. **huashu-art-motion** (alchaincyf) — first-hand figures from landscape 005: 5,734 stars, MIT, created 2026-10-06, last pushed 2026-10-16; its own description states 35 art styles and 9 explainer grammars (the 36-style figure in landscape 001 came from a third-party article). A no-voiceover method. Test protocol: render the same topic as a sample against the main line; adopt only if its explainer grammar measurably beats our layered structure on that sample. A user-reported Douyin science video passed 100k plays in 5 hours; that is a lead, not evidence.
2. **HeyChengC/vibe-knowledge-film** — a skill built for this exact contest format, two styles ("nocturne" for deep topics, "fable" for psychology and behaviour shown rather than told), plus an engine document with an up-front pitfall checklist (subtitle band placement, glow colours darkened first, particles as plain rectangles, a quantified longest-subtitle width check). First step is documentary only: diff its checklist against our gates and absorb what strengthens them; test the styles when a shown-not-told topic arrives.

## Methodology reference (top of the reference shelf)

### win4r/video-director
- A Claude skill for directing, building and verifying code-rendered videos, distilled from eight repositories — one of which is lemo-opuscar itself, alongside two already on our shelf (awesome-opus5-5-videos, video-shotcraft). Created 2026-10-28; small and unproven in production. It is NOT adopted as a second harness (two gate systems would fight); three of its formalisations are borrowed by name:
  1. Its post-render QA script `qa_video.py`: one report covering loudness and true peak, black/flat frames, planned-vs-detected cuts and silences that are actually quiet — plus two checks we lacked: a 360 px-wide phone readability sheet and a muted 0-3 s hook sheet. First run: against the Ep1 master as an extra QA pass.
  2. Its independent-review phase: a clean-context critic with a rubric and exactly one fix round. Our self-review is same-context; from Ep2 the critic pass is added to Step 8.
  3. Its named fact graders (numbers-match-source, no-extrapolation, honest-chart, hook-first-3s) and its fix-card format (timecode scope, what must not change, the failure as it looks now, the observable target, the fake fixes to refuse) — the formal version of fact gates we previously ran ad hoc.
- Where it conflicts with the Opuscar DIRECTOR or our baseline (for example its English read-time formula versus our Chinese subtitle dwell formula), ours governs.

## Reference shelf (borrow the idea, not the tool)
- **huashu-motion** — one interaction only: point at a frame to request a revision. Already our sample-gate feedback habit; the tool is not installed.
- **yihui-dev/awesome-opus5-5-videos** — 703 viral videos with the prompts behind them (12,346 stars at the 2026-10-29 check). Consulted when a shot cannot be described to the model. Evidence caution recorded by video-director's methodology: its "featured" flag mostly tracks early virality and curator taste, so its statistics are suggestive, not causal.
- **Vincentwei1021/video-shotcraft** — 152 shot cards; the vocabulary source when writing shot lists.
- **sweety-handdraw-video** — hand-drawn style plus a VoxCPM 2 voice option; the trial route if an episode ever needs hand-drawn visuals or narration.
- **The broll-sketch format** (from the space-video suite) — a way to sketch b-roll inside a treatment; format reference only, suite not adopted.
- **motion2code / cutloupe** — motion and cut analysis references for teardown work, not production.
- **Vincentwei1021/mg-styles-15** — 15 motion-design styles, each generated from one prompt (2,571 stars, MIT; first-hand check in landscape 004). The style cross-check when a motion-design look is wanted and the main line's styles do not fit.
- **JohnHeibel/ClaudeAnimationBase** — a starter kit for hand-painted cartoon animation (p5.js + p5.brush; 2,270 stars, MIT). The cartoon lane only, if a future topic wants that register.
- **PDoomVideo** — a complete worked example of a code-rendered music video. Borrow from the MIT re-release (mexicat/pdoom-video, 3,620 stars), not the unlicensed original (JohnHeibel/PDoomVideo, 2,694 stars).
- **joeseesun/opus-video-prompts** — 54 cases with copy-ready prompts (822 stars, no licence). Second prompt source after the shelf primary; prompts as inspiration only.
- **athemeroy/awesome-claude-5-5-videos** — a smaller workflow-oriented list (827 stars, CC-BY-4.0). Recorded but not consulted in parallel with the shelf primary: two galleries of the same phenomenon would double-count the same evidence. Fallback if the primary goes stale.
- **cth9191/animate** — a Claude Code animation skill (1,064 stars, MIT) borrowed for one idea: its storyboard check-ins, the same human-gate pattern as our sample gate applied per storyboard. Not a harness candidate (7 styles, single-file canvas route).
- **Kianzzz/xilo-opus-video** — methodology evidence only (310 stars, MIT; landscape 005): an independent author converged on three proposals plus previews, a confirmation gate, then frame-by-frame rendering — external validation of our Treatment-plus-sample-gate shape. Not installed.

## Fallback route (not installed)
- **arjun988/blender-skills** — 94 Blender skills driven over MCP, aimed at game-asset pipelines (blockout to engine export); last pushed 2026-07-10. Its only slot here: if a future episode needs one hero 3D asset that Three.js cannot model well, build and render that single asset in Blender and composite it in. Its camera references overlap video-shotcraft, which we already hold.

## Checked and rejected (landscape record only)
- Generative video-model lane — LTX-2, CogVideoX, ComfyUI WanVideoWrapper, VACE, DiffSynth-Studio, MuseTalk: we draw with code, and generated footage cannot be trusted for physical correctness.
- Bulk faceless factories — MoneyPrinterTurbo, YILS-LIN/short-video-factory: copywriting plus stock montage with no fact discipline; the opposite of this account's model.
- Editor-type tools — OpenChatCut, FireRed-OpenStoryline, Editly, AutoSubs: our timeline and subtitles are generated exactly from code, so a timeline editor has nothing to attach to.
- video-use and the digital-human / music-video projects: landscape awareness only.
- tuzhechen2005/opus-video-skills — a per-style skill pack (374 stars) with no licence stated, so its code is not borrowable; quiet since two days after its 2026-09-26 creation. Landscape record only (landscape 005); its kinetic-typography register is noted there.
