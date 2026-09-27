---
name: sandeval-single-judgment-correction
type: reference
created: 2026-09-27
updated: 2026-09-27
tags: [sandeval, quality, operations]
links: [sandeval-correction-fixtures]
---

# Sand Eval 单题质检判断修正入口

**Why:** 页面显示的未保存判断可能与数据库已保存判断不同；问题位置版本报错不能被当成质检判定已落库，也不能据此覆盖整份报告。

**How to apply:** 用户明确授权单题修改时，先核对生产环境、准确 QT/RT/RI、可编辑状态和原备注；保存备份并预演，优先调用正式判断保存服务，保留原备注、固定来源和其他题目。执行后独立回读原始记录和页面使用的有效判定。保存单题不等于提交或退回整轮报告。

- 2026-09-27 的备份、预检、操作 CLI、受控保存及独立验证记录：`/Users/leslie/Documents/Playground/output/quality-single-reject-20260927/report.md`。对象当前状态须重新核验。
- 正式保存与并发/幂等边界：`sand-eval/platform/backend/quality/application/inspection/review_service.py`、`sand_review_write.py`；页面投影：同目录 `review_query_service.py`。
- 问题位置的固定结构版本校验：`quality/application/management/inspection_context_service.py`；原因及严重程度的界面映射：`sand-eval/platform/frontend/src/pages/quality/presentation.ts`。执行前按当次源码核对，不能把 major 猜成“严重”。
- 本次是受控判定修正，没有修复截图中 CONTENT_TARGET_VERSION_MISMATCH 的兼容问题；未进行浏览器视觉验收。
