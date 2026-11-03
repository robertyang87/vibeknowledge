# Tooling landscape 018: field report - one agent-run Douyin knowledge account, 13 days, 370k plays, then stopped

Filed 2026-11-03 at the owner's direction, experiment data
first. Source: a first-person X article by @Charles77xixi
(2026-11-03) reporting his own Douyin experiment end to end.
All platform numbers below are the author's published figures
(his creator-backend data, stated as of 2026-11-02); they were
not independently verified, and cannot be from outside Douyin.
The tool facts were checked first-hand on GitHub the same day.

## The experiment

- A brand-new Douyin account, zero followers, no paid boosting.
  For 13 days the whole line ran by agents: a topic radar
  scanning rising videos in a niche, one sub-agent per topic
  working in parallel from primary-source research through
  script, voice, code-drawn frames, cover and posting copy, a
  serial scheduled-posting queue with pre-publish verification
  that halts on any mismatch, and post-publish data written
  back into a local operations manual that steers the next
  round of topics. The author's own daily work reduced to two
  acts: approving or striking topics on a list, and eyeballing
  finished renders.
- Output: about 40 videos in 13 days, about 370,000 plays in
  total. Distribution was extreme: one video at 231,000 plays,
  one near 99,000, three just over 10,000, the rest from a few
  thousand down to 23 plays.
- He stopped on purpose: last test batch posted 2026-10-31, the
  scheduled series cancelled a few days earlier. His two
  reasons are the data sections below.

## Finding 1: the topic rule that separated the winners

Winning topics passed three questions, which he derived from
the run rather than assumed beforehand:

1. Is the title's subject "you"?
2. Does the answer overturn a doubt the viewer holds about
   themselves, with one concrete number they can locate
   themselves in?
3. Does the viewer leave with something they can act on?

The video passing all three ("you may simply not have won
enough times yet", the winner effect) reached a 1.35 percent
save rate, eleven times a pure-curiosity topic (why a paperclip
snaps) from the same account and pipeline. Conclusions he drew
and this repo should keep:

- Once the opening is adequate, distribution tracked the save
  rate and like rate, not retention. His first five videos all
  sat between 33 and 45 percent two-second bounce, yet final
  plays differed fifty-fold; the best-retention video received
  one sixth of the winner's recommendation traffic.
- A self-locating number drives comments: the life-happiness
  video asked at what age happiness bottoms out, viewers
  answered with their own age, 2,537 comments and 7,053 shares.

## Finding 2: plays did not convert, and he says why

- 370,000 plays produced 186 followers, about 0.05 percent.
  The top video (231,000 plays) brought 40 followers; the
  winner-effect video (99,000 plays) brought 102, the most of
  the run. His read: emotional comfort is shared and swiped
  past, self-improvement is saved and followed for later use.
- For an anonymous generic-knowledge account he found no
  monetisation path at all: viewers arrive for the question,
  leave satisfied, and remember nothing; the traffic cannot
  settle into a person or a product.
- Application here, recorded plainly: this account
  shares the generic-knowledge risk and should treat conversion
  as an open question, not an assumption. The owner's tennis
  brand is the opposite shape (a named vertical with a
  community) and is not covered by this finding.

## Finding 3: variance and the duplicate penalty

- Same pipeline, same quality bar: per-video plays spanned
  23 to 231,000, a factor of about ten thousand, decided by
  the recommendation system rather than the work.
- One operational datapoint worth keeping: a batch he deleted
  and re-uploaded was apparently judged duplicate content -
  its recommendation stopped after a few dozen impressions
  while the creator backend showed its status as normal. It
  matches the standing rule on the owner's Instagram edition:
  never delete and repost; fix the cover in place.

## The pipeline, where it converges with our baseline

Independently of this repo, his production rules include:
numbers with no findable primary source are never used;
computable claims (probability, combinatorics) are computed
in code and the code archived; the script model writes, the
agent only checks and sends feedback, at most two rewrite
loops; word-level timestamps align cuts, actions, sound and
subtitles; a stillness rule (a passage frozen over 2 seconds
may occur at most twice per minute); a contact-sheet self
check of the fullest frame of every scene; and a per-film
production report listing fact sources, decisions taken on
the author's behalf, and the version's known shortcomings.
His closing judgement: production is fully delegable; topic
judgement and distribution are not.

## The tool

- anneheartrecord/charles-video-maker: 15 stars, 4 forks, MIT,
  created 2026-10-19, pushed 2026-11-03, about 3.4 MB. The
  skill packaging the pipeline above (topic radar, per-topic
  sub-agents, Douyin scheduled posting via a self-supplied
  logged-in creator-centre browser profile, data write-back).
  At 15 stars it has no track record; nothing here recommends
  installing it. Its README carries the three representative
  films with their Douyin links and numbers.

## Verdict

Filed as a peer field report on the reference shelf - data,
not a tool adoption: nothing installed, no trial, no queue
change. Revisit when this account's own topic standards are
next revised, or if its conversion data starts to resemble
his.
