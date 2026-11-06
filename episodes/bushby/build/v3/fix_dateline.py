"""The global imagery has a thin no-data (white) strip at the date line. Fill it by interpolating, row by row,
between the valid pixels on either side of the seam (wrapping around)."""
import numpy as np
from PIL import Image
a = np.asarray(Image.open('assets/sat_global.jpg').convert('RGB')).astype(np.float32); h, w, _ = a.shape; B = 48
for y in range(h):
    seg = np.concatenate([a[y, w - B:], a[y, :B]], 0)
    bad = seg.min(1) > 200
    if not bad.any() or bad.all(): continue
    idx = np.arange(2 * B); good = ~bad
    for c in range(3): seg[bad, c] = np.interp(idx[bad], idx[good], seg[good, c])
    a[y, w - B:], a[y, :B] = seg[:B], seg[B:]
Image.fromarray(a.clip(0, 255).astype(np.uint8)).save('assets/sat_global.jpg', quality=92); print('seam filled')
