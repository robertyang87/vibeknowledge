"""Use the actual MCP stdio protocol to inspect or script the connected Blender."""
import argparse,asyncio,json,os,shutil
from pathlib import Path
from mcp import ClientSession,StdioServerParameters
from mcp.client.stdio import stdio_client
async def run(path):
 params=StdioServerParameters(command=shutil.which('uvx'),args=['mcp-for-blender==2.2.9'],env={**os.environ,'BLENDER_HOST':'127.0.0.1','BLENDER_PORT':'9876','DISABLE_TELEMETRY':'true'})
 async with stdio_client(params) as (read,write):
  async with ClientSession(read,write) as session:
   await session.initialize()
   if path:r=await session.call_tool('execute_blender_code',{'code':Path(path).read_text(),'user_prompt':'Verify the authorized Blender integration with an original Go-board render.'})
   else:r=await session.call_tool('get_scene_info',{'limit':10})
   print(r.model_dump_json(indent=2))
   if r.isError or any(getattr(c,'text','').startswith('Error ') for c in r.content):raise RuntimeError('Blender MCP tool returned an error')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--execute',type=Path);args=p.parse_args();asyncio.run(run(args.execute))
