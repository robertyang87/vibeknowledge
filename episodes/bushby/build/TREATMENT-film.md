# Film treatment: Karl Bushby, the full walk (one film)

Status: 2026-11-06, brief settled with the user. Facts come only from
`episodes/bushby/FACTS.md` (v2); on-screen copy lives in
`episodes/bushby/copy/`.

## Brief (settled)

- Format: one complete film telling the whole 1998-2026 walk; a
  15-second sample first, full film only after the sample is approved.
- Picture: the story is his journey, so every beat gets a scene of
  its own (place, weather, what happened). The track map is a support
  device, not the film.
- Style: Lemo-Opuscar Risograph (`styles/risograph/STYLE.md`): a small
  figure in a large world, flat colour fields, overprinted spot inks.
  Chosen because the walk is literally a small person crossing very
  large places, and because "plates as narrative" lets an ink stand
  for something in the story.
- Sound: no voiceover. Captions carry the story; music and printing
  foley carry the feeling. The publish copy may swap in a platform
  track via the same-track feature; the film ships with its own score.
- Frame: 16:9, 1920x1080, 24 fps.
- Language: Chinese on screen.
- Storyboard review: not requested; the 15-second sample is the review.

## Three candidate structures

1. **The line and the calendar (chosen).** Chronological. A cold open
   lands the question in the first second, then the walk runs from
   Punta Arenas to Hull. Every time he is stopped (arrest, sponsor
   loss, ban, Iran, pandemic, visa clocks) the distance counter
   freezes while the day counter keeps running. Ending: the decision
   is handed to the viewer (about 316 km of the "walk" was swum).
   Strength: it is one journey the camera can follow, which is the
   house format, and the device is the thesis.
2. **The rule, case by case.** Open on the transport he did use, then
   test each case against "was his body moved forward". This was the
   single-episode script. Strength: a sharp argument. Weakness: it
   is a list, not a journey; it skips most of the walk.
3. **From the bridge, backwards.** Open on the Humber Bridge in fog on
   1 November 2026 and flash back. Strength: emotional hook.
   Weakness: the homecoming lane is already taken by another creator,
   and the ending would compete with the opening.

## Device sheet (fixed positions for the whole runtime)

| Device | Position | Behaviour |
|---|---|---|
| Year-and-place tag | top left | date and place of the current scene, printed on the blue plate |
| Two counters | top right | "distance walked" and "days since he left"; when he is stopped the distance freezes and the days keep rolling (the thesis) |
| Route inset | bottom right, small | a printed strip of the world with the line so far; shown at turning points only |
| Rule stamp | centre, on demand | "not advanced" stamp in red when a vehicle moves him without moving the line |

## Inks (plates as narrative)

- Plate 1, Federal Blue `#3D5588`: the world, the figure, the tag.
  Every main colour contains it, so a one-ink frame still reads.
- Plate 2, Sunflower `#FFB511`: sun, warmth, home; the moving line.
- Plate 3, Red `#FF665E`: paper and power (stamps, borders, bans,
  courts). It arrives only when the walk is stopped by someone, and
  leaves when he walks again.

## Ending (locked first)

Hand the decision to the viewer: "Swimming the Caspian and the
Channel, he swam more than 310 km. Does a walk around the world
count if part of it was swum?" Pinned comment uses the same words.

## 15-second sample plan

| t (s) | Beat | Information |
|---|---|---|
| 0.0-1.0 | Question printed on the paper | the question is legible within the first second |
| 1.0-5.0 | Wide lateral track, small figure pushing a cart under a big sun, Patagonia | tag 1998-11-01 Punta Arenas; counters start |
| 5.0-9.0 | Match cuts on flat shapes: Darien jungle (2001), Alaska winter (2004), Bering sea ice (2006); the figure keeps walking | distance counter climbs with the days |
| 9.0-13.0 | Landing in Chukotka, 2006: the red plate arrives as a stamp; distance freezes, days keep rolling | caption: of 28 years, only 13 to 15 were walking (FACTS C6) |
| 13.0-15.0 | Title printed with a double hit | film title |

Facts used in the sample: C4 (dates, 28 years), C6 (13-15 years
walking), E1 Bering landing and detention. The distance counter is the
share of the schematic route walked by that date (from
`map/data/points.json`) scaled to the sourced total of about
50,000 km (C5), shown with "about"; it freezes exactly when the route
line stops. Its only job is to make the stop visible.
