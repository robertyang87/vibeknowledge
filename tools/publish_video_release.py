"""Stage verified release files as transient blobs and upload via GitHub Actions.

This fallback keeps media out of commit history when local upload-host
credentials are unavailable. Unreferenced staging blobs are not committed.
"""
import argparse,base64,concurrent.futures,hashlib,json,os,re,subprocess,time,urllib.request,urllib.error
from pathlib import Path

def main():
 p=argparse.ArgumentParser();p.add_argument('--repo',default='robertyang87/vibeknowledge');p.add_argument('--tag',required=True);p.add_argument('--manifest-out',type=Path,required=True);p.add_argument('files',type=Path,nargs='+');a=p.parse_args()
 if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',a.repo):raise ValueError('Invalid repository')
 token=os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN')
 if not token:raise RuntimeError('An authenticated GitHub API token is required')
 def put(data):
  payload=json.dumps({'content':base64.b64encode(data).decode(),'encoding':'base64'}).encode()
  for attempt in range(4):
   req=urllib.request.Request(f'https://api.github.com/repos/{a.repo}/git/blobs',data=payload,headers={'Authorization':'Bearer '+token,'Content-Type':'application/json','Accept':'application/vnd.github+json','User-Agent':'vibeknowledge-release-publisher'})
   try:
    with urllib.request.urlopen(req,timeout=120) as r:return json.load(r)['sha']
   except urllib.error.HTTPError as e:
    if e.code not in [429,500,502,503,504] or attempt==3:raise
    time.sleep(2**attempt)
 assets=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
  for path in a.files:
   data=path.read_bytes();parts=[data[i:i+4*1024*1024] for i in range(0,len(data),4*1024*1024)]
   shas=list(pool.map(put,parts));assets.append({'name':path.name,'size':len(data),'sha256':hashlib.sha256(data).hexdigest(),'chunks':shas});print('Staged',path.name,len(data),'bytes;',len(parts),'parts',flush=True)
 manifest={'assets':assets};a.manifest_out.write_text(json.dumps(manifest,indent=2)+'\n');sha=put(json.dumps(manifest).encode())
 print('Manifest:',sha,flush=True)
 subprocess.run(['gh','workflow','run','publish-video-release.yml','--repo',a.repo,'-f','tag='+a.tag,'-f','manifest_sha='+sha],check=True)
 print('Release workflow dispatched.',flush=True)
if __name__=='__main__':main()
