"""Bake satellite colour for the same patches as make_detail.py, from EOX Sentinel-2 cloudless 2016
(CC BY 4.0: "Sentinel-2 cloudless - https://s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus
Sentinel data 2016)"), and the NASA Black Marble 2016 night lights (public domain).
Run: ~/lemo-opuscar/.venv/bin/python make_sat.py   (tiles cached in ~/.cache/s2cloudless)"""
import math, os, urllib.request, concurrent.futures as cf, io
import numpy as np
from PIL import Image
from make_detail import PATCHES, tx, ty

CACHE = os.path.expanduser('~/.cache/s2cloudless'); os.makedirs(CACHE, exist_ok=True)
UA = {'User-Agent': 'vibeknowledge-map/0.1 (open-source documentary)'}

def tile(z, x, y):
    p = f'{CACHE}/{z}_{x}_{y}.jpg'
    if not os.path.exists(p):
        for _ in range(4):
            try:
                req = urllib.request.Request(f'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg', headers=UA)
                with urllib.request.urlopen(req, timeout=60) as r: open(p, 'wb').write(r.read()); break
            except Exception: pass
    try: return np.asarray(Image.open(p).convert('RGB'))
    except Exception: return np.zeros((256, 256, 3), np.uint8)

def bake(name, z, lon0, lat0, lon1, lat1, res):
    z = min(z + 1, 12) if name != 'detail_a' else z      # imagery one level finer than the relief
    x0, x1 = int(tx(lon0, z)), int(tx(lon1, z)); y0, y1 = int(ty(lat1, z)), int(ty(lat0, z))
    jobs = [(z, x, y) for x in range(x0, x1 + 1) for y in range(y0, y1 + 1)]
    with cf.ThreadPoolExecutor(16) as ex: tiles = dict(zip(jobs, ex.map(lambda j: tile(*j), jobs)))
    mosaic = np.zeros(((y1 - y0 + 1) * 256, (x1 - x0 + 1) * 256, 3), np.uint8)
    for (zz, x, y), a in tiles.items(): mosaic[(y - y0) * 256:(y - y0 + 1) * 256, (x - x0) * 256:(x - x0 + 1) * 256] = a
    r2 = res / 2 if name != 'detail_a' else res
    W, H = min(8192, int(round((lon1 - lon0) / r2))), min(8192, int(round((lat1 - lat0) / r2)))
    lons = lon0 + (np.arange(W) + .5) * (lon1 - lon0) / W; lats = lat1 - (np.arange(H) + .5) * (lat1 - lat0) / H
    px = ((lons + 180) / 360 * 2 ** z - x0) * 256; py = np.array([(ty(l, z) - y0) * 256 for l in lats])
    PX, PY = np.meshgrid(px, py)
    img = Image.fromarray(mosaic)
    out = np.asarray(img.transform((W, H), Image.MESH, [((0, 0, W, H), (0, 0, 0, 0))], Image.BILINEAR)) if False else None
    i = np.clip(PX.astype(int), 0, mosaic.shape[1] - 1); j = np.clip(PY.astype(int), 0, mosaic.shape[0] - 1)
    Image.fromarray(mosaic[j, i]).save(f'assets/sat_{name}.jpg', quality=90)
    print(name, z, len(jobs), (W, H))

if __name__ == '__main__':
    for p in PATCHES: bake(*p)
    night = 'assets/night.jpg'
    if not os.path.exists(night):
        req = urllib.request.Request('https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_3km.jpg', headers=UA)
        with urllib.request.urlopen(req, timeout=120) as r: Image.open(io.BytesIO(r.read())).convert('RGB').resize((8192, 4096), Image.LANCZOS).save(night, quality=92)
    print('night ok')
