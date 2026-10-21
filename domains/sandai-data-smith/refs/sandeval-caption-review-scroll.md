---
name: sandeval-caption-review-scroll
type: reference
created: 2026-09-20
updated: 2026-10-21
tags: [sand-eval, quality, caption, css]
links: [sandeval-review-layout-and-account-picker]
---

# Caption 质检视频保留与正文滚动排查入口

**Why:** 用户所称视频“置顶”可能是正文独立滚动时视频留在原位，也可能指浏览器画中画。应先区分，不能从按钮存在推断画中画成功，也不能从题型不同直接推断权限不同。

**How to apply:** 查看 `sand-eval/platform/frontend/src/pages/quality/inspection/inspection.css` 的只读 Caption 选择器，逐一核对新题型的实际 DOM class 是否被正文 `max-height` / `overflow-y` 规则覆盖；同时读取线上 computed style、clientHeight 与 scrollHeight。播放器画中画错误处理另看共享 `usePictureInPicture.ts`。题型新增后验收必须包含长正文滚动。

2026-09-20 排查代码锚点：[6d9b0b8d 的 inspection.css](https://github.com/world-sim-dev/sandai-data-smith/blob/6d9b0b8d7997ff3a0d903abfdcdf811de18c8e18/sand-eval/platform/frontend/src/pages/quality/inspection/inspection.css#L13)。对照任务为 `QT-3e81b00290a9562fa794c7386fc23499` 与 `QT-1209136c566057c5a91fafb03be7a805`；核验时第一条命中 v5 只读正文滚动样式，新题型 0918_v0 未命中。使用照野账号只读检查，没有切换殷振升，没有修改业务数据或修复代码。实时行为应重新核验。

修复与验收入口：[PR #1447](https://github.com/world-sim-dev/sandai-data-smith/pull/1447)。完整范围包括普通/展开布局的视频吸顶、左右对比宽度与工具栏下方正文裁剪；Gate 状态须实时查询。可操作本地预览由 `/Users/leslie/Documents/Playground/quality-caption-scroll-0920/sand-eval/platform/frontend/.preview/` 的真实组件示例提供，使用合成视频，不代表生产任务验收。

## 2026-10-21 半屏抖动的临界布局循环

**Why:** 自动纵向滚动条占用素材栏宽度，等比视频随之变矮。若无滚动条时内容略高于 max-height、加入滚动条后反而低于上限，两种布局互相触发；播放进度引起的重排会使其持续往返。不能仅凭滚动条存在或 ResizeObserver 存在就认定原因。

**How to apply:** 先逐帧确认浏览器边框、素材栏滚动条和视频宽高。核对真实身份/任务题型与实际发布 CSS，再用真实组件、同结构合成数据扫描宽高临界值。记录两种布局的内容高和高度上限，分别对照稳定滚动条占位、固定视频高、去掉容器高度上限、禁用媒体尺寸观察；至少包含撤销干预后的复现，区分组件复现、原机取证和正式修复交付。传统占宽滚动条与 macOS 浮动滚动条不同，浏览器自动化默认隐藏滚动条也会掩盖问题。

- 当次证据与当前实施状态：[2026-10-21 本机根因报告](/Users/leslie/Documents/Playground/output/half-window-jitter-20261021/root-cause.md)。同目录 scrollbar.png、boundary-measurements.json、causal-measurements.json 包含画面、阈值扫描和单因素结果。代码/发布状态须沿后续实现记录重新核验。
- 源码入口：frontend/src/pages/quality/inspection/inspection.css 的 .quality-answer-workspace .question-face__media；共享 QuestionFace.tsx、captionPlayback.css、mediaVideo.css、MediaVideo.tsx。不要以全屏稳定推断视频内容有问题，也不要将局部 CSS 原因转成业务摘要重算。
- 数据边界：当完整生产快照的本地导出不被允许时，可在获准范围内只输出条数与长度等非正文布局统计，复现使用合成文字和合成视频；不能通过换工具或拼接数据绕过完整导出限制。
