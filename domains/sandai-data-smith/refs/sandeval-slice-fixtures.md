---
name: sandeval-slice-fixtures
type: reference
created: 2026-09-21
updated: 2026-09-21
tags: [sandeval, testing, media]
links: [sandeval-highlight-note-test]
---

# 切片标注场景入口

**Why:** 切片题页面能显示候选描述，不代表按片段取流可用；普通视频素材与逐片段媒体映射须分别验证。

**How to apply:** 查 `raw_segment_quality_v2/ui/annotation.ts` 的题面合法性与 `VideoPanel.tsx` 的媒体槽取流；原生导入契约见 `backend/app/services/facts/ev2_import.py` 的 `segment_videos`。正式写入前运行 CLI dry-run。用实际标注员验证视频画面与进度，不能用根账号或页面文字代替媒体验收。

2026-09-21 场景、失败尝试边界、最终入口和回执：`/Users/leslie/Documents/Playground/output/sandeval-slice-20260921/report.md`。运行状态下次现查。
