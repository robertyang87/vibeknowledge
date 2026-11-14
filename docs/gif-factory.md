# GIF Factory

[GIF Factory](https://github.com/WoYun520/gif-factory) provides production
instructions, export scripts, style references, and examples for animated
stickers, cards, posters, signatures, titles, storybooks, brand films, and
mechanism explainers. Its original code and instructions use the MIT license;
third-party assets retain the licenses documented upstream.

## Installation

The upstream repository is pinned as a submodule at `vendor/gif-factory`
at commit `bd6bc31a6e0bebe2be5f79838613bd8041052481` (2026-11-14).
Initialize it after cloning this workspace:

```bash
git submodule update --init --depth 1 vendor/gif-factory
```

Project-local Codex skills in `.agents/skills/` link to that copy. Open this
repository as the workspace and start a new Codex session to discover them:

| Invocation | Purpose |
| --- | --- |
| `$pixel-gif-sticker-pack` | Main GIF Factory entry point |
| `$dynamic-art-signature` | Animated signatures |
| `$cinematic-title-lettering` | Film title artwork |
| `$compact-storybook` | Animated storybooks |
| `$paper-mechanism-explainer` | Mechanism and financial explainers |

The main skill selects the appropriate workflow from a plain-language brief.
Read `vendor/gif-factory/GUIDE.md` for supported outputs and examples.

## Runtime tools

Installing a skill does not install every renderer or external service.
Basic GIF export uses Python 3 and Pillow. Animated signatures also use NumPy;
video previews and inspection use FFmpeg and ffprobe. If missing, prepare the
Python dependencies in an isolated environment:

```bash
python3 -m venv .venv-gif-factory
.venv-gif-factory/bin/python -m pip install Pillow numpy
.venv-gif-factory/bin/python vendor/gif-factory/scripts/export_pack.py --help
.venv-gif-factory/bin/python vendor/gif-factory/scripts/export_keyframes.py --help
```

Install FFmpeg through the host's package manager when a selected workflow
needs video. Image generation, narration, HyperFrames, and other renderers
are prepared only for the selected production workflow; this installation
does not configure paid services or download generation models.

The cutaway workflow requires the separate Lemo-Opuscar skill and rendering
runtime. The existing `vendor/lemo-opuscar` submodule remains pinned to its
current version; its presence alone does not install that runtime. See
`vendor/gif-factory/skills/paper-mechanism-explainer/references/lemo-cutaway.md`
and [our Lemo-Opuscar notes](lemo-opuscar.md) before using that workflow.

## Repository conventions

- Treat `vendor/gif-factory` as read-only upstream content. Put episode
  projects and generated deliverables in this repository's episode folders.
- Keep our own documentation and code in English. Upstream submodule content
  is excluded by the existing language checker.
- Record the upstream commit used in each episode's production log. Update
  the pin deliberately after reviewing upstream changes.
- Preserve the source and license notes for fonts, music, examples, and
  third-party workflows used in a production.
