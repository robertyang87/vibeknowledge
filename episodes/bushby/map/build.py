#!/usr/bin/env python3
"""Build the journey track map.

Inputs (all in this directory):
  data/points.json    route waypoints in order (name, lat, lon, date, date_lo, date_hi, precision, status, leg, source)
  data/moves.json     transport movements that never advance the route line
  data/events.json    dated event markers
  data/voided.json    a walked leg later replaced by a new line
  data/protest.json   a separate walk that is not counted in the route
  config/<name>.json  page title, footnote, zoom presets ("cases") and reference markers
  src/template.html   the page template
  src/style.part.css  the page stylesheet
Base map:
  node_modules/world-atlas/countries-10m.json   (npm install)
  data/rivers.json    river centre lines; regenerate with --rivers <ne_10m_rivers_lake_centerlines.geojson>

Outputs:
  track.html          self-contained interactive page
  route.geojson       open data export (points, legs, moves, events)

Usage:
  npm install && python3 build.py [--config config/bushby.json] [--rivers path/to/ne_10m_rivers_lake_centerlines.geojson]
"""
import argparse, calendar, json, math, re, sys
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEED_KM_PER_DAY = {"walk": 25.0, "gap": 10.0, "swim": 9.3}  # used only to place the departure of each leg in time
RIVERS_KEEP = {"Lena", "Aldan", "Atrato", "Yukon", "Tanana", "Kolyma", "Thames", "Danube", "Amur",
               "Amu Darya", "Syr Darya", "Mackenzie", "Indigirka"}


def day(iso):
    y, m, d = map(int, iso.split("-"))
    return (date(y, m, d) - date(1970, 1, 1)).days


def parse_loose(s):
    """Parse the loose Chinese date notation used in the data into (lo, hi) ISO dates."""
    s = s.lstrip("约")
    m = re.match(r"^(\d{4})(.*)$", s)
    if not m:
        raise ValueError(s)
    y, r = int(m.group(1)), m.group(2)
    eom = lambda yy, mm: calendar.monthrange(yy, mm)[1]
    D = lambda yy, mm, dd: f"{yy:04d}-{mm:02d}-{dd:02d}"
    if r == "":
        return D(y, 1, 1), D(y, 12, 31)
    if r == "年中":
        return D(y, 5, 1), D(y, 8, 31)
    if r == "底":
        return D(y, 11, 1), D(y, 12, 31)
    if r == "春":
        return D(y, 3, 1), D(y, 5, 31)
    if re.match(r"^/\d\d(冬)?$", r):
        y2 = y // 100 * 100 + int(r[1:3])
        return (D(y, 12, 1), D(y2, 2, 28)) if r.endswith("冬") else (D(y, 1, 1), D(y2, 12, 31))
    mm = re.match(r"^-(\d\d)(.*)$", r)
    mo, r2 = int(mm.group(1)), mm.group(2)
    if re.match(r"^-\d\d$", r2):
        return D(y, mo, int(r2[1:])), D(y, mo, int(r2[1:]))
    if re.match(r"^-\d\d/\d\d$", r2):
        a, b = r2[1:].split("/")
        return D(y, mo, int(a)), D(y, mo, int(b))
    table = {"": (1, eom(y, mo)), "下": (21, eom(y, mo)), "初": (1, 10), "中": (11, 20), "中下": (11, eom(y, mo)), "前后": (1, eom(y, mo))}
    if r2 in table:
        a, b = table[r2]
        return D(y, mo, a), D(y, mo, b)
    raise ValueError(s)


def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a["lat"], a["lon"], b["lat"], b["lon"]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))


