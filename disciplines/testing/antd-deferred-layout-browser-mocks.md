---
name: antd-deferred-layout-browser-mocks
type: pitfall
created: 2026-10-19
updated: 2026-10-19
tags: [testing, frontend, antd, vitest, mocks]
links: [antd-button-accessible-name]
---

# Ant Design 延迟布局与浏览器 mock 清理

**Why:** `resetAllMocks()` 会清空测试 setup 中浏览器 mock 的实现。Ant Design 的列表、表格等组件可能稍后才注册断点或执行布局效果；如果 `window.matchMedia` 已被清空，响应式观察器会拿到 `undefined`，报出无法读取 `matches`。组件测试单文件通过，不能排除完整 CI 下触发这种清理时序。

**How to apply:** 用例只 `mockReset` 自己拥有的 API mock，不全局清空浏览器模拟接口。先核对报错是否来自迟到布局与接口被清理，再修正测试生命周期；保留真实组件交互断言，不靠忽略异常、增大超时或改产品逻辑消除红灯。

- [Sand Eval PR #2613](https://github.com/world-sim-dev/sandai-data-smith/pull/2613)：`LatestAnswerReinspectionModal.test.tsx` 的全局清理及修正；setup 在 `sand-eval/platform/frontend/src/test/setup.ts`，最终完整 Gate 沿 PR 查询。该记录不替代真实浏览器验收。
