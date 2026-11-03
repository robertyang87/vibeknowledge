# Tooling landscape 016: wheresryan22/anatomy - explain an idea by building it as a working object

Checked first-hand 2026-11-03 (GitHub API repository data, README
and file tree read directly). Trigger: an X article by @Haosen9527
(2026-11-03) listing nine science-animation skill projects. All
nine were checked first-hand for this filing (stars, licence,
activity): the article's claim that all nine are MIT is accurate.
The other eight were passed over at the owner's direction and are
recorded in one line each at the end; only Anatomy is filed.

## Repository facts

- 24,202 stars and 2,022 forks at this check, 71 open issues.
  Created 2026-10-08, MIT licence with a licence file present,
  last pushed 2026-10-18. It has now surfaced three times in this
  project's intake: a list check on 2026-10-25 (20,202 stars then),
  as a named companion in the open-3d-skills README, and in the
  Haosen list. The growth is sustained, not a one-day spike.
- Real engineering, unusual for this intake: SKILL.md of about
  33.6 KB, a kit, references, examples, evals, tests and a CI
  workflow; zero dependencies (Node built-in modules only), no
  API keys; Node 20.10 or later. CHANGELOG, CONTRIBUTING and
  SECURITY files present.

## What it does

- Anatomy is an agent skill that explains a technical idea by
  inventing a physical object whose working is the concept, then
  building that object as a crafted interactive isometric figure:
  dozens of small, solid, shaded parts in SVG, with WebGL and a
  beta 3D mode, presented in a framed card with a title, a hint
  and a live readout, moving under pointer and keyboard.
- Examples: a Raptor 2 rocket engine on a test stand (the card
  reads Pc 300 bar, 230 tf), a school ripple tank, a cache key
  drawn as a pin-tumbler lock that only turns when every pin
  matches, one GPU context as a gantry plotter visiting 16 wells.
- One discipline in its design matches this account's fact gates
  directly: every number the figure shows comes from the same
  small model that moves its parts, so a readout cannot drift
  from the mechanism it labels. It also checks its own work by
  zooming in on every joint.

## Assessment

- The deliverable is an interactive figure (HTML, SVG, WebGL),
  not a film: bringing a figure into an episode still needs a
  capture or render step, plus narration and subtitles from our
  own pipeline. It is not a harness candidate under the
  single-harness rule.
- Its slot is a grammar, not a tool: the isometric
  machine-as-metaphor figure, where the mechanism is the concept,
  is a strong register for the science explainers this account
  makes (a serve, a spin effect, a scoring system drawn as a
  working object with true numbers). Borrowable by reading: the
  figure grammar and the one-model-drives-every-number rule,
  redrawn and rendered inside the main line's own styles.
- Recorded caution: the repository is a month old and its 3D
  mode is beta; the SVG and WebGL figure route is the proven
  part. If the grammar is ever used, pin a commit, as with the
  main line's engine.

## The other eight from the same list (checked, not filed)

- adithya-s-k/manim_skill (1,248 stars, MIT, January 2026):
  Manim best-practice documents; the Manim ecosystem is already
  known terrain here.
- Unclecheng-li/AI-Animation-Skill (605 stars, stalled since
  April 2026): technical text to a single-page HTML deck.
- CK42BB/vox-explainer-skill (145 stars, about 17 KB, built in
  one day): collage-style explainers bound to the paid Atlas
  Cloud API.
- iart-ai/explainer-video-skills (73 stars), ericblue/
  visual-explainer-skill (65 stars), znyupup/
  knowledge-explainer-skill (54 stars), BusyBee3333/
  animated-explainer-skills (17 stars) and brandonvant/
  claude-skill-whiteboard-explainer (9 stars, about 20 KB):
  small single- or two-day builds whose outputs are HTML pages
  or static image sets; the hand-drawn lane is already held by
  sweety-handdraw-video on the reference shelf.

## Verdict

Reference shelf: not installed, no trial, no evaluation queue
position, no change to the main line. Revisit only when an
episode needs an isometric mechanism figure; read it then, under
the pin rule above.
