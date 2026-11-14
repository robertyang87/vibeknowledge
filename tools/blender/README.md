# Blender MCP bridge

The managed cloud computer has Blender 4.3.2 and the `mcp-for-blender` 2.2.9
add-on installed and enabled. Its local socket listens at `127.0.0.1:9876`.
Codex is registered with the `blender` MCP server; it starts this bridge on
first use. Telemetry is disabled. This config applies to the cloud computer,
not to a separate Blender installation on the user's personal device.

The actual MCP protocol was verified: initialization, tool discovery, scene
queries, Python execution, saving a `.blend`, and rendering an original Go set.
The bridge offers 10 MCP tools, including `get_scene_info`,
`execute_blender_code`, and `look`.

## Commands

```bash
python3 tools/blender/start.py
uvx --from mcp-for-blender==2.2.9 python tools/blender/mcp_client.py
uvx --from mcp-for-blender==2.2.9 python tools/blender/mcp_client.py \
  --execute tools/blender/demo_scene.py
```

On a computer with a normal display, the launcher uses it. In the selected
cloud environment it uses a user-local Xvfb binary, without modifying system
packages. No GUI action is needed to start the server. Blender operations run
through the add-on on Blender's main thread.

For another computer, install Blender, uv, and a display/Xvfb, then run:

```bash
uvx mcp-for-blender==2.2.9 install-addon
codex mcp add blender --env DISABLE_TELEMETRY=true -- \
  python3 /absolute/path/to/tools/blender/start.py --mcp
```

Restart that Codex session to load newly registered native tools. The SDK
client above can already call the server from this running session.

## Rendering notes

- The demo uses Cycles on CPU and writes its PNG and editable scene to
  the `BLENDER_DEMO_OUTPUT` directory. The launcher defaults it to
  `tools/remotion/public/blender/`; without that variable the demo uses
  `~/.cache/vibeknowledge/blender/`.
- This Blender build lacks OpenImageDenoise support, so the demo explicitly
  disables that option instead of relying on an unavailable feature.
- A rendered frame can be placed in `tools/remotion/public/blender/` and
  referenced with Remotion's `staticFile()`.
- Keep the socket bound to loopback. External generation services are not
  needed for modeling, materials, lighting, camera animation, or rendering.

Upstream: https://github.com/ahujasid/blender-mcp (MIT).
