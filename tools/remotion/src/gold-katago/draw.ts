import { gline } from "./vendor/deco/deco";
import type { FilmData } from "./types";

type C = CanvasRenderingContext2D;
type P = [number, number];
const W = 1920,
  H = 1080,
  G = "#dfb96d",
  IV = "#f5edda",
  DIM = "#a39e91";
const clamp = (v: number) => Math.max(0, Math.min(1, v)),
  ease = (v: number) => 1 - Math.pow(1 - clamp(v), 3),
  mix = (a: number, b: number, t: number) => a + (b - a) * t,
  frac = (v: number) => v - Math.floor(v);
let sheen = 0.4;
function font(c: C, s: number, b = false) {
  c.font = `${b ? 700 : 400} ${s}px GoldSerif, serif`;
}
function text(
  c: C,
  s: string,
  x: number,
  y: number,
  size = 32,
  col = IV,
  align: CanvasTextAlign = "left",
  bold = false,
) {
  font(c, size, bold);
  c.textAlign = align;
  c.textBaseline = "middle";
  c.fillStyle = col;
  c.fillText(s, x, y);
}
function lines(c: C, s: string, width: number, size: number) {
  font(c, size);
  const out: string[] = [];
  let v = "";
  for (const ch of s) {
    if (ch === "\n") {
      out.push(v);
      v = "";
      continue;
    }
    if (c.measureText(v + ch).width > width && v) {
      out.push(v);
      v = "";
    }
    v += ch;
  }
  if (v) out.push(v);
  return out;
}
function wrap(
  c: C,
  s: string,
  x: number,
  y: number,
  width: number,
  size = 36,
  col = IV,
  align: CanvasTextAlign = "left",
  bold = false,
) {
  lines(c, s, width, size).forEach((v, i) =>
    text(c, v, x, y + i * size * 1.55, size, col, align, bold),
  );
}
function path(c: C, p: P[], col = G, width = 1.6, alpha = 1, part = 1) {
  if (col === G)
    gline(c, p, { w: width, part, sheen, alpha, bb: [0, 0, W, H] });
  else {
    c.save();
    c.strokeStyle = col;
    c.globalAlpha *= alpha;
    c.lineWidth = width;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    p.forEach((v, i) => (i ? c.lineTo(...v) : c.moveTo(...v)));
    c.stroke();
    c.restore();
  }
}
function line(c: C, a: P, b: P, col = G, width = 1.6, alpha = 1, part = 1) {
  path(c, [a, b], col, width, alpha, part);
}
function flare(c: C, p: P, power = 1) {
  c.save();
  c.globalCompositeOperation = "screen";
  const g = c.createRadialGradient(...p, 0, ...p, 30 * power);
  g.addColorStop(0, "#fff9e9");
  g.addColorStop(0.12, "#ffe0a8c0");
  g.addColorStop(0.35, "#e4b46235");
  g.addColorStop(1, "#e4b46200");
  c.fillStyle = g;
  c.fillRect(p[0] - 30 * power, p[1] - 30 * power, 60 * power, 60 * power);
  line(
    c,
    [p[0] - 55 * power, p[1]],
    [p[0] + 55 * power, p[1]],
    "#f7dba2",
    0.8,
    0.4,
  );
  c.restore();
}
function note(c: C, s: string, y = 865) {
  wrap(c, s, 960, y, 1720, 31, G, "center");
}
function bars(
  c: C,
  d: FilmData,
  t: number,
  before: number[],
  after?: number[],
  x = 1120,
  y = 340,
  w = 570,
) {
  const u = after ? ease((t - 7.228) / 2) : 0;
  const vals = before.map((v, i) => mix(v, after?.[i] ?? v, u));
  text(
    c,
    after && u > 0.5 ? d.labels.afterSearch : d.labels.firstSight,
    x,
    y - 80,
    35,
    IV,
  );
  vals.forEach((v, i) => {
    const yy = y + i * 125;
    text(c, String.fromCharCode(65 + i), x, yy, 30, G, "left", true);
    line(c, [x + 65, yy], [x + 65 + w, yy], G, 1, 0.25);
    line(c, [x + 65, yy], [x + 65 + w * v * ease(t), yy], G, 5, 1);
    flare(c, [x + 65 + w * v, yy], 0.5);
    text(c, `${Math.round(v * 100)}%`, x + w + 80, yy + 45, 31, IV, "right");
  });
  wrap(c, d.labels.normalized, x, y + 375, 650, 23, DIM);
}
function captions(c: C, t: number, d: FilmData) {
  const cap = d.captions.find(
    (v) => t * 1000 >= v.startMs && t * 1000 < v.endMs,
  );
  if (!cap) return;
  const ll = lines(c, cap.text.trim(), 1740, 36);
  const y = 1005 - (ll.length - 1) * 25;
  c.save();
  c.shadowColor = "#000000";
  c.shadowBlur = 8;
  ll.forEach((v, i) => text(c, v, 960, y + i * 50, 36, IV, "center"));
  c.restore();
}

