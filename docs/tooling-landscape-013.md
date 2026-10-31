# Tooling landscape 013: patch-gg/pixelfx - a code-drawn pixel art effects library

Checked first-hand 2026-10-31 (repository metadata, full file tree,
README and catalogue read directly). Shared by the account owner the
same day via an X post by @Tao_Builds. Filed at the owner's direction
as shelf only, with no trial authorised.

## What it is

- PixelFX is a library of pixel art game effects, every one drawn by a
  small piece of JavaScript code rather than shipped as video or image
  assets.
- The repository description counts 232 effects; the README catalogue
  lists those 232 plus 12 character moves, 244 items in all, across 20
  categories: fire, explosions, water, ice, lightning, sci-fi, melee,
  impacts, projectiles, spawn and death, arcane, holy, shadow, status,
  nature, weather, UI, pickups, transitions and critters.
- Each effect is one file under src/fx/<category>/<name>.js. Pure
  effects are a deterministic function of time; simulated effects step
  particles, debris and light at 120 Hz from a seed, so any frame
  reproduces exactly. Drawing uses two buffers, colour and additive
  light, which is what makes hot effects read as hot.
- Use routes: in a browser game (canvas, Phaser, PixiJS, Kaplay,
  three.js) with no dependencies; or in any engine (Godot, Unity,
  GameMaker and others) by exporting sprite sheets - a transparent PNG
  grid plus Aseprite-style JSON with frame rectangles, durations and
  pivot metadata. Every effect accepts a palette ramp, so a fire can
  be recoloured without touching its code.
- An acting layer sells the hit: the 61 effects that involve a
  character, and the 12 moves, carry timing data for wind-up, a freeze
  on contact, target reaction and recovery, readable from the exported
  sheet metadata by a host game.
- A bundled Claude Code skill (skills/pixelfx, also published as a
  plugin) teaches an agent to find, use, export and author effects,
  using a draft, render, inspect, refine loop against a contact sheet.
- A live gallery (patch-gg.github.io/pixelfx) plays every effect in
  the browser with recolouring and sprite-sheet export.

## Repository facts

- 873 stars and 110 forks at the time of this check, 0 open issues.
  The count moved fast: an earlier check the same day read 707 stars,
  so the growth is a viral post working, which is attention, not
  maturity.
- Very young: created 2026-10-30, 8 commits, no releases. Single
  organisation (patch-gg), effectively a two-day-old project.
- MIT licence, with a licence file present. A NOTICE file records that
  parts adapt Hugo Duprez's MIT-licensed effects and Hollow Crown's
  MIT source; the Patch Pixel font used in the gallery is the author's
  own and is explicitly not covered by the MIT grant.
- Real code, not a Markdown shell: 348 tree entries, about 14.2 MB of
  blobs, of which about 11.8 MB is two README GIFs. The engine core
  (simulation, painter, skeleton rig, acting) plus roughly 230 effect
  files of 3 to 23 KB each make up the rest.

## Assessment

- The engineering profile is the opposite of landscape 012: a working
  library with a coherent model (seeded, local-space, two-buffer),
  export paths into real engines, and a quality loop built into its
  authoring tools (spills, seams, unseeded randomness and slow frames
  are checked by its own tooling).
- It competes with no lane in this index, and it also fits no current
  lane: its register is pixel art game VFX, while this account draws
  code-film explainers in the Lemo-Opuscar styles and the owner's
  tennis line runs on real footage. Dropping pixel effects into either
  would break the established visual systems.
- The shelf slot is therefore narrow and conditional: first, a future
  pixel-style game project, where the library could be used as-is
  under MIT; second, its transitions category (10 items: blinds, burn
  away, CRT off, diamond wipe, glitch wipe, iris and others) and UI
  category (confetti, combo counter, countdown and others) as an
  inspiration list for motion ideas, redrawn in the account's own
  style system and never dropped in as pixel assets.
- Youth is the standing caution: at two days old, effect ids, the API
  and the acting format may still churn. If the slot ever opens, pin a
  commit the way the main line pins its engine; do not track main.

## Verdict

Reference shelf only, by the owner's explicit direction: not
installed, no trial, no evaluation queue position, and nothing adopted
into any production line. Revisit only if a pixel-style project
actually starts.
