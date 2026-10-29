# Tooling Landscape 005 — Five-repo check (second compiled list)

Source: on 2026-10-29 the owner passed a second batch of repository names (numbered 1, 2, 4, 5 in his source, plus one extra). Each was resolved and checked first-hand against the GitHub API the same day. Two were already in our system; three are new. Verdicts below; consolidated placements are in `docs/tooling-index.md`.

## Already in the system
| Repo | Stars / forks | Licence | Last push | Status |
|---|---|---|---|---|
| alchaincyf/huashu-art-motion | 5,734 / 583 | MIT | 2026-10-16 | Evaluation queue no. 1, now with first-hand figures: the repo description states 35 art styles and 9 explainer grammars (landscape 001, from a third-party article, said 36 styles; the repo's own number governs). Created 2026-10-06; quiet since 2026-10-16. The test protocol stands: same-topic sample against the main line before any adoption talk. |
| lemomo-ai/lemo-opuscar | 9,276 / 1,035 | MIT | 2026-10-29 | The adopted main line; description confirms 66 styles upstream against 59 at our pin. No change. |

## New
| Repo | Stars / forks | Licence | Last push | What it is |
|---|---|---|---|---|
| cth9191/animate | 1,064 / 148 | MIT | 2026-10-05 | A Claude Code skill for procedural animation: short single-file canvas videos with story, look and **storyboard check-ins**; 7 built-in styles or a matched custom one. One burst of work at creation (2026-10-04/05), then quiet. |
| tuzhechen2005/opus-video-skills | 374 / 39 | none stated | 2026-09-27 | A pack of per-style video-making skills for Claude Opus 5.5 (hand-painted animation, kinetic typography, more), every frame and note generated in code. Two days of activity at creation, then quiet for a month. |
| Kianzzz/xilo-opus-video | 310 / 20 | MIT | 2026-09-28 | A Claude Code skill whose stated workflow is: **three proposals and previews first, human confirmation, then frame-by-frame render** (Canvas / WebGL / Three.js / Remotion / HyperFrames). Created and last pushed on the same day, 2026-09-28. |

## Verdicts
- **No adoption changes; the evaluation queue order is unchanged** (huashu-art-motion first, vibe-knowledge-film second).
- **cth9191/animate joins the reference shelf** for one idea: its storyboard check-ins are the same human-gate pattern as our sample gate, applied per storyboard. The tool itself is a lighter single-file route with 7 styles; it is not a harness candidate.
- **Kianzzz/xilo-opus-video joins the reference shelf as methodology evidence**: an independent author converged on our exact shape — three candidate structures, previews, a confirmation gate, then rendering. Recorded as external validation of the baseline's Treatment-plus-sample-gate design, the same role the creator-tutorial convergence played in landscape 003. Single-day repository, unproven in production; not installed.
- **tuzhechen2005/opus-video-skills is landscape record only**: no licence is stated, so its code is not borrowable; its style list overlaps lanes already covered (hand-painted via ClaudeAnimationBase); and it has been quiet since two days after creation. The one register worth remembering from it is kinetic typography, should a future topic want type as the picture.
