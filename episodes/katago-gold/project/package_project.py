"""Package the editable production tree without caches or standalone music."""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[3]
EPISODE = ROOT / 'episodes/katago-gold'
OUTPUT = EPISODE / 'renders/katago-gold-project.zip'


def main():
    paths = [EPISODE / 'README.md']
    for folder in ['copy', 'project', 'research']:
        paths.extend(p for p in (EPISODE / folder).rglob('*') if p.is_file()
                     and '__pycache__' not in p.parts)
    paths.extend([EPISODE / 'audio/narration.wav', EPISODE / 'audio/mix-events.json'])
    app = ROOT / 'tools/remotion'
    for name in ['README.md', 'package.json', 'package-lock.json', 'tsconfig.json',
                 'remotion.config.ts', 'eslint.config.mjs']:
        paths.append(app / name)
    paths.extend(p for p in (app / 'src').rglob('*') if p.is_file())
    paths.append(app / 'scripts/gold-review.mjs')
    assets = app / 'public/gold-katago'
    paths.extend([assets / 'mix.wav',
                  assets / 'abstract/katago-spatial-lattice.glb',
                  assets / 'abstract/katago-spatial-lattice.blend',
                  assets / 'fonts/serif.woff2', assets / 'fonts/serif-bold.woff2',
                  assets / 'fonts/LICENSE.txt',
                  app / 'public/blender/blender-demo.png'])
    paths = sorted(set(paths))
    missing = [str(p.relative_to(ROOT)) for p in paths if not p.is_file()]
    if missing:
        raise FileNotFoundError(missing)
    manifest = {'files': []}
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUTPUT, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for path in paths:
            name = path.relative_to(ROOT).as_posix()
            data = path.read_bytes()
            z.writestr(name, data)
            manifest['files'].append({'path': name, 'bytes': len(data),
                                      'sha256': hashlib.sha256(data).hexdigest()})
        z.writestr('PACKAGE-MANIFEST.json', json.dumps(manifest, indent=2) + '\n')
    with zipfile.ZipFile(OUTPUT) as z:
        assert z.testzip() is None, 'ZIP CRC failed'
    print(OUTPUT, OUTPUT.stat().st_size, 'bytes;', len(paths), 'source files')


if __name__ == '__main__':
    main()
