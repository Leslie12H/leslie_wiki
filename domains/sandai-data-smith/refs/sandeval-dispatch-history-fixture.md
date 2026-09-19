---
name: sandeval-dispatch-history-fixture
type: reference
created: 2026-09-19
updated: 2026-09-19
tags: [sand-eval, dispatch, acceptance]
links: [sandeval-dispatch-preview-scope, sandeval-e2e-acceptance]
---

# 发题历史验收场景

**Why:** 发布批次成功不等于素材下发历史完整。历史漏记时，从未下发范围可能包含实际已下发素材；总数必须与逐批素材身份核对。

**How to apply:** 先固定测试环境，用同一素材包构造两供应商、两题型、部分未发的场景；分别回读主任务 items、素材 dispatch-preview 的供应商/批次/计数，再用页面检查强制范围选择和历史题型。发布成功数不能直接视为去重素材数。

2026-09-19 构造与回读证据：`/Users/leslie/Documents/Playground/output/sandeval-dispatch-history-20260919/scenario.json`；请求证据在同目录 `build-scenario/events.jsonl` 和 `verify-scenario/events.jsonl`。当前异常及数量以这些文件和在线刷新为准，不据此宣称已定位根因或修复。

素材导入契约可能新增必填溯源字段，先查看 `sand-eval/platform/backend/app/services/facts/material_import.py::_required_provenance` 并做 imports/preview，不直接复用过期 manifest。
