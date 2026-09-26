---
name: antd-button-accessible-name
type: pitfall
created: 2026-09-26
updated: 2026-09-26
tags: [testing, frontend, antd, accessibility]
links: []
---

# Ant Design 两字中文按钮的测试选择器

**Why:** Ant Design 默认会在两字中文按钮中插入空格，可访问名称也包含该空格。按无空格字面量查找会漏匹配；如果是断言按钮不存在，还可能产生假通过。

**How to apply:** 两字中文按钮按 role 和允许字间空格的锚定正则查找，保留产品默认排版。存在性与点击断言需验证真实渲染名称，不存在性断言需确认选择器在按钮存在时确实能命中。

## 核验指针

- [Sand Eval PR #1976](https://github.com/world-sim-dev/sandai-data-smith/pull/1976)：分页测试 supplier、Sand 两个用例因“跳转”与“跳 转”名称不匹配失败；本地修改前复现 2 失败、15 通过。最新修复与 CI 状态以 PR 为准。
- 仓内约定：`~/Downloads/sandai-data-smith/sand-eval/knowledge/frontend-testing.md`。
- 测试与组件：`sand-eval/platform/frontend/src/pages/quality/inspection/QualityInspectionPage.pagination.test.tsx`、`MyTaskPagination.tsx`。
