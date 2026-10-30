# Teardown 005 - Creator: Bitexinyu (Bilibili, Xiaohongshu, Douyin)

Checked 2026-10-30. Method: full Bilibili catalogue (22 videos) pulled from the
logged-out public endpoints at 14:39 (UTC+8): views, likes, coins, favourites,
shares, danmaku, comments, descriptions, tags and top comments. Xiaohongshu:
titles and like counts of the 22 notes visible logged-out (bodies, comments
and play counts hidden). Douyin: profile header only - the works list needs a
login. The Bilibili top 10 by views, plus the entropy video (second on
Xiaohongshu), were downloaded and watched in full; the videos carry no voice
narration, so the on-screen captions were read by OCR at two frames per
second and hard cuts were counted with ffmpeg scene detection (threshold 0.3).
Caption lines below are translated and paraphrased, not transcribed; OCR may
have misread individual characters. The other 11 videos are described from
title, description and tags only.

Companion files:
- `docs/teardown-005-bitexinyu-top-11.md` - beat-by-beat teardown of the 11 watched videos
- `docs/teardown-005-bitexinyu-narrative-formula.md` - what travels, the narrative formula, title templates, topic ideas
- `docs/data/teardown-005-bitexinyu-bilibili-videos.csv` - the 22-video data table

## Identity and scale
- Account "Bitexinyu" (romanised; the name reads roughly "bit new words").
  Bio, in translation: "Telling stories never seen before with sights and
  sounds never seen before. Music and light are the fuse into the universe
  inside your head. An independent story screening room | Vibe Knowledge
  campaign: turning knowledge into blockbusters with AI."
- Bilibili (space 3494362707135250): 820,318 followers, 3,002,961 total
  likes, 22 videos, 27,324,670 total views. All 22 published 2026-10-01 to
  2026-10-28. Median video about 956k views; the top 3 hold 41% of all views.
  Account-wide like/view 10.8%, favourite/view 4.5%, share/view 0.46%.
- Xiaohongshu (profile 5e17f76e000000000100017f): followers shown as
  "10k+" logged-out, about 77k per the account owner; IP region Hunan; bio
  adds "Microsoft MVP". The 37% rule and entropy notes are pinned.
- Douyin (ID 80341696657): 136.2k followers, 1,962.2k likes received, 17
  works; IP region Japan. Per-video data not collected (login wall).
- Format: 2:11 to 3:20 per video. No voice narration anywhere - burned-in
  captions plus music over code-drawn motion graphics and data
  visualisation, mostly on black. Two end cards (Tit for Tat, Entropy) call
  the piece "a film rendered entirely in code".
- Production: descriptions and the pinned comment state the videos are made
  with Opus, "not one-prompt generation", and that Bilibili is a sync of
  work first published elsewhere for the Vibe Knowledge campaign. A top
  comment ("this kind of video already blew up on Douyin") supports the
  inference that Douyin is the first-run platform.

## Key conclusions
1. What travels is not the knowledge itself but the bundle: one named
   hard-science concept, a pain point nearly everyone has lived, and one
   forwardable line of reconciliation at the end.
2. Three proven lanes: Nobel-news hooks (average 2.02M views), regret and
   self-reconciliation (1.90M), and formula or counter-intuitive-number
   titles (1.67M), against an account average of 1.24M.
3. The owner's hypothesis holds - a universal experience with a
   counter-intuitive explanation - with one addition: a named, checkable
   piece of science (a Nobel, an experiment, a formula) must carry the
   reversal. Without it the same shape reads as a platitude and is not
   saved or shared.
4. After 2026-10-17 the account drifted to abstract self-help,
   multi-concept compilations and bare film-title headlines: those five
   videos average 320k views (against 1.51M before), with lower like,
   favourite and share ratios too - so the drop is not only video age.
5. Opening: 8 of the 11 watched videos open on a counter-intuitive number or
   claim; the other 3 on a concrete person or scene. None opens on a
   definition. 5 of 11 end on a "to everyone who..." dedication.

## The catalogue (Bilibili, all 22, by views)
Cumulative numbers favour older videos; compare the ratios. Concept column is
from titles, tags and (top 11) viewing.

