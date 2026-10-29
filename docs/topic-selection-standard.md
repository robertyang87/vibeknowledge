# Topic Selection Standard

Status: consolidated 2026-10-29 from three sources — Xu Xiansen Ai's three topic rules (teardown-002), the full-catalog data of the Douyin creator Juno (38 works, 2026-09-30 to 2026-10-28), and three successive tightenings set by the account owner on 2026-10-29. This standard is the scoring rubric behind Step 1 (topic gate) of `docs/baseline-workflow.md`. One film explains exactly one thing; a topic enters production only after passing every gate below, in order.

## The three hard requirements (all must pass)

### 1. A universal moment
- The scene must be statable as one concrete instant beginning with "you", and most people must have lived it themselves — not merely seen it or heard of it.
- Fail signals: no concrete instant can be named (a history survey instead of a moment); the audience only watches it happen to others (news polls); the experiencing population is narrow (airplane meals).

### 2. A counter-intuitive reversal
- The folk answer must be writable in one sentence first; the scientific answer must contradict it or differ from it by an order of magnitude.
- A quantified reversal is strongly preferred: a number the viewer can carry away (37%, about 9%, two thirds, twice the price).
- Fail signal: the scientific answer is merely "the folk answer, but more precise" (a sweetener being sweet is not a reversal).

### 3. Hard backing
- Behind the reversal there must be a named piece of science: a theorem, a published classic experiment, a physical or physiological mechanism, or official statistics.
- Evidence ladder, strongest first: theorem or textbook law > peer-reviewed experiment > official data > a single study.
- Fail signals: mechanism unsettled or contested in the literature (admissible only as a clearly-labelled open-question special, never as a standard episode); folk claims; marketing copy; any number that cannot be traced to a primary source.
- The backing and its strength are written on the first line of the episode's FACTS.md. No primary source, no episode.

## How topics are found: principle first, scene second
- Start from a library of named principles (psychological effects, statistical paradoxes and theorems, physical and physiological mechanisms, behavioural experiments). Each principle carries a prediction; find the everyday instant where that prediction collides with folk intuition. That collision is the topic.
- Searching forward from phenomena is forbidden as the primary method: it produces curiosities with no mechanism underneath.
- The four sources of reversal: (1) the brain's approximation algorithms failing on specific inputs; (2) probability and scale exceeding intuitive range; (3) an invisible physical quantity running the show; (4) individual rationality summing to a collective reversal.
- The one-line test: "You think X; actually Y, because Z" — X is something everyone has done, Y makes the viewer pause, Z is a principle with a name. If the line cannot be written, the topic does not exist.

## Process gates (in order)
1. Occupation check: the account's own published list and material library first (a topic already done well by a tracked creator is occupied), then the Douyin prior-work check (baseline Step 1.5). Crowded with no new angle: rejected, or downgraded to candidate.
2. Fact card before any copy: backing strength on line one; a claim that cannot be sourced is removed, and if the reversal depends on it, the topic is out.
3. Title must fit one of the four title patterns (counter-intuitive number or formula; current hotspot in plain words; emotional pain point; classic motif series).
4. The sample gate re-tests the topic three ways: the one-second hook, caption-and-picture sync, and the facts.

## Instant rejects
- A phenomenon with no mechanism (mere curiosity).
- A fabricated "universal" scene nobody actually lives (comparing hospitals by department success rates).
- A reversal carried by the title only, with no principle underneath.
- Chasing a niche hotspot off-formula (the comparison case dropped to 15 likes inside an otherwise identical format).
- Occupied by a high-quality work in the same lane, with no new angle of ours.

## Scoring
Three axes, each rated strong / medium / weak: universality, reversal size, backing hardness. Any weak axis removes the topic from the active list (it may sit in the candidate pool with its failing axis recorded). All three strong is the first tier. Verdicts are recorded in the topic pool documents alongside the Douyin prior-work evidence.
