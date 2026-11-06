"""Bake high-resolution relief patches for the route from Terrarium elevation tiles (AWS Open Data, Mapzen;
sources SRTM, GMTED, ETOPO1 and others; attribution in the film credits), and write Natural Earth 10m lines.

Each patch is an equirectangular PNG over a lon/lat box: R = land (elevation > 0), G = shaded relief, B = elevation.
Run: ~/lemo-opuscar/.venv/bin/python make_detail.py   (downloads tiles into ~/.cache/terrarium)"""
import io, json, math, os, zipfile, urllib.request, concurrent.futures as cf
import numpy as np
from PIL import Image, ImageFilter
import shapefile

CACHE = os.path.expanduser('~/.cache/terrarium'); os.makedirs(CACHE, exist_ok=True)
PATCHES = [  # name, zoom, lon0, lat0, lon1, lat1, degrees per pixel; coarse first, finer patches drawn over them
    ('detail_a', 7, -95.0, -56.0, -62.0, 16.0, .012),         # the continent, ~1.3 km/px
    ('corr_1', 9, -74.0, -56.0, -66.0, -44.0, .004),          # the route corridor, ~400 m/px
    ('corr_2', 9, -74.0, -44.0, -68.0, -32.0, .004),
    ('corr_3', 9, -74.0, -32.0, -68.0, -20.0, .004),
    ('corr_4', 9, -81.0, -20.0, -69.0, -8.0, .004),
    ('corr_5', 9, -82.0, -8.0, -75.0, 4.0, .004),
    ('corr_6', 9, -81.0, 4.0, -74.0, 10.0, .004),
    ('start', 10, -73.5, -54.2, -69.5, -51.6, .0015),         # Punta Arenas, ~150 m/px
    ('darien', 11, -78.6, 6.9, -76.4, 8.9, .0007),            # the Darien and the escort, ~75 m/px
    # the rest of the walk (full film): regional patches, ~0.5-1 km/px
    ('na_central', 8, -106.0, 7.0, -82.0, 24.0, .006),
    ('na_southwest', 8, -117.0, 18.0, -104.0, 38.0, .006),
    ('na_rockies', 8, -125.0, 36.0, -108.0, 62.0, .008),
    ('na_alaska', 8, -166.0, 58.0, -120.0, 68.0, .01),
    ('bering', 9, -179.0, 62.0, -160.0, 70.0, .004),
    ('chukotka', 8, 150.0, 62.0, 179.0, 71.0, .007),
    ('kolyma', 8, 118.0, 52.0, 155.0, 68.0, .009),
    ('baikal', 8, 100.0, 45.0, 125.0, 57.0, .008),
    ('steppe', 7, 70.0, 37.0, 110.0, 51.0, .011),
    ('central_asia', 8, 48.0, 35.0, 72.0, 47.0, .008),
    ('caspian', 9, 46.0, 39.0, 54.0, 45.5, .004),
    ('turkey', 8, 26.0, 39.0, 43.5, 43.0, .005),
    ('europe', 8, 0.0, 40.0, 30.0, 52.0, .008),
    ('england', 10, -2.0, 50.4, 2.6, 54.2, .0015),
]

