# Repository instructions

## Video delivery

The user's standing instruction is to deliver completed videos through GitHub
Releases in the video's repository. For this workspace, use
`robertyang87/vibeknowledge`. This is authorization to upload finished video
deliverables there; do not ask again for routine release delivery.

- Finish source, factual, visual, audio, and file checks before publishing.
- Upload the final MP4 as a release asset. Include the cover, subtitles, and
  editable project archive when available.
- Return the HTTPS release page and asset links after checking the upload.
  Local workspace paths are not sufficient delivery links for this user.
- Keep large video, audio, and project archives out of Git history. Use release
  assets for those files; keep reviewable code and documentation in Git.
- Give each episode a descriptive, versioned tag. Preserve older releases and
  assets when making a revised edition.
- Do not change repository visibility or publish to other content platforms
  unless the user requests it.

See [release delivery](docs/release-delivery.md) for the workflow.

## Production tools

Blender MCP and Remotion are configured on the cloud computer. Read
`docs/video-tooling.md`, `tools/blender/README.md`, and
`tools/remotion/README.md` before using or changing those integrations. The
Blender launcher can start the local bridge; the Remotion project pins package
versions and includes a verified Blender-input composition.

## Source conventions

Follow CONTRIBUTING.md and the README's English-only policy for our code and
documentation. Audience-facing video copy belongs in `scripts/` or
`episodes/<episode>/copy/`. Preserve third-party submodule pins and licensing.
