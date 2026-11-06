# Tooling landscape 023 - Tesseract by Mirage (agent-driven 3D / video engine)

Status: TRIAL RUN on the Bushby episode's Bering Strait ice scene (2026-11-06). Verdict: conditional pass - approved as the atmosphere-scene lane, rendered on GPU hardware; the Lemo-Opuscar spine keeps maps, HUD and ledger scenes.

## What it is
- Free local creative engine from Mirage (the Captions company), announced 2026-09-22. An agent drives it through skills + a CLI; projects are editable .tsrct documents.
- The 3D skill authors native editable scenes: geometry, materials, lights, cameras, keyframed animation, scatter arrays, analytic sky, distance fog. Rendering is raster or path tracing (a CLI flag, not a project property).
- Install: skills from github.com/mirage-hq/Tesseract; CLI 0.5.0 from GitHub releases, checksum-verified, no account or API key. Engine is free; the real cost is agent time and render time.

## Trial setup
- Host: this Linux VM (4-core CPU, no GPU) with Mesa lavapipe software Vulkan extracted from the Ubuntu package pool (apt indexes were partially unreachable through the egress proxy; the loader was already present, only the ICD was missing).
- Scene: Bering Strait sea ice, 1080x1440, 18 s. Flat ice plane, 300 scattered ice chunks, an explicit pressure-ridge line of tilted slabs, a parked sled with an orange tarp at distance, analytic sky light plus a shadow-casting parallel sun, distance fog, slow camera push-in.

## Measured costs (this VM, 1080x1440)
- Raster still: 68-116 s per frame (rises with shadow load).
- Path tracer still, 16 samples, no denoise: 159 s per frame.
- Extrapolated: the full 18 s clip (540 frames) is ~24 h at draft path-tracing quality here, ~a week at production 128 samples. CPU rendering is not a production route; throughput must be re-measured on the user's Mac (Metal GPU) before the episode's atmosphere scenes are scheduled.

## Findings
- Authoring works as advertised: the whole scene was built in ~10 action batches; camera animation verified from rendered frames, not from stored keyframes.
- One-sentence revision verified: a single edit (move the camera end keyframe closer) changed only the framing in the re-render.
- Path tracing removes the rasterizer's fake specular blobs on the ice and produces coherent distance haze and contact shading; at 16 samples without the denoiser it is visibly grainy, as expected.
- Limitation: a scatter array cannot sample a surface whose displacement comes from a texture (the scatter runs outside the renderer). Workaround used: keep the ice flat and build the pressure ridge as explicit geometry - also the more truthful look for frozen sea.
- Limitation: baking a displace modifier is not supported (apply excludes displace and cloth).
- Limitation: the first denoised render downloads OIDN weights from captions-cdn.xyz; the fetch failed through this VM's egress proxy (TLS corruption). --no-denoise works; expect the download to succeed on a normal network.
- The analytic sky's lower hemisphere is black with no ground model; where the ice plane ends, a black band shows. Workaround used: flat color background matched to the fog color (reads as arctic whiteout), sky kept as the light source only.

## Gate record (per the episode TREATMENT)
1. Geometry and common sense hold: pass.
2. No fabricated documentary action (no human figure; parked objects only; scenes labelled as illustration): pass.
3. One-sentence revision changes only the named thing: pass.
4. Cost measured: pass with the GPU-host condition above.