def tile(z, x, y):
    p = f'{CACHE}/{z}_{x}_{y}.png'
    for _ in range(5):
        if os.path.exists(p): break
        try:
            with urllib.request.urlopen(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png', timeout=60) as r: data = r.read()
            open(p + '.part', 'wb').write(data); os.replace(p + '.part', p)
        except Exception: pass
    try: a = np.asarray(Image.open(p).convert('RGB')).astype(np.float32)
    except Exception: return np.zeros((256, 256), np.float32)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768

def tx(lon, z): return (lon + 180) / 360 * 2 ** z
def ty(lat, z): r = math.radians(lat); return (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2 ** z

def bake(name, z, lon0, lat0, lon1, lat1, res):
    x0, x1 = int(tx(lon0, z)), int(tx(lon1, z)); y0, y1 = int(ty(lat1, z)), int(ty(lat0, z))
    jobs = [(z, x, y) for x in range(x0, x1 + 1) for y in range(y0, y1 + 1)]
    with cf.ThreadPoolExecutor(16) as ex: tiles = dict(zip(jobs, ex.map(lambda j: tile(*j), jobs)))
    mosaic = np.zeros(((y1 - y0 + 1) * 256, (x1 - x0 + 1) * 256), np.float32)
    for (zz, x, y), a in tiles.items(): mosaic[(y - y0) * 256:(y - y0 + 1) * 256, (x - x0) * 256:(x - x0 + 1) * 256] = a
    W, H = int(round((lon1 - lon0) / res)), int(round((lat1 - lat0) / res))
    lons = lon0 + (np.arange(W) + .5) * res; lats = lat1 - (np.arange(H) + .5) * res
    px = ((lons + 180) / 360 * 2 ** z - x0) * 256
    py = np.array([(ty(l, z) - y0) * 256 for l in lats])
    PX, PY = np.meshgrid(px, py)
    i0, j0 = np.clip(PX.astype(int), 0, mosaic.shape[1] - 2), np.clip(PY.astype(int), 0, mosaic.shape[0] - 2)
    fx, fy = PX - i0, PY - j0
    e = (mosaic[j0, i0] * (1 - fx) * (1 - fy) + mosaic[j0, i0 + 1] * fx * (1 - fy) + mosaic[j0 + 1, i0] * (1 - fx) * fy + mosaic[j0 + 1, i0 + 1] * fx * fy)
    # shaded relief: two light directions, metres per pixel from the latitude
    dyM = res * 110540; dxM = res * 111320 * np.cos(np.radians(lats))[:, None]
    gy, gx = np.gradient(np.maximum(e, 0))
    sx, sy = gx / dxM, -gy / dyM
    def shade(az, alt):
        az, alt = math.radians(az), math.radians(alt)
        n = np.sqrt(1 + sx ** 2 + sy ** 2)
        return (math.sin(alt) - (sx * math.sin(az) * math.cos(alt) + sy * math.cos(az) * math.cos(alt))) / n
    hs = .65 * shade(315, 40) + .35 * shade(260, 55)
    hs = np.clip((hs - hs[e > 0].mean() if (e > 0).any() else hs) * 1.6 + .5, 0, 1)
    land = np.asarray(Image.fromarray(((e > 2) * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(7)).filter(ImageFilter.GaussianBlur(1.4))).astype(np.float32) / 255   # soft edge so the shader can draw a smooth coastline
    elev = np.clip(np.maximum(e, 0) / 5500, 0, 1) ** .6
    rgb = np.dstack([land * 255, hs * 255, elev * 255]).astype(np.uint8)
    Image.fromarray(rgb).save(f'assets/{name}.png', optimize=True)
    return {'name': name, 'box': [lon0, lat0, lon1, lat1], 'size': [W, H]}

def lines(zip_path, box):
    zf = zipfile.ZipFile(zip_path); base = [n[:-4] for n in zf.namelist() if n.endswith('.shp')][0]
    r = shapefile.Reader(shp=io.BytesIO(zf.read(base + '.shp')), shx=io.BytesIO(zf.read(base + '.shx')), dbf=io.BytesIO(zf.read(base + '.dbf')))
    out = []
    for sh in r.shapes():
        b = sh.bbox
        if b[2] < box[0] or b[0] > box[2] or b[3] < box[1] or b[1] > box[3]: continue
        parts = list(sh.parts) + [len(sh.points)]
        for i in range(len(parts) - 1):
            pts = sh.points[parts[i]:parts[i + 1]]
            if len(pts) > 1: out.append([[round(x, 3), round(y, 3)] for x, y in pts])
    return out

if __name__ == '__main__':
    meta = [bake(*p) if not os.path.exists(f'assets/{p[0]}.png') or os.environ.get('REBAKE') else {'name': p[0], 'box': list(p[2:6]), 'size': list(Image.open(f'assets/{p[0]}.png').size)} for p in PATCHES]
    NE = os.environ.get('NE10', os.path.expanduser('~/.cache/ne10'))
    box = [-130, -60, -20, 35]
    L = {k: lines(f'{NE}/{f}.zip', box) for k, f in [('coast', 'ne_10m_coastline'), ('river', 'ne_10m_rivers_lake_centerlines'), ('lake', 'ne_10m_lakes'), ('border', 'ne_10m_admin_0_boundary_lines_land'), ('road', 'ne_10m_roads')]}
    json.dump(L, open('assets/lines10.json', 'w'), separators=(',', ':'))
    json.dump(meta, open('assets/detail.json', 'w'))
    print(meta, {k: len(v) for k, v in L.items()})
