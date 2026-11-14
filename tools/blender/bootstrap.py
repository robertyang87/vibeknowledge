"""Enable the installed add-on inside a GUI Blender process."""
import bpy
bpy.ops.preferences.addon_enable(module='blender_mcp')
import blender_mcp
bpy.context.scene.blendermcp_port=9876
bpy.context.scene.blendermcp_auto_start_server=True
blender_mcp._blendermcp_ensure_server_running()
print('BLENDER_MCP_READY',flush=True)