| # | Title (translated) | Published | Length | Views | Likes | Favourites | Like/view | Fav/view | Share/view | Xiaohongshu likes | Core concept |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | [Silver Medal Tears / the worst pain is not failing, it is 'almost'](https://www.bilibili.com/video/BV12DHQ61EhT) | 2026-10-08 | 2:42 | 4,756,530 | 307,126 | 123,958 | 6.5% | 2.6% | 0.11% | 63000 | counterfactual thinking (Kahneman and Tversky 1982) |
| 2 | [This year's Nobel went to 'the brain's switch': what optogenetics is](https://www.bilibili.com/video/BV1Fbpt6qEPq) | 2026-10-09 | 2:42 | 3,940,629 | 486,550 | 233,840 | 12.3% | 5.9% | 0.72% | 100000+ | optogenetics (2026 Nobel Prize in Physiology or Medicine) |
| 3 | [Razor: every 'maybe' has a price: 0.8^5 = 33%](https://www.bilibili.com/video/BV1WkJk6VEqA) | 2026-10-15 | 2:40 | 2,574,964 | 306,769 | 153,723 | 11.9% | 6.0% | 0.88% | 30000 | Occam's razor, overfitting, chained probability |
| 4 | [The shortcut to gaming the score](https://www.bilibili.com/video/BV1cvpF6fEoc) | 2026-10-06 | 2:42 | 1,693,585 | 132,620 | 45,964 | 7.8% | 2.7% | 0.29% | 20000 | Goodhart's law, reward hacking |
| 5 | [2026 Nobel Prize in Physics: IceCube neutrinos](https://www.bilibili.com/video/BV1XWp76FEZR) | 2026-10-11 | 3:20 | 1,664,711 | 149,011 | 41,973 | 9.0% | 2.5% | 0.27% | 3515 | neutrino astronomy (IceCube) |
| 6 | [Say 'I love you' for the 1000th time and it carries almost zero information](https://www.bilibili.com/video/BV1VVpo6gEMw) | 2026-10-12 | 2:44 | 1,505,874 | 167,836 | 85,635 | 11.1% | 5.7% | 0.92% | 19000 | Shannon information entropy |
| 7 | [Tit for Tat](https://www.bilibili.com/video/BV1X8a16wEGh) | 2026-10-02 | 2:42 | 1,468,948 | 169,429 | 78,087 | 11.5% | 5.3% | 0.39% | 11000 | iterated prisoner's dilemma (Axelrod) |
| 8 | [Between two identical places, no wind will rise](https://www.bilibili.com/video/BV1zVpJ6yEk6) | 2026-10-11 | 2:42 | 1,295,755 | 197,399 | 69,612 | 15.2% | 5.4% | 0.29% | 1311 | temperature difference drives wind; wandering albatross |
| 9 | [Aftermath / how far does the silence after a fight travel?](https://www.bilibili.com/video/BV1Kpa26dE9e) | 2026-10-02 | 2:44 | 1,159,624 | 141,550 | 46,807 | 12.2% | 4.0% | 0.24% | 4077 | gravitational waves (LIGO), ringdown, destructive interference |
| 10 | [What is the 37% rule?](https://www.bilibili.com/video/BV13Aa66LEAW) | 2026-10-01 | 2:44 | 1,135,601 | 136,459 | 79,586 | 12.0% | 7.0% | 0.55% | 54000 | optimal stopping |
| 11 | [Understand entropy and you forgive life for every time you fell short](https://www.bilibili.com/video/BV1u1p56EEDW) | 2026-10-11 | 2:51 | 1,097,844 | 184,492 | 76,127 | 16.8% | 6.9% | 0.66% | 40000 | entropy (second law of thermodynamics) |
| 12 | [Every civilisation brews alcohol, because living needs a little intoxication](https://www.bilibili.com/video/BV1ukHb6XE2H) | 2026-10-03 | 2:42 | 814,794 | 121,496 | 41,531 | 14.9% | 5.1% | 0.40% | 1622 | alcohol-metabolism genes, history of brewing |
| 13 | [Hooked](https://www.bilibili.com/video/BV1iJpJ66EbF) | 2026-10-11 | 2:42 | 806,898 | 75,637 | 37,301 | 9.4% | 4.6% | 0.69% | 3781 | dopamine and intimacy (from tags) |
| 14 | [You gave it everything, so why are you still in the same place?](https://www.bilibili.com/video/BV1oya26rEH4) | 2026-10-02 | 2:44 | 625,011 | 105,148 | 38,091 | 16.8% | 6.1% | 0.40% | 10000 | Red Queen hypothesis |
| 15 | [Emergence: an epic of parameters](https://www.bilibili.com/video/BV1vXHr6eEoN) | 2026-10-04 | 2:42 | 583,929 | 62,252 | 20,686 | 10.7% | 3.5% | 0.47% | 3069 | scaling laws, emergence, grokking |
| 16 | [The same molecule in a mirror turns medicine into poison / 2026 Nobel Prize in Chemistry](https://www.bilibili.com/video/BV14mpv6qEEf) | 2026-10-10 | 2:40 | 443,966 | 50,060 | 16,871 | 11.3% | 3.8% | 0.52% | 11000 | molecular chirality |
| 17 | [Brain Arena: you do not have to beat them, you can change the rules](https://www.bilibili.com/video/BV14dnL6kEav) | 2026-10-19 | 2:11 | 402,660 | 25,982 | 10,446 | 6.5% | 2.6% | 0.24% | 463 | dopamine, cortisol and serotonin personified |
| 18 | [Catch: at 20 you hold only one thing; who did you throw it to?](https://www.bilibili.com/video/BV1qnJv65Eyn) | 2026-10-17 | 2:49 | 345,549 | 23,792 | 8,500 | 6.9% | 2.5% | 0.24% | not seen | sunk cost plus six other economics concepts (compilation) |
| 19 | [I spent ten years computing a formula that makes time run backwards](https://www.bilibili.com/video/BV1NDnR6JEAX) | 2026-10-26 | 2:38 | 328,464 | 28,784 | 8,612 | 8.8% | 2.6% | 0.17% | 585 | second law of thermodynamics, Poincare recurrence (from tags) |
| 20 | [Learning from Birds / what are principle, method, technique and tool?](https://www.bilibili.com/video/BV1Trx76bEVX) | 2026-10-28 | 2:42 | 269,680 | 24,355 | 6,926 | 9.0% | 2.6% | 0.13% | 192 | the Dao-Fa-Shu-Qi framework, aerodynamics |
| 21 | [Epiphany in the Shower](https://www.bilibili.com/video/BV1Cmn865EyB) | 2026-10-23 | 2:14 | 255,536 | 28,865 | 11,727 | 11.3% | 4.6% | 0.42% | 1375 | default mode network |
| 22 | [You are not irrational, you only have one life: the expected-utility trap](https://www.bilibili.com/video/BV1mgHh6pEuf) | 2026-10-03 | 2:42 | 154,118 | 15,271 | 5,359 | 9.9% | 3.5% | 0.53% | 1001 | ergodicity economics (Ole Peters 2019) |
Xiaohongshu also carries one note not on Bilibili ("Reply: five thousand
years of humans teaching AI to speak", 345 likes); the Bilibili "Catch" video
was not seen in the logged-out Xiaohongshu grid.

## Cross-platform differences
| Video | Bilibili views | Xiaohongshu likes | XHS likes per 10k views | Leaning |
|---|---|---|---|---|
| 37% rule (pinned on XHS) | 1.136M | 54k | 475 | Xiaohongshu strong |
| Entropy (pinned on XHS) | 1.098M | 40k | 364 | Xiaohongshu strong |
| Optogenetics | 3.941M | 100k+ | 254+ | Strong on both |
| Chirality | 444k | 11k | 248 | Xiaohongshu strong |
| Red Queen | 625k | 10k | 160 | Xiaohongshu leaning |
| Silver Medal Tears | 4.757M | 63k | 132 | Strong on both |
| I love you x1000 | 1.506M | 19k | 126 | Balanced |
| Gaming the score | 1.694M | 20k | 118 | Balanced |
| Razor | 2.575M | 30k | 117 | Balanced |
| Tit for Tat | 1.469M | 11k | 75 | Bilibili leaning |
| IceCube neutrinos | 1.665M | 3,515 | 21 | Bilibili strong |
| Direction of the Wind | 1.296M | 1,311 | 10 | Bilibili strong |

- Xiaohongshu rewards savable life tools: the 37% rule, entropy and
  chirality earn two to four times the Bilibili ratio. Pinning amplifies,
  but the unpinned chirality note still reached 11k.
- Bilibili rewards cosmic spectacle and lyrical narrative: neutrinos and
  wind pass a million views there and stay in the low thousands of likes on
  Xiaohongshu (inference: Xiaohongshu viewers need to see themselves in it).
- Douyin: profile only - 136.2k followers, about one sixth of Bilibili.

## Risk signals
| Risk | Evidence | Level |
|---|---|---|
| AI template fatigue | Top comments: "AI can only mass-produce, it smells pre-made" (321 likes); "classic Claude, the exact same BGM" (100); "so many with the same UI and audio" (69) | High |
| Logic challenged | I love you x1000 accused of swapping concepts (347-like long comment); Tit for Tat "reasoning gives way to emotion" (150); Razor "the logic is a mess" (117) | Medium |
| Late-period decline | The five videos after 10-17 average 320k views, like/view 8.2%, share/view 0.24%, all below the early period | High |
| AI and originality labels | Several pinned notes say the label "cannot be changed"; throttling risk if platform rules tighten (inference) | Medium |
| Lane crowding | A top comment says Douyin already has "a batch of hits, aesthetic fatigue"; Opus-style tools lower the barrier | Medium |

## Evidence boundaries
- Bilibili numbers are as displayed at 2026-10-30 14:39 (UTC+8). Cumulative
  counts favour earlier videos; group averages use a manual grouping in which
  one video can sit in several groups.
- Caption lines for the 11 watched videos come from OCR of burned-in
  captions and are translated here; the remaining 11 are described from
  metadata, and two concepts (Hooked; the ten-year formula) are inferred
  from tags.
- Xiaohongshu: titles and likes only; the follower figure is the owner's.
  Douyin: profile header only. Cross-platform ratios are directional,
  distorted by pinning and publish date.
- Facts claimed inside the videos are the videos' claims, not verified by
  us. Any reuse needs its own fact card under the baseline workflow.

## Disposition
Study object only. The account independently validates our topic selection
standard (universal moment, counter-intuitive reversal, hard backing) and
adds one data point the standard does not yet state: an explicit emotional
reconciliation at the end, phrased so the viewer can forward it, is present
in every hit. The craft borrowings - one-number spine, film-title card by
0:26, a single "back to your life" turn - are listed in the narrative
formula file. The lane is crowding and template fatigue is already visible
in comments, so differentiation (voiced narration, 3D craft, verified
numbers) matters more than imitation.
