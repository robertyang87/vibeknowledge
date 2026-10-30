# Tooling landscape 009 - Hypit (viral-video cloning for agents)

Checked first-hand 2026-10-30. hypit-ai/hypit: 26,509 stars, TypeScript,
last push 2026-10-29. The repository badge declares "Apache-2.0 with
conditions"; the platform licence field reads NOASSERTION, so the exact
terms need a read of the LICENSE file before any code contact.

## What it is
An agent-facing system for cloning viral videos: hand it a video and
the agent rebuilds it as a complete workflow - footage, captions,
B-roll and effects all anchored to words rather than timestamps - then
produces variants by swapping face, wording and B-roll, aiming at
batch output from one command. It targets AI coding agents (Claude
Code, Codex class) as the operator.

## Relevance to this repository
The valuable half is the decomposition: a finished film becomes a
word-anchored, reusable workflow description. That is the teardown step
of our baseline workflow, formalised - the same move as our teardown
documents (001-004), expressed as a machine format instead of a report.
Worth remembering if a future episode ever needs a reference film's
structure extracted mechanically rather than by viewing.

## Why it is not adopted
- Its purpose is cloning with swapped surfaces and batch variants; this
  account's model is original production: fact card first, own copy,
  one film one thing. The output philosophy conflicts, not just the
  tooling.
- Licence carries conditions (see above); no code is borrowed sight
  unseen, per the standing rule for unclear licences.
- No trial is queued. If the owner wants one, the entry point is a
  read-only review of its workflow format on one teardown subject we
  have already documented by hand, scored against that document.

## Disposition
Methodology reference, top of the reference shelf next to
win4r/video-director (landscape via the tooling index): both are
harness-shaped projects whose decomposition ideas inform our baseline
without becoming a second harness.
