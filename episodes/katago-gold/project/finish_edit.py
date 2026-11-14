"""Apply a frame-exact selection pickup and the board-size scope annotation.

A fresh build.sh render already contains the corrected overlay. This helper
records the finishing pass used for the release's in-progress production take.
The original AAC mix is copied without retiming or re-encoding.
"""
from pathlib import Path
import argparse
import json
import subprocess
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[3]
EPISODE = ROOT / 'episodes/katago-gold'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--raw', type=Path, required=True)
    parser.add_argument('--pickup', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    data = json.loads((EPISODE / 'copy/timeline.json').read_text())
    selected = next(s for s in data['scenes'] if s['id'] == 'selection')
    first = round(selected['start'] * 30)
    last = round((selected['start'] + selected['duration']) * 30)
    assert (first, last) == (2232, 2634)
    working = args.output.parent
    font = TTFont(ROOT / 'tools/remotion/public/gold-katago/fonts/serif.woff2')
    font.flavor = None
    font_path = working / 'scope-font.otf'
    font.save(font_path)
    text_path = EPISODE / 'copy/board-scope.txt'
    text_path.write_text(data['labels']['boardTag'])
    ids = {'input', 'policy', 'value', 'update', 'decision', 'ownership', 'global', 'limits'}
    windows = [(round(s['start'] * 30), round((s['start'] + s['duration']) * 30) - 1)
               for s in data['scenes'] if s['id'] in ids]
    enable = '+'.join(f'between(n,{a},{b})' for a, b in windows)
    graph = (f'[0:v]split=2[a][b];[a]trim=end_frame={first},setpts=PTS-STARTPTS[v0];'
             f'[1:v]trim=end_frame={last-first},setpts=PTS-STARTPTS[v1];'
             f'[b]trim=start_frame={last},setpts=PTS-STARTPTS[v2];'
             '[v0][v1][v2]concat=n=3:v=1:a=0[assembled];'
             f"[assembled]drawtext=fontfile='{font_path.as_posix()}':textfile='{text_path.as_posix()}':"
             f"fontcolor=0xb0a58e:fontsize=20:x=65:y=85:enable='{enable}'[video]")
    subprocess.run(['ffmpeg', '-y', '-v', 'warning', '-i', str(args.raw), '-i', str(args.pickup),
                    '-filter_complex', graph, '-map', '[video]', '-map', '0:a:0',
                    '-c:v', 'libx264', '-preset', 'fast', '-crf', '16', '-pix_fmt', 'yuv420p',
                    '-r', '30', '-fps_mode', 'cfr', '-video_track_timescale', '90000',
                    '-c:a', 'copy', '-movflags', '+faststart', str(args.output)], check=True)
    (working / 'finishing-edit.json').write_text(json.dumps({
        'pickup': {'scene': 'selection', 'first_frame': first, 'last_frame_exclusive': last,
                   'frames': last-first, 'reason': 'Treat prior/visits as exploration inputs'},
        'board_scope_windows': windows, 'audio_copied': True, 'fps': 30,
        'video_crf': 16, 'generation': 'frame-exact pickup assembly and final delivery encode'
    }, indent=2) + '\n')
    print('Finishing edit complete:', args.output)


if __name__ == '__main__':
    main()
