# 轨迹图（Journey track globe）

卡尔·布什比 1998–2026 环球步行的交互地球图（默认：NASA Blue Marble 卫星影像的 3D 地球，globe.gl 渲染；`--style vector` 可出轻量 2D 版）。按日期播放：他走路时线在长，被卡住时线停下，日历照走。它是三集系列的主线画面，后续单独建库开源。

English summary: an interactive orthographic globe of Karl Bushby's 1998–2026 walk around the world, played back by date. When he walks, the line grows; when visas, money or politics stop him, the line stops while the calendar keeps running. Transport movements that never advanced the route (visa runs, repositioning flights, a deportation-turned-departure) are drawn as a separate layer.

## 用法
```bash
npm install                     # world-atlas 2.0.2（国界底图）
python3 build.py                # 生成 track.html（3D 卫星地球）与 route.geojson
python3 build.py --style vector # 轻量 2D 矢量版（不带卫星影像）
python3 build.py --rivers ne_10m_rivers_lake_centerlines.geojson   # 可选：从 Natural Earth 5.1.2 重建 data/rivers.json
```
Natural Earth 河流数据下载：`https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_10m_rivers_lake_centerlines.geojson`

页面操作：拖动旋转、滚轮缩放；"按日期播放"从 1998-11-01 播到 2026-11-02（1× 约 64 秒，可切 2×/0.5×）；时间轴可拖；右栏按分集节拍一键飞入放大；"作废段变灰"开关供第三集冷开场录屏。网址可带 `#panama`、`#bering`、`#centralasia` 等直接打开某一段。

## 目录
| 路径 | 内容 | 许可 |
|---|---|---|
| `data/points.json` | 196 个途经点：日期（原文写法＋上下界＋精度）、`status`（verified / book / inferred）、`leg`（walk / swim / gap / start）、`source` | CC BY 4.0 |
| `data/moves.json` | 15 条交通工具移动（`type`：offline / positioning / back / fwd_rewalked），带日期和出处 | CC BY 4.0 |
| `data/events.json` | 14 个事件标记（被扣、被盗、浮冰救援、伊朗边境、最后一双鞋等） | CC BY 4.0 |
| `data/voided.json` | 2019 土库曼斯坦作废段，2023-09-24 被新线替换 | CC BY 4.0 |
| `data/protest.json` | 2013–14 抗议步行（不计入环球路线） | CC BY 4.0 |
| `config/bushby.json` | 标题、脚注、放大预设（含分集节拍号）、参考地点 | CC BY 4.0 |
| `src/` | 页面模板与样式（`template.html` 3D 版、`template-vector.html` 2D 版） | MIT |
| `assets/blue-marble-4096.jpg` | NASA Visible Earth Blue Marble，缩放到 4096×2048（经 three-globe 示例取得） | 公有领域（NASA） |
| `build.py` | 构建脚本 | MIT |
| `track.html`、`route.geojson` | 构建产物（新库可改由 Pages/Release 发布，不入版本库） | — |

## 时间怎么算
- 写到日或月的日期是锚点。只写到年或季节的点，按两侧锚点之间的路程比例估一个时间，再夹回它自己写明的范围内；若比按步速走过来还早，就顺延到能走到的时间。
- 每一段路按步速倒推出发时间（步行 25 km/天，游泳 9.3 km/天，路线不明段 10 km/天）。所以长时间停留会显示为"线停"，而不是一条慢慢爬的线。
- 这些只用来排时间轴，不是事实：页面上的日期一律显示原文写法，`approx` 和 `precision` 字段说明了精度。

## 口径
- 点位是城镇级近似坐标，点间直线是示意，不代表实际道路。成片上屏须标"路线为示意"。
- 实线＝两端都有来源；虚线＝任一端为推断或坐标示意；点线＝路线不明（蒙古→新疆、巴库→巴统）。
- 英格兰三段（多佛→锡廷伯恩、伦敦→彼得伯勒、戈斯伯顿→马基特雷森）公开来源已查尽，只在锚点间直连，不标中间城镇。帕绍、代根多夫、维尔茨堡、塔什干、努库斯、第比利斯等无来源地名不上图。
- 交通工具移动单独成层，不进进度线，对应脚本"规则印章：不推进"。
- `source` 字段先填到"段落 + 主要来源"粒度，个别点细到报道或书页；逐点细化是开源前的待办。

## 拆库
后续单独建库时，用 `git subtree split --prefix=episodes/bushby/map` 拆出以保留提交历史。换一个旅程，只需换 `data/` 与 `config/`。
