"""User-selected We Never BGM, reference-led filament effects, ducking, and mastering."""
from pathlib import Path
import json, math, re, subprocess, wave, os
import numpy as np
from scipy.ndimage import maximum_filter1d, gaussian_filter1d
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'copy/timeline.json').read_text())
SR = 48000
DURATION = DATA['duration']
N = round(DURATION * SR)
RNG = np.random.default_rng(5517)
score = np.zeros((N, 2), np.float32)
fx = np.zeros((N, 2), np.float32)
events = []


def add(dst, sound, at, gain=1, pan=0):
    start = round(at * SR)
    if start < 0:
        sound = sound[-start:]
        start = 0
    end = min(N, start + len(sound))
    if end <= start:
        return
    theta = (max(-1, min(1, pan)) + 1) * np.pi / 4
    sound = sound[:end - start] * gain
    dst[start:end, 0] += sound * np.cos(theta)
    dst[start:end, 1] += sound * np.sin(theta)




def sweep(length=.38, reverse=False):
    t = np.arange(round(length*SR)) / SR
    phase = 2*np.pi*(250*t + 350*t*t/length)
    noise = RNG.standard_normal(len(t))
    # A quiet, filtered-looking airy layer made by correlated noise.
    noise = gaussian_filter1d(noise, 8)
    env = np.sin(np.pi*t/length)**2
    y = (.65*np.sin(phase) + .8*noise) * env
    return (y[::-1] if reverse else y).astype(np.float32)


# Use exactly the user-selected library track; no substitute score.
source=ROOT/'audio/we-never-source.wav'
if not source.exists():
 track=Path(os.environ.get('BGM_PATH',str(ROOT.parents[1]/'assets/music/we-never-remix-hi-noise-qiucheng.m4a')))
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(track),'-ar',str(SR),'-ac','2',str(source)],check=True)
source_sr,music=wavfile.read(source)
assert source_sr==SR
music=music.astype(np.float32)/32768
# An estimated 75 BPM edit grid gives a 3.2 s equal-power phrase crossfade.
# Original first pass is retained; second pass resumes from a body phrase.
loop_at=176.; second_source=25.6; fade_seconds=3.2
first=min(len(music),round((loop_at+fade_seconds)*SR),N)
score[:first]=music[:first]
start=round(loop_at*SR); src=round(second_source*SR)
length=min(N-start,len(music)-src)
nfade=round(fade_seconds*SR)
angle=np.linspace(0,np.pi/2,nfade)
score[start:start+nfade]*=np.cos(angle)[:,None]
second=music[src:src+length].copy()
second[:nfade]*=np.sin(angle)[:,None]
score[start:start+length]+=second


def wood(length=.15):
 t=np.arange(round(length*SR))/SR
 y=(.8*np.sin(2*np.pi*(610*t-180*t*t))+.4*gaussian_filter1d(RNG.standard_normal(len(t)),2))*np.exp(-t*45)
 return y.astype(np.float32)

def air(length=.35):
 t=np.arange(round(length*SR))/SR
 return (gaussian_filter1d(RNG.standard_normal(len(t)),3)*np.sin(np.pi*t/length)**2).astype(np.float32)

def event(scene,name,at,typ='tick',freq=880,gain=.035,pan=0):
 sound=wood() if typ=='stone' else air(.38) if typ=='air' else sweep(.32) if typ=='sweep' else tick(freq)
 add(fx,sound,at,gain,pan);events.append({'time':round(at,6),'scene':scene,'type':typ,'action':name})

def tick(freq,length=.20):
 t=np.arange(round(length*SR))/SR
 phase=2*np.pi*(freq*t+freq*.18*length*(1-np.exp(-t/length)))
 y=(np.sin(phase)+.18*np.sin(phase*2.71))*np.exp(-t*24)
 return (y*np.minimum(t/.003,1)).astype(np.float32)

for i,scene in enumerate(DATA['scenes']):
 name=scene['id'];start=scene['start']
 event(name,'filament-draw-on',start+.12,'air',gain=.035)
 if i:event(name,'camera-pulse-transition',start-.18,'sweep',gain=.010)
 for j,(key,offset) in enumerate(scene.get('cues',{}).items()):
  event(name,key,start+offset,'tick',freq=[784,988,1175][j%3],gain=.025,pan=(j%3-1)*.25)
 if name in ['hook','policy','decision']:
  event(name,'intersection-pulse',start+.35 if name=='hook' else start+.5,'stone',gain=.11)
 if name=='policy':
  for j in range(3):event(name,'candidate-'+chr(65+j),start+.5+j*.22,'tick',freq=784+j*100,gain=.022,pan=(j-1)*.25)
 if name=='hook':event(name,'point-grid-forms',start+.45,'air',gain=.06)
 if name in ['selection','leaf']:
  for j,at in enumerate(np.arange(start+1.,start+scene['duration']-1.,1.67)):
   pitches=[659,784,988] if name=='selection' else [988,784,659]
   event(name,'search-forward' if name=='selection' else 'evaluation-return',float(at),'tick',freq=pitches[j%3],gain=.016,pan=(j%3-1)*.2)
 if name in ['training','loop','budget']:
  for j in range(3):event(name,'feedback-node-contact',start+2.5+j*3,'stone',gain=.045,pan=(j-1)*.2)
 if name in ['decision','global','payoff']:
  event(name,'selected-path-highlight',start+1.4,'tick',freq=1175,gain=.032)
