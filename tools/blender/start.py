"""Start the local Blender bridge, optionally handing stdio to its MCP server."""
import argparse,json,os,shutil,socket,subprocess,sys,time
from pathlib import Path
HERE=Path(__file__).resolve().parent
STATE=Path.home()/'.cache/vibeknowledge/blender';STATE.mkdir(parents=True,exist_ok=True)
def ready():
 try:
  with socket.create_connection(('127.0.0.1',9876),timeout=1) as s:
   s.sendall(b'{"type":"ping"}');return json.loads(s.recv(4096)).get('status')=='success'
 except (OSError,ValueError):return False

def start():
 if ready():return
 env=os.environ.copy();display=env.get('DISPLAY') or ':99';env['DISPLAY']=display
 env['LIBGL_ALWAYS_SOFTWARE']='1'
 env.setdefault('BLENDER_DEMO_OUTPUT',str(HERE.parent/'remotion/public/blender'))
 if not env.get('DISPLAY') or display==':99':
  if not Path('/tmp/.X11-unix/X99').exists():
   xvfb=shutil.which('Xvfb') or str(Path.home()/'.local/share/vibeknowledge/xvfb-root/usr/bin/Xvfb')
   if not Path(xvfb).is_file():raise RuntimeError('Xvfb is required when no display is available')
   Path('/tmp/.X11-unix').mkdir(exist_ok=True)
   with (STATE/'xvfb.log').open('ab') as log:
    p=subprocess.Popen([xvfb,display,'-screen','0','1280x1024x24','-ac','-nolisten','tcp'],stdout=log,stderr=log,start_new_session=True)
   (STATE/'xvfb.pid').write_text(str(p.pid))
 blender=shutil.which('blender')
 if not blender:raise RuntimeError('Blender is not installed')
 with (STATE/'blender.log').open('ab') as log:
  p=subprocess.Popen([blender,'--factory-startup','--python',str(HERE/'bootstrap.py')],stdout=log,stderr=log,env=env,start_new_session=True)
 (STATE/'blender.pid').write_text(str(p.pid))
 for _ in range(240):
  if ready():return
  if p.poll() is not None:raise RuntimeError('Blender exited; inspect '+str(STATE/'blender.log'))
  time.sleep(.25)
 raise TimeoutError('Blender bridge did not start; inspect '+str(STATE/'blender.log'))
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--mcp',action='store_true');a=parser.parse_args();start()
 if a.mcp:
  os.environ.update(BLENDER_HOST='127.0.0.1',BLENDER_PORT='9876',DISABLE_TELEMETRY='true')
  uvx=shutil.which('uvx')
  if not uvx:raise RuntimeError('uvx is not installed')
  os.execv(uvx,[uvx,'mcp-for-blender==2.2.9'])
 print(json.dumps({'connected':True,'host':'127.0.0.1','port':9876}))
