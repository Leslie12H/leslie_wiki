---
name: sandeval-review-layout-and-account-picker
type: reference
created: 2026-09-19
updated: 2026-09-19
tags: [sand-eval, frontend, quality, impersonation]
links: []
---

# 质检布局与切换账号核验入口

**Why:** 嵌套镜头文本的可用宽度不等于浏览器窗口宽度；列表缺少结果还可能来自接口截断。隐藏预览中的重复字段也会干扰正在编辑的字段定位。

**How to apply:** 从 [PR #1404](https://github.com/world-sim-dev/sandai-data-smith/pull/1404) 查看改动与最终 Gate、合并状态。布局看 `frontend/src/pages/quality/inspection/inspection.css`，用含镜头运动数组的真实组件示例分别验证容器变窄与浏览器缩放，不能用空数组验收深层布局。切号看 `frontend/src/components/ImpersonationBar.tsx` 和 `backend/app/api/auth.py` 的账号查询接口，核对第 50 条后结果、过滤后分页和身份校验。预览定位看共享 `JsonPreviewDialog.tsx`，关闭的内容不能向主编辑区暴露重复定位节点。

本地示例不代表生产任务复验；浏览器缩放与窗口缩小须分别验证。
