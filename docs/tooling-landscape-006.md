# Tooling Landscape 006 — Six-item check (third compiled list) and pipeline integration

Source: on 2026-10-30 the owner passed a third compiled list (via the Doubao assistant) of six names, presented there as code-route video skills that draw frame by frame rather than using video models. Each name was resolved and checked first-hand against the GitHub API. Five of six descriptions hold up; one does not, and the exception matters (see Seedance2 below). Per the owner's instruction, every item judged useful is filed here with its pipeline integration point; placements are consolidated in `docs/tooling-index.md`, and two amendments were made to `docs/baseline-workflow.md` itself.

## The six, resolved
| Name as given | Resolves to | Stars / forks | Licence | Last push | What it actually is |
|---|---|---|---|---|---|
| HyperFrames | heygen-com/hyperframes | 75,310 / 6,853 | Apache-2.0 | 2026-10-29 | HeyGen's open-source framework: write HTML, render video; explicitly built for agents. A rendering engine in the same family as our library's core/render (page rendered frame by frame), with a companion repo of real product-launch compositions (heygen-com/hyperframes-launches, 644 stars). |
| Video-Use | browser-use/video-use | 30,081 / 3,497 | MIT | 2026-10-08 | Editing of REAL footage by coding agents: rough cut, pause removal, subtitles, colour. Already in our records as landscape-only; figures refreshed. |
| Remotion | remotion-dev/remotion | 68,838 / 5,629 | custom (not a standard OSS licence) | 2026-10-29 | The React framework for programmatic video. Not a skill but the engine layer several skills in this landscape build on (video-shotcraft, xilo-opus-video, one hand-drawn variant). |
| Shotcraft | Vincentwei1021/video-shotcraft | 14,624 / 1,376 | Apache-2.0 | 2026-10-29 | Already on our reference shelf; now first-hand at its current size: an AI video skill for Claude Code and Codex making cinematic, editable product promos with Remotion, built around 124 shot recipe cards (our earlier note said 152 cards; the repo's current description says 124). |
| Handdrawn | threerocks/sweety-handdraw-video | 963 / 165 | MIT | 2026-10-27 | The hand-drawn explainer already on our shelf, now with owner and current figures (stroke-by-stroke drawing, per-character writing, VoiceStudio voice). A second hand-drawn skill exists: gnipbao/story-to-handdrawn-video (2,318 stars, MIT), story copy to hand-drawn diary-comic animation, silent MP4. |
| Seedance2 | dexhunter/seedance2-skill; liangdabiao/Seedance2-Storyboard-Generator | 4,377 / 353; 2,713 / 386 | MIT; none | 2026-09-19; 2026-10-26 | **Prompt factories for a generative video model.** These skills write optimised prompts and storyboards that are then fed to Seedance 2.0, ByteDance's text-to-video model. Nothing is drawn in code; the video itself is model-generated. |

## The framing correction
The list's premise — all six are code-route and avoid video models — is false for Seedance2. Its skills exist precisely to drive a video model, which is the lane this account rejects on physical-correctness grounds (see the rejected generative lane in the index). Recorded here so the item is not re-pitched as a code-route tool: the name to remember is that "Seedance" always means the generative model, whatever skill wraps it.

## Pipeline integration (the useful five)
- **HyperFrames → Step 6 render backend, candidate.** Ep1's production measured the cost of our current backend: the library renderer's screenshot drain runs at roughly 7 seconds per frame on this VM, a 190-second film becomes four 47.5-second segments rendered over many hours, and four VM restarts on 2026-10-29 each killed a nearly finished segment. HyperFrames is designated the candidate replacement backend, admitted only through an A/B protocol: re-render one existing segment through it and compare wall-clock per frame, output identity against the approved stills, and loudness/subtitle integrity after mux. It enters the evaluation queue as no. 3, behind huashu-art-motion and vibe-knowledge-film, and no benchmark runs while an episode render is using this machine. Baseline Step 6 now names it.
- **video-shotcraft → Step 4 shot-list vocabulary.** Already the shelf's vocabulary source; the baseline's Treatment step now names its recipe cards explicitly, so the integration is in the workflow text, not only in this index.
- **sweety-handdraw-video → the hand-drawn lane and voice trial.** Stays the designated route if an episode's brief chooses hand-drawn visuals or a narration trial (its VoiceStudio/VoxCPM 2 voice option). gnipbao/story-to-handdrawn-video is the second reference for the same lane (story-first, silent output).
- **Remotion → ecosystem context, not integrated.** It is the engine under shotcraft, xilo-opus-video and one hand-drawn variant. Our single-harness rule stands: the directing discipline lives in the adopted library, and a second engine would split the gates. Recorded so future skill evaluations can assume its presence underneath.
- **video-use → no role in the drawn-film pipeline.** It edits real footage; our films contain none. It stays landscape-only, with one named exception: if the account ever cuts a real-footage side piece, this is the first tool to re-check.

## Verdicts
- Evaluation queue is now: 1. huashu-art-motion, 2. HeyChengC/vibe-knowledge-film, 3. HyperFrames (render-backend A/B only).
- Seedance2 skills join the rejected list, reason recorded above.
- Everything else keeps its existing placement; figures refreshed in the index.