def time_points(pts):
    """Give every point an arrival day `t` and a departure day `dep` for the leg into it.

    Day- and month-precision dates are anchors. Coarser dates (season, year) are placed by distance
    between the surrounding anchors and then clamped to their own stated range. Arrival times are kept
    non-decreasing. Each leg departs as late as walking/swimming speed allows, so long stays show as
    stops on the timeline rather than as a slow crawl.
    """
    lo = [day(p["date_lo"]) for p in pts]
    hi = [day(p["date_hi"]) for p in pts]
    anchor = [p["precision"] == "day" or (p["precision"] == "month" and not p["approx"]) for p in pts]
    t = [(a + b) / 2 for a, b in zip(lo, hi)]
    cum = [0.0]
    for i in range(1, len(pts)):
        cum.append(cum[-1] + (0 if pts[i]["leg"] == "start" else km(pts[i - 1], pts[i])))
    idx = [i for i, a in enumerate(anchor) if a]
    for i in range(len(pts)):
        if anchor[i]:
            continue
        a = max([j for j in idx if j < i], default=None)
        b = min([j for j in idx if j > i], default=None)
        if a is not None and b is not None and cum[b] > cum[a]:
            est = t[a] + (t[b] - t[a]) * (cum[i] - cum[a]) / (cum[b] - cum[a])
            t[i] = min(max(est, lo[i]), hi[i])
    for i in range(1, len(pts)):
        if anchor[i] or pts[i]["leg"] == "start":
            t[i] = max(t[i], t[i - 1])
            continue
        # a coarse date may not arrive sooner than walking/swimming from the previous point allows
        need = t[i - 1] + km(pts[i - 1], pts[i]) / SPEED_KM_PER_DAY.get(pts[i]["leg"], 25.0)
        t[i] = min(max(t[i], need), hi[i]) if need <= hi[i] else max(t[i], t[i - 1] + 0.5)
    dep = [t[0]]
    for i in range(1, len(pts)):
        if pts[i]["leg"] == "start":
            dep.append(t[i])
            continue
        dur = km(pts[i - 1], pts[i]) / SPEED_KM_PER_DAY.get(pts[i]["leg"], 25.0)
        dep.append(max(t[i - 1], t[i] - dur))
    return t, dep


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="config/bushby.json")
    ap.add_argument("--rivers", help="Natural Earth ne_10m_rivers_lake_centerlines.geojson; regenerates data/rivers.json")
    ap.add_argument("--topo", default="node_modules/world-atlas/countries-10m.json")
    args = ap.parse_args()

    load = lambda p: json.loads((HERE / p).read_text(encoding="utf-8"))
    pts, moves, events, voided, protest = (load(f"data/{n}.json") for n in ("points", "moves", "events", "voided", "protest"))
    cfg = load(args.config)

    if args.rivers:
        ne = json.loads(Path(args.rivers).read_text(encoding="utf-8"))
        r3 = lambda cs: [[round(x, 3), round(y, 3)] for x, y in cs]
        feats = []
        for f in ne["features"]:
            if f["properties"].get("name") in RIVERS_KEEP:
                g = f["geometry"]
                g["coordinates"] = r3(g["coordinates"]) if g["type"] == "LineString" else [r3(c) for c in g["coordinates"]]
                feats.append({"type": "Feature", "properties": {"name": f["properties"]["name"]}, "geometry": g})
        (HERE / "data/rivers.json").write_text(json.dumps({"type": "FeatureCollection", "features": feats}, separators=(",", ":")), encoding="utf-8")
    rivers = (HERE / "data/rivers.json").read_text(encoding="utf-8")
    topo_path = HERE / args.topo
    if not topo_path.exists():
        sys.exit(f"missing {args.topo}: run `npm install` first")
    topo = topo_path.read_text(encoding="utf-8")

    t, dep = time_points(pts)
    for p, a, b in zip(pts, t, dep):
        p["t"], p["dep"] = round(a, 2), round(b, 2)
    for m in moves:
        m["lo"], m["hi"] = day(m["date_lo"]), day(m["date_hi"])
    for e in events:
        e["t"] = day(e["date"])
    voided["lo"], voided["hi"], voided["voided_on"] = day(voided["date_lo"]), day(voided["date_hi"]), day(voided["voided_on"])
    for q in protest["points"]:
        a, b = parse_loose(q["date"])
        q["t"] = (day(a) + day(b)) / 2

    page_pts = [{k: p[k] for k in ("name", "lon", "lat", "date", "status", "leg", "t", "dep")} for p in pts]
    data = {"points": page_pts, "moves": moves, "events": events, "voided": voided, "protest": protest, "config": cfg}
    style = (HERE / "src/style.part.css").read_text(encoding="utf-8")
    html = (HERE / "src/template.html").read_text(encoding="utf-8")
    html = (html.replace("__TITLE__", cfg.get("page_title", cfg["title"])).replace("__STYLE__", style)
                .replace("__DATA__", json.dumps(data, ensure_ascii=False, separators=(",", ":")))
                .replace("__TOPO__", topo).replace("__RIVERS__", rivers))
    (HERE / "track.html").write_text(html, encoding="utf-8")

    feats = []
    for i, p in enumerate(pts):
        props = {k: p[k] for k in ("name", "date", "date_lo", "date_hi", "precision", "approx", "status", "segment", "source")}
        props.update(order=i, arrival_day=p["t"])
        feats.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": [p["lon"], p["lat"]]}, "properties": props})
        if i and p["leg"] != "start":
            q = pts[i - 1]
            feats.append({"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[q["lon"], q["lat"]], [p["lon"], p["lat"]]]},
                          "properties": {"kind": {"walk": "walk", "swim": "swim", "gap": "unknown_route"}[p["leg"]], "to": p["name"], "date": p["date"],
                                         "inferred": "inferred" in (p["status"], q["status"])}})
    for m in moves:
        feats.append({"type": "Feature", "geometry": {"type": "LineString", "coordinates": m["path"]},
                      "properties": {"kind": "transport", **{k: m[k] for k in ("label", "type", "date_lo", "date_hi", "note", "source")}}})
    for e in events:
        feats.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": [e["lon"], e["lat"]]},
                      "properties": {"kind": "event", **{k: e[k] for k in ("label", "date", "status", "source")}}})
    feats.append({"type": "Feature", "geometry": {"type": "LineString", "coordinates": voided["path"]},
                  "properties": {"kind": "voided", **{k: voided[k] for k in ("label", "date_lo", "date_hi", "note", "source")}}})
    feats.append({"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[q["lon"], q["lat"]] for q in protest["points"]]},
                  "properties": {"kind": "protest_walk", "label": protest["label"], "source": protest["source"]}})
    gj = {"type": "FeatureCollection", "name": cfg["title"],
          "note": "Town-level approximate coordinates; straight segments between points are schematic, not the actual roads. status: verified / book / inferred.",
          "features": feats}
    (HERE / "route.geojson").write_text(json.dumps(gj, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"built track.html and route.geojson: {len(pts)} points, {len(moves)} moves, {len(events)} events")


if __name__ == "__main__":
    main()