/** Crisp narrative type above the independently rendered spatial scene. */
export function drawSpatialOverlay(
  c: C,
  t: number,
  d: FilmData,
  cover = false,
) {
  c.clearRect(0, 0, W, H);
  const idx = Math.max(
      0,
      d.scenes.findIndex((s) => t >= s.start && t < s.start + s.duration),
    ),
    s = d.scenes[idx],
    local = t - s.start,
    L = d.labels;
  sheen = 0.15 + 0.7 * frac(t * 0.06);
  if (cover) {
    const fade = c.createLinearGradient(0, 0, 1250, 0);
    fade.addColorStop(0, "#030508ed");
    fade.addColorStop(0.65, "#030508cb");
    fade.addColorStop(1, "#03050800");
    c.fillStyle = fade;
    c.fillRect(0, 0, 1400, H);
    text(c, L.series, 110, 125, 31, G);
    text(c, "KataGo", 100, 335, 148, IV, "left", true);
    wrap(c, L.openingQ1, 110, 550, 850, 63, IV);
    wrap(c, L.openingQ2, 110, 660, 850, 63, G);
    text(c, L.s1 + "  ·  " + L.s2 + "  ·  " + L.s3, 110, 855, 32, G);
    return;
  }
  text(c, L.series, 65, 52, 20, "#b0a58e");
  if (!["hook", "identity", "loop", "rules", "ending"].includes(s.id))
    text(c, L.demo, 1855, 52, 20, "#b0a58e", "right");
  if (s.id === "hook") {
    text(c, "KataGo", 100, 140, 76, IV, "left", true);
    text(c, L.notall, 1855, 110, 31, G, "right");
  } else if (s.id !== "ending") {
    c.save();
    c.globalAlpha = ease(local / 0.65);
    text(c, s.title, 960, 95, 42, IV, "center", true);
    c.restore();
  }
  if (["input", "policy", "value", "update", "decision", "ownership", "global", "limits"].includes(s.id)) {
    text(c, L.boardTag, 65, 96, 20, "#b0a58e");
  }
  switch (s.id) {
    case "policy":
      bars(c, d, local, [0.58, 0.27, 0.15]);
      text(c, L.boardLegend, 500, 880, 22, DIM, "center");
      break;
    case "update":
      bars(c, d, local, [0.58, 0.27, 0.15], [0.24, 0.62, 0.14]);
      note(c, L.twoIdeas, 865);
      break;
    case "input":
      [
        L.input.split(" · ")[0],
        L.input.split(" · ")[1],
        L.rules,
        L.komi,
      ].forEach((v, i) =>
        text(
          c,
          v,
          1200,
          270 + i * 140,
          42,
          local >= [0, s.cues.history, s.cues.rules, s.cues.komi][i] ? G : DIM,
        ),
      );
      note(c, L.conditions, 880);
      break;
    case "value":
      [L.winLabel, L.scoreLabel, L.own].forEach((v, i) => {
        if (local > [s.cues.win, s.cues.score, s.cues.ownership][i]) {
          text(c, v, 1200, 270 + i * 180, 32, IV);
          text(
            c,
            ["63%", "+2.1", L.prob][i],
            1200,
            330 + i * 180,
            i === 2 ? 32 : 60,
            G,
          );
        }
      });
      note(c, L.notTerritory, 875);
      break;
    case "ownership":
      wrap(c, L.binary, 1200, 350, 600, 39, IV);
      wrap(c, L.dense, 1200, 500, 600, 39, G);
      wrap(c, L.notTerritory, 1200, 675, 600, 28, DIM);
      break;
    case "decision":
      wrap(c, L.networkResult, 1200, 375, 630, 45, IV);
      wrap(c, L.searchResult, 1200, 505, 630, 45, G);
      note(c, L.best, 870);
      break;
    case "global":
      note(c, L.pool, 870);
      break;
    case "identity":
      text(c, L.neural, 420, 820, 42, IV);
      text(c, L.search, 1480, 820, 42, G, "right");
      text(c, L.concept, 960, 895, 23, DIM, "center");
      break;
    case "tree":
      text(c, L.nodeTurn, 960, 890, 24, DIM, "center");
      break;
    case "selection":
      text(
        c,
        L.utility + "  ·  " + L.explore,
        960,
        830,
        36,
        G,
        "center",
      );
      text(c, L.notFormula, 960, 895, 23, DIM, "center");
      break;
    case "leaf":
      note(c, L.returnRoute, 865);
      break;
    case "training":
      note(c, L.trainingCycle, 875);
      break;
    case "loop":
      text(c, L.learnWeights, 1180, 340, 35, local < 6 ? G : IV);
      text(c, L.updating, 1180, 425, 52, local < 6 ? G : DIM);
      text(c, L.sameModel, 1180, 610, 35, local >= 6 ? G : IV);
      text(c, L.frozen, 1180, 695, 52, local >= 6 ? G : DIM);
      note(c, L.trainingTag, 875);
      break;
    case "targets":
      [L.win, L.points, L.own].forEach((v, i) =>
        text(
          c,
          v,
          1270,
          280 + i * 205,
          48,
          local >= [s.cues.win, s.cues.score, s.cues.ownership][i] ? G : DIM,
        ),
      );
      note(c, L.auxTitle, 880);
      break;
    case "budget":
      text(c, L.quick, 470, 235, 40, IV, "center");
      text(c, L.deep, 1400, 235, 40, G, "center");
      note(c, L.depthNote, 875);
      break;
    case "dashboard":
      text(c, L.blackView, 960, 770, 27, DIM, "center");
      note(c, L.lead, 865);
      break;
    case "calibration":
      text(c, "90%", 960, 270, 128, G, "center");
      note(c, L.noGuarantee, 825);
      text(c, L.calibrationNote, 960, 895, 24, DIM, "center");
      break;
    case "rules":
      note(c, L.fixed, 865);
      break;
    case "limits":
      note(c, L.robust, 825);
      text(c, L.limitsScope, 960, 895, 25, DIM, "center");
      break;
    case "payoff":
      note(c, L.lesson, 865);
      break;
    case "ending": {
      const shade = c.createLinearGradient(0, 0, 1300, 0);
      shade.addColorStop(0, "#030508cf");
      shade.addColorStop(1, "#03050800");
      c.fillStyle = shade;
      c.fillRect(0, 0, 1300, H);
      wrap(c, L.endingQuestion, 110, 370, 970, 46, IV);
      wrap(c, L.endingReply, 110, 510, 970, 40, G);
      text(c, L.sourceShort, 110, 760, 26, DIM);
      break;
    }
  }
  captions(c, t, d);
}
