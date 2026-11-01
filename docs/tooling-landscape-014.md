# Tooling landscape 014: Lightricks/LTX-2 recheck - LTX-2.5 and pipeline v1.5.0

Checked first-hand 2026-11-01 (GitHub API repository, releases and
commits read directly; README and Hugging Face model cards read
directly). Trigger: an X post by @xiaoying_eth (2026-10-31) listing
ten open AI film repositories. The set is identical to the list from
@wanerfu filed in landscape 002 on 2026-10-29, where the generative
video-model lane was checked and rejected. The owner asked for one
item from that list, LTX-2, to be rechecked for recent updates before
this filing. Nothing was installed and no trial was authorised.

## What changed since landscape 002

- The repository the 2025 post pointed at has a full release history
  behind it now. Lightricks/LTX-2 on GitHub: created 2026-01-03,
  10,001 stars and 1,583 forks at this check, 56 open issues.
  Latest push 2026-10-18; no commits and no releases in the two
  weeks since, up to this check on 2026-11-01.
- Model line, in order:
  - LTX-2 announced 2025-10-23; open weights followed in January
    2026 (19B, paper arXiv 2601.03233).
  - LTX-2.3, 2026-03-05: 22B, a rebuilt VAE for sharper detail,
    native portrait video instead of cropped landscape, cleaner
    audio and stronger prompt adherence; a distilled 1.1 refresh
    followed.
  - LTX-2.5, 2026-08-11: 22B, the model the README now recommends.
    Native multishot generation in one pass, resolutions up to
    3840 x 2176, a Gemma 4 12B text encoder (LTX-2.3 used Gemma 3),
    dev and distilled transformers plus int8 and NVFP4 quantised
    checkpoints.
- Pipeline releases in the repository, August to October 2026:
  - v1.2.0 (2026-08-11): support for LTX-2.5 checkpoints.
  - v1.3.0 (2026-08-26): a tiled spatial epilogue finishes 4K
    without denoising the full canvas in stage 2.
  - v1.4.0 to v1.4.2 (2026-09-29 to 2026-10-02): chunked long-video
    generation (97-frame windows, 25-frame carry), streamed HDR
    encoding, and an alpha-generation IC-LoRA pipeline.
  - v1.5.0 (2026-10-18, current): keyframe conditioning gains
    explicit replace and guide bindings; the standalone keyframe
    interpolation pipeline is removed and absorbed into the
    two-stage TI2Vid pipeline; multi-GPU performance work; a
    DiffVAE fix for grey frame tails on long 1080p clips.
- Pipeline surface now also includes DFR (a production-quality
  path: the distilled transformer plus generated keyframes and a
  spatial detailing pass), Retake (regenerate one time region of
  an existing clip), audio-to-video, HDR IC-LoRA, and DubIt
  (rephrasing with speaker identity and lip movement matched,
  renamed from LipDub in August 2026).

## Standing facts that did not change

- Cost of entry: the README quick start downloads about 66 GiB
  (distilled transformer, Gemma 4 encoder, video and audio VAEs,
  spatial upscaler) from a gated Hugging Face repository, after
  accepting the model terms. One run is at most 121 frames at
  24 fps, about 5 seconds; the DFR default frame is 1024 x 1536.
- Runtime requirements: Linux-first, CUDA above 12.7, PyTorch
  about 2.7, Python 3.12 or later, and in practice an NVIDIA GPU
  with enough VRAM for a 22B model, with FP8 quantisation and CPU
  or disk offload as the documented relief valves. Neither the
  owner's Apple Silicon laptop nor this project's render VM meets
  that profile, so any use would mean a hosted API, not a local
  install.
- Licence: since 2026-08-11 the model sits under the LTX-2.x
  Community License Agreement, not a permissive open-source
  licence (GitHub detects NOASSERTION). A paid Commercial Use
  Agreement is required from USD 10 million in annual revenue.
  That cap does not bind this non-commercial account, but the
  gated download and the custom terms are part of the record.
- The headline capability is still joint generation: one model
  writes picture and synchronised sound together from a text or
  image prompt. That audio is prompt-generated, not a controllable
  text-to-speech route, so it cannot stand in for this account's
  narration pipeline, where wording, pronunciation and listen-back
  gates are the point.

## Assessment against this account's gates

- Information precision: an explainer frame here must carry exact
  numbers, labels and diagrams. A generative model offers no such
  guarantee, and none of the 2.3, 2.5 or v1.5.0 notes claims one.
- Physical correctness: the owner's standing rule from the tennis
  line (2026-10-28) is that generated footage is not trusted for
  action - player counts, court positions and ball behaviour
  failed dense-frame checks. The new releases improve sharpness,
  prompt adherence and multishot continuity in general terms;
  none publishes a sport or mechanics benchmark that would reopen
  that finding.
- One slot genuinely improved: atmosphere-only material. Native
  portrait framing, explicit keyframe guide bindings and Retake
  make a short empty-venue or crowd establishing shot more
  controllable than the 2025 version was. If such a shot is ever
  wanted and real footage cannot carry it, the proportionate test
  is one hosted-API clip checked frame by frame, not an install.
- The editor tools in the same X list (OpenChatCut,
  FireRed-OpenStoryline, AutoSubs, Editly) were not rechecked;
  the landscape 002 finding stands, because this account's
  timeline and subtitles are generated from code.

## Verdict

Checked and rejected, unchanged: LTX-2 stays in the generative
video-model lane recorded in the tooling index, with no install,
no trial and no evaluation queue position. This filing updates
the lane's facts to LTX-2.5 and pipeline v1.5.0 (2026-10-18).
Revisit only for a named atmosphere-only need, tested through a
hosted API under the frame-check rule above.
