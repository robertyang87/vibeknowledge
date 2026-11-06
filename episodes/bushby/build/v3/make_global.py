"""Bake a global Sentinel-2 cloudless base (zoom 5, about 5 km/px) as an equirectangular 8192 x 4096 image, so the
globe and the regional patches share one palette. Same source and licence as make_sat.py."""
import numpy as np, math
from PIL import Image
from make_sat import tile
Z = 5; N = 2 ** Z
mosaic = np.zeros((N * 256, N * 256, 3), np.uint8)
import concurrent.futures as cf
jobs = [(Z, x, y) for x in range(N) for y in range(N)]
with cf.ThreadPoolExecutor(16) as ex:
    for (z, x, y), a in zip(jobs, ex.map(lambda j: tile(*j), jobs)): mosaic[y * 256:(y + 1) * 256, x * 256:(x + 1) * 256] = a
W, H = 8192, 4096
lats = 90 - (np.arange(H) + .5) * 180 / H
lat_c = np.clip(lats, -85.05, 85.05)
py = (1 - np.log(np.tan(np.radians(lat_c)) + 1 / np.cos(np.radians(lat_c))) / math.pi) / 2 * N * 256
px = (np.arange(W) + .5) / W * N * 256
J = np.clip(py.astype(int), 0, N * 256 - 1)[:, None]; I = np.clip(px.astype(int), 0, N * 256 - 1)[None, :]
out = mosaic[J, I]
out[np.abs(lats) > 85.05] = [235, 240, 245]
Image.fromarray(out).save('assets/sat_global.jpg', quality=90)
print('global ok')
