# Tooling landscape 011: Motion Face (motionface.cc) - a community plaza for replicated motion code

Checked first-hand 2026-10-31 (site read in full without login, sharing guide,
recharge page, and the linked GitHub organisation read directly).
Shared by the account owner the same day; filed at his direction into the
evaluation queue, with no trial authorised yet.

## What it is

- Motion Face ("motion plaza") is a sharing community for AI-replicated motion
  graphics code, run by the vibe-motion community (GitHub organisation
  vibe-motion; site footer carries a Zhejiang ICP filing, no company name).
  Its slogan: one person replicates, everyone shares.
- The model: a creator uses AI to re-create a motion clip as code (Remotion),
  pushes the code to a public GitHub repository and binds it to the clip.
  Later users skip the replication step and remix the existing code with their
  own title, colours and content.
- It is the successor surface of vibe-motion/skills (1,467 stars, 90 forks,
  created 2026-03-17): sixteen agent skills for Remotion and Three.js motion
  effects (ruler progress, CLI typer, vinyl player, 3D photo ticker, earth
  routes, WeChat chat motion, a Disney-principles animation skill, and
  others). That repository now states it is no longer maintained and points
  readers to motionface.cc. The same organisation also hosts auto-motion, an
  SRT-driven workflow that splits a narration into shots and builds MG
  animation automatically (currently HyperFrames-based).

## Plaza facts (2026-10-31)

- 105 clips listed, six pages. Five categories with site counts:
  information graphics 23, typography 21, interface demos 17, background
  effects 16, scene narrative 11. The category counts sum to 88, not 105;
  the site does not explain the remaining 17.
- Most cards are marked as replicated and bound to a GitHub repository.
- Knowledge-explainer candidates relevant to this account: a ranking-climb
  animation (information graphics, 8 s, 20 likes), a leaderboard animation
  (10 s), a candlestick chart display (7 s), an eight-step process with a
  travelling connector line (7 s), a three-part document focus-and-expand
  (14 s), and a pop-up-book scene narrative (38 s, 52 likes, the
  highest-rated narrative clip).

## Access, pricing and rights

- Browsing is free, but clip details, ratings and code access sit behind a
  GitHub login ("log in with GitHub to view clip details").
- Code access runs on a credit unit, Face (1 yuan = 10 Face). Unlocking one
  clip's full set of GitHub code links costs 10 Face and lasts one calendar
  month; the uploader views free. New accounts receive 10 Face. Contributors
  earn Face for replications and AI-native shares (up to 5 per share), settled
  daily.
- Sharing a replication requires pushing the code to a public GitHub
  repository and binding it to the original clip; the guide names no private
  option.
- Rights gap: no terms page, privacy page or licence statement was found on
  the site, and nothing states the licence of replicated code or the reuse
  position of the original reference videos. Until a specific bound
  repository's own licence is read, no code from this plaza is borrowable.
- The headline claim that remixing cuts token consumption by 95 percent has
  no published method, baseline or sample behind it; recorded as marketing,
  not evidence.
- Side service: a copy-to-video marketplace (paste a narration script, up to
  90 seconds; 15 styles; a human operator delivers film plus source within
  12 hours, priced per subtitle line in Face). Noted as a lead only; quality
  unverified and the outsourcing model conflicts with this account's
  fact-gated production.

## Assessment

- This is a distribution and reuse layer for code-drawn motion, not an
  engine and not a directing discipline: it competes with no lane in the
  index and cannot displace the main line, whose value is the Treatment,
  fact gates and series styling built on Lemo-Opuscar.
- Its plausible use here is narrow and concrete: pre-built information
  graphics (rankings, leaderboards, charts, process diagrams) as starting
  code for explainer inserts, where our baseline currently hand-builds every
  diagram. That is the same shelf MotionGit occupies for the tennis line,
  with two extra frictions MotionGit does not have: a login-plus-credit
  gate in front of every clip, and no stated licence.
- Volume is small (105 clips) and quality is uneven: the plaza's own
  ratings include information-graphics entries with zero likes and
  double-digit dislikes, so selection must be per clip, not per platform.

## Verdict

Evaluation queue, fourth position, behind huashu-art-motion,
vibe-knowledge-film and the HyperFrames backend trial; nothing installed and
no account created. Test protocol, if the owner later authorises a trial:
he performs the GitHub login himself; unlock the ranking-climb clip; read
the bound repository's licence before touching its code; remix one tennis
ranking sequence as a sample and compare it against a main-line build of
the same sequence on accuracy, styling fit and total effort. Adopt per
clip, never per platform.

## Trial outcome (2026-10-31, owner-authorised)

The owner authorised the trial the same day: GitHub OAuth login (app name
"motion-recorder", sole scope read-only email addresses), then the full
10 Face new-account balance was spent unlocking the ranking-climb clip
(valid until 2026-11-30; balance now 0). Findings:

- Four bound repositories were revealed. Two are dead links (404: one
  single-purpose "repo" repository, one ADAS OTA ranking repository).
  Two are alive Remotion projects (1080 x 1920, 30 fps, 8 s): one climbing
  an AI-model arena leaderboard, one adapting the same template and the
  same score data to A-share companies. Neither carries a licence file.
- Because no bound repository states a licence, no code was reused. The
  sample was built clean-room from the generic grammar (highlighted row
  climbing a ladder, milestone lines, easing, final hold) in our own
  renderer and series tokens at 1080 x 1440, using Zheng Qinwen's verified
  2026 climb (No.160 to No.54 to No.23 to No.22). Sample and script are
  kept locally under the motionface-trial workspace folder.
- Measured platform quality on this clip: 50 percent link rot among bound
  repositories, no licence discipline, and replicas of replicas (the
  second live repository inherits the first one's data table verbatim).

Revised verdict: trial closed. Motion Face stays a concept-level
reference (watch what forms the community replicates), not a code source:
do not unlock further clips unless a specific clip is worth an originality
and licence check in advance, and never budget Face purchases for it.
The evaluation-queue slot is released; the main line is unchanged.
