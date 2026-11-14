# Deliver videos through GitHub Releases

GitHub Releases are the user's requested default destination for completed
videos. Use the repository associated with the video; this workspace uses
`robertyang87/vibeknowledge`. A finished episode should have one release with
stable, browser-accessible download links.

## Assets

- Final MP4, with narration and sound mixed into the file.
- Matching cover image.
- SRT subtitles when the film has captions.
- Editable project ZIP, including necessary local assets, source references,
  credits, and build instructions. Exclude dependencies, caches, credentials,
  private reference files, and intermediate renders.
- SHA-256 checksums for the uploaded files.

Use ASCII asset filenames and English release metadata, following the
repository's language convention. Audience-facing video copy retains its
selected language. Never add large final renders to Git simply to create a
download URL.

## Publish and verify

1. Complete the episode's factual, visual, speech, codec, and archive checks.
2. Choose an episode tag such as `katago-2026-11-14`; check whether it already
   exists. A revision gets a new version suffix instead of silently replacing
   an earlier delivery.
3. Stage the assets and checksums outside the tracked source tree.
4. Create the release against an explicit, verified repository commit. Write
   release notes to a UTF-8 file and pass `--notes-file` to `gh release create`.
5. Read back the release and its asset list. Verify expected asset sizes and
   download the uploaded bytes to compare their SHA-256 checksums.
6. Return the release's HTTPS page as the primary delivery link. Direct asset
   download links can accompany it. Do not rely on cloud workspace paths.

The user's release instruction supplies routine upload authorization. It does
not authorize deleting earlier releases, changing repository access, or
posting the video on social platforms.

## Upload-host credential fallback

This cloud environment can authenticate GitHub API writes while the separate
release-upload host rejects its local credential. The repository includes a
manual `publish-video-release.yml` workflow for that case.

`tools/publish_video_release.py` stages file chunks as unreferenced Git blobs,
never as commits or branch content, then dispatches the workflow with a
manifest. The workflow reconstructs every asset, verifies its size and SHA-256,
and uploads using its repository-scoped Actions token. Staging blobs are
unreferenced transport objects, not media added to source history.

```bash
python3 tools/publish_video_release.py --tag <existing-release-tag> \
  --manifest-out /tmp/video-release-manifest.json \
  /path/to/film.mp4 /path/to/cover.png /path/to/captions.srt /path/to/project.zip
```

This requires a writable GitHub API credential and Actions permission. Keep
all dependencies and credentials out of the release archive. Verify the
completed workflow, then download and hash the actual release assets before
returning their links.
