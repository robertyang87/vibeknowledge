# 轨迹图（episode map）

全程轨迹 + 关键路段放大，供成片里"地球轨迹 → 放大关键段"的镜头使用。

## 文件
- `route.geojson` — 交付给地图引擎（Lemo 等）的数据：193 个途经点（含日期、`status`：verified / book / inferred）、点间连线（`kind`：walk / swim / unknown_route）、作废段（2019 土库曼斯坦）、抗议步行（2013–14，不计入）、六条交通工具移动（`transport_type`：fwd_rewalked / back / offline / positioning，对应脚本案例）。
- `track.html` — 可交互预览：正射地球，拖动旋转、滚轮缩放；"播放全程"按时间顺序画线；右栏按脚本段落一键飞入放大（S3 巴拿马、S4 图尔坎、S5 波哥大、S6 白令、S9 俄罗斯、S7 雅库特、S8 里海、归乡）。
- `waypoints.py` / `build_data.py` / `template.html` — 数据源与构建脚本。改点位只改 `waypoints.py`，再跑 `build_data.py`，把 `route_compact.json`、`rivers.json` 和 world-atlas 的 `countries-10m.json` 填进 `template.html` 的 `__ROUTE__`、`__RIVERS__`、`__TOPO__`。
- `rivers.json` — Natural Earth 10m 河流中心线（勒拿、阿尔丹、阿特拉托、育空、泰晤士等 13 条），只在放大时显示。

## 口径
- 点位是城镇级近似坐标；点间直线是示意，不代表实际道路。成片上屏须标"路线为示意"。
- 实线 = 两端都有来源；虚线 = 任一端为推断或坐标示意。蒙古→新疆一段来源空白，用点线表示"路线不明"。
- 交通工具移动单独成层，不进进度线：这正是脚本"装置 B 进度条不动"的地图版。
- 底图：world-atlas 2.0.2（Natural Earth 1:10m 国界），Natural Earth 5.1.2 河流。
