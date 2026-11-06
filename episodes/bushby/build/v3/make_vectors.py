"""Write assets/lines.json (coastline and border arcs from countries-50m) and assets/route.json (route segments)."""
import json
from collections import Counter
TJ = json.load(open('../v2/vendor/countries-50m.json'))
sc, tr = TJ['transform']['scale'], TJ['transform']['translate']
cnt = Counter()
for g in TJ['objects']['countries']['geometries']:
    polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']] if g['type'] == 'Polygon' else []
    for poly in polys:
        for r in poly:
            for i in r: cnt[i if i >= 0 else ~i] += 1
coast, border = [], []
for k, arc in enumerate(TJ['arcs']):
    x = y = 0; pts = []
    for dx, dy in arc: x += dx; y += dy; pts.append([round(x*sc[0]+tr[0], 3), round(y*sc[1]+tr[1], 3)])
    (coast if cnt[k] == 1 else border).append(pts)  # arcs used by one country are coastline
json.dump({'coast': coast, 'border': border}, open('assets/lines.json', 'w'), separators=(',', ':'))
d = json.load(open('../../map/route.geojson'))
segs = [{'kind': f['properties'].get('kind'), 'to': f['properties'].get('to'),
         'date': f['properties'].get('date_lo') or f['properties'].get('date'),
         'c': [[round(v, 3) for v in c[:2]] for c in f['geometry']['coordinates']]}
        for f in d['features'] if f['geometry']['type'] == 'LineString']
pts = {f['properties']['name']: f['geometry']['coordinates'][:2] for f in d['features']
       if f['geometry']['type'] == 'Point' and 'name' in f['properties']}
json.dump({'segs': segs, 'pts': pts}, open('assets/route.json', 'w'), ensure_ascii=False)
print('vectors written')
