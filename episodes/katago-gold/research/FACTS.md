# KataGo fact and scope audit

Retrieved 2026-11-14. Primary upstream documentation snapshot:
`lightvector/KataGo` commit `d91ea855110dae533f0aada947b2b7d78cc8a4e1`.
The film explains the core mechanism, rather than claiming to exhaust every
optimization in current releases.

| Film claim | Evidence | Scope |
| --- | --- | --- |
| Open-source Go engine initiated by David J. Wu; superhuman strength | Official README and training site | No numeric Elo or hardware speed promise |
| Network-guided MCTS, policy and outcome outputs | Wu paper, sections 2 and 3 | Modern releases add optimizations; the drawn loop is conceptual |
| Search selects, expands, evaluates, backs up | Wu paper, section 2 | A playout is not necessarily a random full game; terminal outcomes use game rules |
| Exploration balances estimated utility and an exploration bonus informed by prior and visits | Wu paper PUCT formula | The utility/prior/exploration labels are intuition, not an exact current implementation formula; no coefficient is claimed |
| History, board features, rules, komi influence predictions | Wu paper appendix A, Analysis Engine input docs | Features and encodings vary with model version |
| Self-play supplies search policy targets and game outcomes | Wu paper, section 2 | Refers to the main reinforcement-learning pipeline; optional human-style supervised models are distinct |
| Score and ownership targets help learning | Wu paper, section 4.1 and ablation results | Ownership is an expected endgame ownership prediction, not current secured territory |
| Mixed fast/full searches improve training efficiency | Wu paper, section 3.1 | This describes training self-play, not a universal user inference setting |
| Global pooling brings whole-board context to local processing | Wu paper, section 3.3 | A schematic information flow, not a literal architecture diagram |
| Winrate and scoreLead are different quantities | Analysis Engine docs, moveInfos and rootInfo | Both depend on perspective and settings; illustrative score graphics use black's perspective |
| AI predictions do not certify a human player's realized winning frequency | Analysis Engine docs and model-based prediction interpretation | No claim that all reported probabilities are calibrated in every setting |
| Adversarial positions can exploit strong Go agents | FAR AI research and CHAI summary | Reported attacks are version/settings dependent; no assertion that all current networks lose to a historical attack |

## Deliberate exclusions

- No claim that every move is exhaustively searched or that the network proves a move optimal.
- No numerical speedup comparison with modern systems. The original paper's historical 50x result is not a general inference-speed claim.
- No claim that normal play updates model weights after every move.
- No claim that ownership is a legal territory adjudication.
- No claim that a score-maximizing move and a win-probability-maximizing move are necessarily identical. KataGo's utility may also include score terms, depending on configuration.

## Visual model

The opening/closing 19x19 coordinate lattice has 361 modeled intersections.
The 9x9 teaching position uses a deterministic legal move sequence. All three
candidate intersections are empty. A local rules check verifies captures,
no occupied-point placements and no suicide in the displayed position.
These are illustrations, not tactical puzzles or recommended moves. No
actual KataGo engine was run for this production.

The three displayed candidate proportions are synthetic and normalized as a
selected subset; other legal moves and passing are omitted. The 63%, 90% and
+2.1 readouts are illustrations, not computed from the teaching position.
The score axis spans -5 to +5; its marker is positioned from the same +2.1
value used in the label. Search-tree roles alternate at successive depths.
The spatial network diagram is conceptual, not a literal layer diagram.

Ownership colors are hypothetical predictions, not adjudicated territory.
Every quantitative teaching panel carries an illustration scope label.

## Sources

1. David J. Wu, *Accelerating Self-Play Learning in Go*, arXiv:1902.10565v5,
   2020-11-09. https://arxiv.org/abs/1902.10565
2. Official source and README: https://github.com/lightvector/KataGo
3. Additional methods: https://github.com/lightvector/KataGo/blob/master/docs/KataGoMethods.md
4. Analysis API and field meanings: https://github.com/lightvector/KataGo/blob/master/docs/Analysis_Engine.md
5. Distributed training: https://katagotraining.org/
6. Adversarial Go research: https://goattack.far.ai/
7. CHAI summary of attack failure modes:
   https://chai.berkeley.edu/blog/2023/07/28/even-superhuman-go-ais-have-surprising-failures-modes/

Narration uses original explanatory language; source texts are referenced rather
than read verbatim. Source snapshots are retained locally for audit.

## Short source excerpts for audit

- Wu abstract: "only learns from neural-net-guided Monte Carlo tree search self-play."
- Wu section 2: "the playout terminates by appending that single child to the tree."
- Wu section 4.1: "auxiliary ownership and score prediction targets."
- Additional methods documentation: "globally aggregating" information is the
  purpose of global pooling; its implementation and later search changes are
  documented separately from the original paper.

These excerpts support the claims mapped above; they are not narration lines.
