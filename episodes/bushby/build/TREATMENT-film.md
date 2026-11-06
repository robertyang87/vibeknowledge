# Film treatment: Karl Bushby, the full walk (one film)

Status: 2026-11-06, brief and style settled with the user (sample v3). Facts come only from
`episodes/bushby/FACTS.md` (v2); on-screen copy lives in
`episodes/bushby/copy/`.

## Brief (settled)

- Format: one complete film telling the whole 1998-2026 walk; a
  15-second sample first, full film only after the sample is approved.
- Picture: the story is his journey, so every beat gets a scene of
  its own (place, weather, what happened). The track map is a support
  device, not the film.
- Style (settled 2026-11-06, sample v3; replaces the Risograph and flat-vector tries,
  which the user found childish): two kinds of shot, never shown side by side.
  - **Map shots** carry the distance: a dark 3D globe with real shaded relief
    (Terrarium elevation patches, z7 to z11 along the route), a shader-drawn
    coastline, faint Natural Earth roads, rivers and lakes, and the walked route
    as a thin gold line. The camera follows the line's head and zooms from the
    whole globe down to regional and town scale. Chapter titles and the status
    block (day count, date, age, where he sleeps, plan 12 years vs actual) sit
    on the map shots only.
  - **Story scenes** carry the events: dark cinematic 3D environments of the
    place at that moment (Patagonian steppe at dawn, the Darien canopy by day,
    the cell with tally marks), the walker a small silhouette at human
    proportions, never a face. A place tag and the date sit top left.
  - Real photos were tried and set aside by the user; his own photos would need
    a free licence first.
- Sound: no voiceover. Captions carry the story; music and foley carry
  the feeling. The user asked to review a version without music first. The publish copy may swap in a platform
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

## Device sheet (v3)

| Device | Shot | Behaviour |
|---|---|---|
| Chapter block | map, top left | kicker, large serif title, English name, one line |
| Status block | map, top right | day count, date, age, where he sleeps tonight, plan 12 years vs years so far |
| Place tag and date | scene, top left | where and when the scene happens |
| Days held | the cell, top right | counts with the tally marks on the wall |
| Escort line | map | dashed red, labelled; never part of the gold line |
| Rule card | map | "it does not count" when a vehicle moved him and he walks it again |
| Caption | both | one line, bottom centre, key word in gold |

## Colour

Near-black ground. Gold only for the walked route and the key word. Cool blue
for coastline and water. Red only for what stopped or moved him (custody, the
escort). Story scenes keep the same dark grade, each with one light source.

## Ending (locked first)

Hand the decision to the viewer: "Swimming the Caspian and the
Channel, he swam more than 310 km. Does a walk around the world
count if part of it was swum?" Pinned comment uses the same words.

## Sample v3 (36.3 s, built in `build/v3/`)

| t (s) | Shot | What it shows |
|---|---|---|
| 0.0-4.6 | map | the globe; "if you were Karl Bushby / you decide to walk home" |
| 4.6-8.0 | map | descend to Punta Arenas, chapter 1 "depart" |
| 8.0-12.8 | scene | Patagonian steppe at dawn, he pushes the cart north |
| 12.8-17.0 | map | follow the line up the Andes; "you head north" |
| 17.0-21.0 | map | chapter 2 "Darien", the one gap in the Pan-American Highway |
| 21.0-25.8 | scene | the canopy by day, on foot with a sack; about ten days by compass |
| 25.8-30.8 | scene | the cell, tally marks, days held |
| 30.8-36.3 | map | the escort dashed red; he walks Boca de Cupe to Meteti again; rule card |

Facts used: start date and place (C4), the Darien crossing (report section C:
disguise, sack, about ten days by compass to Paya), arrest at Boca de Cupe,
escort by boat to La Palma and Meteti, about 18 days held, the re-walk (E1-9,
E1-10). Elevation data: Terrarium tiles (AWS Open Data; SRTM, GMTED, ETOPO1);
lines: Natural Earth. Both credited at the end.
