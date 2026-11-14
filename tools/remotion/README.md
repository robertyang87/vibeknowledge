# Remotion video composition

Remotion 4.0.543 is pinned in this workspace with its CLI, React, TypeScript,
Studio, and renderer. The scaffold is based on the official empty template.

```bash
cd tools/remotion
npm ci
npm run dev -- --no-open --port=3100
```

Open `http://localhost:3100/BlenderBridgeSmoke` from a browser on the cloud
computer. This is a local Studio address, not a public delivery URL.

The `BlenderBridgeSmoke` composition reads a real Blender-rendered frame from
`public/blender/blender-demo.png`, adds independently editable type and
frame-driven motion, and exports through the Remotion renderer.

```bash
npm run lint
npx remotion still src/index.ts BlenderBridgeSmoke out/bridge-preview.png \
  --frame=45 --browser-executable=/usr/bin/chromium
npx remotion render src/index.ts BlenderBridgeSmoke out/bridge-smoke.mp4 \
  --browser-executable=/usr/bin/chromium --codec=h264
```

The smoke clip is a silent tooling check, not a replacement for the KataGo
film. Production work can use Blender frame sequences/clips as assets and
Remotion for sequencing, captions, transitions, and audio. Install additional
Remotion packages with `npx remotion add` so versions stay aligned.

Large media and final exports go to GitHub Releases, following the root
AGENTS.md and docs/release-delivery.md. Do not commit node_modules or out/.

Remotion is a rendering/composition toolchain here; it is not represented as
an installed third-party MCP server. The available Remotion skills guide its
CLI and project workflows. Licensing: https://www.remotion.dev/license

## KataGo spatial film

`KataGoGold` is the production composition for the revised spatial gold
edition. It uses an original Blender glTF lattice, procedural Three.js scene
geometry, real perspective cameras, frame-driven particle/signal shaders,
selective bloom, Chinese typography and a reviewed narration/music/effects
mix. `KataGoSpatialProof` is a separate ten-second visual motion study.

Large production assets are supplied in the episode's Release project ZIP.
The archive preserves repository paths. Run
`sh episodes/katago-gold/project/build.sh` from the extracted root. For this
CPU cloud computer, `--gl=swangle` is the verified browser renderer. On another
machine choose the appropriate supported OpenGL backend. The source contains
no animation driven by wall time or the R3F `useFrame()` hook.
