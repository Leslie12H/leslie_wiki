---
name: sandeval-caption-review-scroll
type: reference
created: 2026-09-20
updated: 2026-09-20
tags: [sand-eval, quality, caption, css]
links: [sandeval-review-layout-and-account-picker]
---

# Caption 质检视频保留与正文滚动排查入口

**Why:** 用户所称视频“置顶”可能是正文独立滚动时视频留在原位，也可能指浏览器画中画。应先区分，不能从按钮存在推断画中画成功，也不能从题型不同直接推断权限不同。

**How to apply:** 查看 `sand-eval/platform/frontend/src/pages/quality/inspection/inspection.css` 的只读 Caption 选择器，逐一核对新题型的实际 DOM class 是否被正文 `max-height` / `overflow-y` 规则覆盖；同时读取线上 computed style、clientHeight 与 scrollHeight。播放器画中画错误处理另看共享 `usePictureInPicture.ts`。题型新增后验收必须包含长正文滚动。

2026-09-20 排查代码锚点：[6d9b0b8d 的 inspection.css](https://github.com/world-sim-dev/sandai-data-smith/blob/6d9b0b8d7997ff3a0d903abfdcdf811de18c8e18/sand-eval/platform/frontend/src/pages/quality/inspection/inspection.css#L13)。对照任务为 `QT-3e81b00290a9562fa794c7386fc23499` 与 `QT-1209136c566057c5a91fafb03be7a805`；核验时第一条命中 v5 只读正文滚动样式，新题型 0918_v0 未命中。使用照野账号只读检查，没有切换殷振升，没有修改业务数据或修复代码。实时行为应重新核验。

修复与验收入口：[PR #1447](https://github.com/world-sim-dev/sandai-data-smith/pull/1447)。完整范围包括普通/展开布局的视频吸顶、左右对比宽度与工具栏下方正文裁剪；Gate 状态须实时查询。可操作本地预览由 `/Users/leslie/Documents/Playground/quality-caption-scroll-0920/sand-eval/platform/frontend/.preview/` 的真实组件示例提供，使用合成视频，不代表生产任务验收。
