"""Bake the globe texture: R = land mask, G = shaded relief (from the Natural Earth hypsometric raster), B = country borders.
Run: ~/lemo-opuscar/.venv/bin/python make_tex.py"""
import json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
W, H = 8192, 4096
TJ = json.load(open('../v2/vendor/countries-50m.json'))
sc, tr = TJ['transform']['scale'], TJ['transform']['translate']
arcs = []
for arc in TJ['arcs']:
    x = y = 0; pts = []
    for dx, dy in arc: x += dx; y += dy; pts.append((x*sc[0]+tr[0], y*sc[1]+tr[1]))
    arcs.append(pts)
def ring(r):
    pts = []
    for i in r: pts += arcs[i] if i >= 0 else arcs[~i][::-1]
    return pts
P = lambda lo, la: ((lo+180)/360*W, (90-la)/180*H)
land = Image.new('L', (W, H), 0); dl = ImageDraw.Draw(land)
bord = Image.new('L', (W, H), 0); db = ImageDraw.Draw(bord)
for g in TJ['objects']['countries']['geometries']:
    polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']] if g['type'] == 'Polygon' else []
    for poly in polys:
        for k, r in enumerate(poly):
            rr = ring(r)
            if len(rr) < 3: continue
            cross = any(abs(rr[i][0]-rr[i-1][0]) > 180 for i in range(1, len(rr)))
            if cross:  # unwrap to a continuous ring, draw it at both offsets
                u = [rr[0]]
                for lo, la in rr[1:]:
                    while lo - u[-1][0] > 180: lo -= 360
                    while lo - u[-1][0] < -180: lo += 360
                    u.append((lo, la))
                variants = [[(lo+o, la) for lo, la in u] for o in (-360, 0, 360)]
            else: variants = [rr]
            for v in variants:
                pts = [P(*q) for q in v]
                dl.polygon(pts, fill=255 if k == 0 else 0)
                db.line(pts, fill=255, width=2)
hyp = Image.open('../../map/assets/natural-earth-hyp-8192.jpg').convert('L').resize((W, H))
rel = np.asarray(hyp).astype(np.float32)
hp = rel - np.asarray(Image.fromarray(rel.astype(np.uint8)).filter(ImageFilter.GaussianBlur(24))).astype(np.float32)
rel = np.clip(128 + hp*2.2, 0, 255).astype(np.uint8)
out = np.dstack([np.asarray(land), rel, np.asarray(bord)])
Image.fromarray(out).resize((W, H)).save('assets/earth.png', optimize=True)
print('ok')
