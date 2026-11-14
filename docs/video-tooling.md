# Blender and Remotion production tooling

The cloud workspace now has two complementary tools:

| Tool | Installed version | Role | Verification |
| --- | --- | --- | --- |
| Blender | 4.3.2 | Geometry, procedural materials, lighting, cameras, 3D animation | Actual Cycles CPU render of an original Go set |
| MCP for Blender | 2.2.9 | Live scene inspection and Python control over local MCP | MCP initialization, 10 tools discovered, code executed and `.blend` saved |
| Remotion | 4.0.543 | React timelines, titles, captions, transitions, audio and final composition | Studio loaded, TypeScript/ESLint passed, 90-frame H.264 exported |

The integration check passes a real Blender render into Remotion as an image
asset, then animates the composition for 3 seconds at 1280x720 and 30 fps.
The output was inspected and probed. This is a silent test, not a revised
KataGo episode. The original KataGo film is delivered in its own Release.

## Use

- [Blender bridge](../tools/blender/README.md): startup, MCP client, and scene
  generator. The registered Codex MCP entry starts Blender as needed.
- [Remotion project](../tools/remotion/README.md): local Studio and render
  commands, pinned packages and the Blender input asset.
- [Release delivery](release-delivery.md): final files belong in Releases.

The MCP registration is in this cloud computer's Codex configuration. Newly
registered native MCP tools load in the next Codex session. The SDK client
can already use the same interface from the current session. No installation
on a separate personal computer is implied.

The current machine uses software display/CPU rendering. It does not claim
GPU render performance or OpenImageDenoise availability. Production renderer
and sample settings should be chosen for each film; the demo explicitly
avoids the unsupported denoiser.