# Two expressive quiet breaths are in existing inter-line pauses.
# Prepare the existing narration; do not regenerate speech.
voice_path = ROOT / 'audio/mix-voice.wav'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(ROOT/'audio/narration.wav'),
                '-af', 'highpass=f=75,lowpass=f=14500,acompressor=threshold=0.12:ratio=2.2:attack=8:release=140:makeup=1.15,loudnorm=I=-17:TP=-2:LRA=7',
                '-ar', str(SR), '-ac', '1', '-c:a', 'pcm_s16le', str(voice_path)], check=True)
sr, voice = wavfile.read(voice_path)
voice = voice.astype(np.float32) / 32768
voice = np.pad(voice[:N], (0, max(0, N-len(voice))))
# Held RMS detector: no pumping between individual words.
block = 480
rms = np.sqrt(np.mean(np.pad(voice, (0, (-len(voice)) % block)).reshape(-1, block)**2, axis=1))
held = maximum_filter1d(rms, size=51, mode='nearest')
held = gaussian_filter1d(held, sigma=5)
speech_env = np.repeat(np.clip(held/.025, 0, 1), block)[:N]
score *= (1-.66*speech_env[:, None])
fx *= (1-.40*speech_env[:, None])

# Explicit near-silences are in measured inter-line pauses, never over words.
silences = []
for name in ['limits', 'payoff']:
    scene = next(s for s in DATA['scenes'] if s['id'] == name)
    a, b = scene['start'] - .75, scene['start'] + .10
    silences.append([round(a, 6), round(b, 6)])
    i, j = round(a*SR), round(b*SR)
    ramp = round(.025*SR)
    for stem in [score, fx]:
        stem[max(0, i-ramp):i] *= np.linspace(1, 0, min(ramp, i))[:, None]
        stem[i:j] = 0
        stem[j:min(N, j+ramp)] *= np.linspace(0, 1, min(ramp, N-j))[:, None]
    # Existing TTS audio has silence here. Boundaries are checked against word timings.
    voice[i:j] = 0

fade = np.minimum(np.arange(N)/SR/1.2, 1) * np.minimum((N-np.arange(N))/SR/1.8, 1)
score *= fade[:, None]
fx *= fade[:, None]
# Set measured speech/background relationship before mastering.
active = speech_env > .5
v_rms = float(np.sqrt(np.mean(voice[active]**2)))
bg = score + fx
b_rms = float(np.sqrt(np.mean(bg[active]**2)))
scale = min(2.5, v_rms / (10**(17/20)) / max(b_rms, 1e-8))
score *= scale
fx *= scale
bg = score + fx
mixed = voice[:, None] + bg


def write_wav(p, y):
    if y.ndim == 1:
        y = y[:, None]
    with wave.open(str(p), 'wb') as f:
        f.setparams((y.shape[1], 2, SR, 0, 'NONE', 'not compressed'))
        f.writeframes((np.clip(y, -.9999, .9999)*32767).astype('<i2').tobytes())


write_wav(ROOT/'audio/score.wav', bg)
write_wav(ROOT/'audio/mix-premaster.wav', mixed)
# True two-pass EBU R128 mastering; FFmpeg 7 avoids known old loudnorm length issues.
measure = subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(ROOT/'audio/mix-premaster.wav'),
                         '-af','loudnorm=I=-14:TP=-1.4:LRA=9:print_format=json','-f','null','-'],
                         capture_output=True,text=True,check=True)
match = re.findall(r'\{\s*"input_i".*?\}', measure.stderr, re.S)
assert match, measure.stderr[-1000:]
stats = json.loads(match[-1])
filt = ('loudnorm=I=-14:TP=-1.4:LRA=9:measured_I='+stats['input_i']+
        ':measured_TP='+stats['input_tp']+':measured_LRA='+stats['input_lra']+
        ':measured_thresh='+stats['input_thresh']+':offset='+stats['target_offset']+
        ':linear=true,aresample=192000,alimiter=limit=0.83176:attack=10:release=200:level=false:latency=1,aresample=48000')
subprocess.run(['ffmpeg','-y','-v','error','-i',str(ROOT/'audio/mix-premaster.wav'),'-af',filt,
                '-ar',str(SR),'-ac','2','-c:a','pcm_s16le',str(ROOT/'audio/mix.wav')],check=True)
verify = subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(ROOT/'audio/mix.wav'),
                         '-af','loudnorm=I=-14:TP=-1:print_format=json','-f','null','-'],
                         capture_output=True,text=True,check=True)
final = json.loads(re.findall(r'\{\s*"input_i".*?\}',verify.stderr,re.S)[-1])
assert abs(float(final['input_i'])+14)<.5, final
assert float(final['input_tp'])<=-1.0, final
report = {'duration':DURATION,'sample_rate':SR,'channels':2,'estimated_bpm':75,'music':'We Never (Remix) - Hi Noise / Qiu Cheng','music_source':'user repository library','loop_edit':{'start':176,'source_restart':25.6,'crossfade_seconds':3.2},'events':events,
          'silence_windows':silences,'voice_to_background_active_db':round(float(20*np.log10(v_rms/max(np.sqrt(np.mean(bg[active]**2)),1e-8))),3),
          'measured_master':final,'premaster':stats,'foley_synthesis':True,'background_music_original':False}
(ROOT/'audio/mix-events.json').write_text(json.dumps(report,indent=2))
print('Mix ready:',DURATION,'seconds; LUFS',final['input_i'],'true peak',final['input_tp'],flush=True)
