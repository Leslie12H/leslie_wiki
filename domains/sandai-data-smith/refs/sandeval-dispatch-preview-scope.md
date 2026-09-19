---
name: sandeval-dispatch-preview-scope
type: reference
created: 2026-09-19
updated: 2026-09-19
tags: [sand-eval, dispatch, preview]
links: [sandeval-roles-and-workflow]
---

# 主任务题面预览与实际下发范围

**Why:** 发布确认页的真实素材预览容易被理解为本次下发清单；非重叠分发也容易被误解为跨历史任务去重。

**How to apply:** 核验 frontend/src/pages/dispatchMasters/MasterEditor.tsx 传给 MaterialPreview 的参数，以及 backend/app/api/dispatch_masters.py 的 selected_material_preview。实际发布范围看 services/facts/dispatch_masters.py、dispatch_batch_preparation.py 和 repositories/material_dispatch.py。以上路径均位于 sand-eval/platform 下。

2026-09-19 代码核验：预览读取真实来源素材并遵循 material_selection，但没有传入本次配额和发布冻结清单。默认 mode=all 的行为及历史过滤应实时查 material_dispatch.py；disjoint 的批次起点由 batch_requests 计算。截图中看到重复视频不能单独证明该次实际下发重复，需要素材 ID、配置与历史下发明细比对。未据截图认定生产批次已经重复。
