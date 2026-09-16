---
name: storyboard-label-sync-without-visual-verification
type: pitfall
created: 2026-09-16
updated: 2026-09-16
tags: [vidmuse, storyboard, agent-workflow, visual-verification, evidence]
links: [vidmuse-ai-frontend, timeline-preview-duration-and-export-version]
---

# 分镜标签同步必须核对实际画面

**Why:** 从已有 detail 或 caption 派生 title，再批量回写各层文本，只能证明这些文字彼此一致。如果旧文本已经指错素材，这种清理会传播错误；工具写入成功和 Agent 宣称“全部同步”都不能证明标签对应实际视频。

**How to apply:** 将用户要求转成逐分镜验收：绑定稳定 scene/shot 标识，读取当前 active 素材，分别核对 title、detail、caption、封面与实际播放内容。涉及“对应视频”的要求必须播放或抽取视频帧；根据内容覆盖需要检查多个时间点。只验过部分分镜时，明确抽查范围，不能宣称全片一致。

## 2026-09-16 案例与证据入口

- [产品分镜页](https://vidmuse.ai/en/thread/c3e4bba0-deea-4c21-8482-e2aba194c9b9?view=storyboard) 与 [Admin 当前 DSL](https://prod-vidmuse-admin.vidmuse.ai/playground/thread/c3e4bba0-deea-4c21-8482-e2aba194c9b9?tab=dsl)：用于重新获取当前状态，不能把调查时状态当成永久事实。
- 对话/工具记录查找用户要求“描述标签匹配对应视频”以及工具摘要 `Batch cleanup all120 scene titles and asset captions`；核对批量步骤的输入是否只有已有文本，是否包含实际画面证据和写后验收。
- 当日调查定位到第 2、12 镜文字语义与实际素材相反：路牌与球场跪姿的标签错配。调查同时核对当前 DSL、封面、激活视频和最新成片对应位置的抽帧；激活视频与成片画面相符，均与 DSL 文字相反，不依赖 Agent 自述。
- 当日主问题归类为 Agent 工作流未完成视觉语义核验却宣称同步成功。首次引入错配的操作尚未定位，不能把本轮批量写入直接断言为最早起因。
- 当日只读证据报告：`/private/tmp/vidmuse-thread-c3e4bba0-audit-20260916/report.md`。这是本机临时调查产物；若已清理，回到上述线上入口重新取证。资产路径、完整分镜数、当前导出版本等易变值以取证时原始数据为准。

## 避免附带误判

- 分镜卡片封面与视频可能来自不同字段或版本。追到当前前端对 `startFrame`、`videoFile` 和 active 版本的选择逻辑后，再判断是标签错配、素材选错还是封面未同步；不能只看封面判断视频内容。
- 懒加载页面应先滚动进入可视区域，再确认加载结果；首次 DOM 快照未出现图片不能直接判定素材缺失。
- 时长验收先确认 DSL 版本与时间线实际读取字段。`scene.duration`、`shot.duration`、素材原始时长不同，不能只因其中一个旧值未变就认定延长失败。
- 导出验收绑定具体消息、工具结果和文件；旧 `options.baselineRender` 元数据不等于用户当前播放的成片。媒体可加载和时长正确也不等于完整视听验收通过。

## 复验指针

前端仓库：`~/Downloads/sandai-code/vidmuse.ai/`。下列是本地源码调查入口；未验证本地提交等于当时生产版本，使用时需重新读取并核对部署来源。

- `apps/vidmuse/src/view/ThreadContentView/utils/mediaItemBuilders/adventurer.ts` 与 `apps/vidmuse/src/view/ThreadContentView/components/MediaArtifact/MediaItem.tsx`：追踪 `shot.startFrame` 到 `previewSrc` 的封面选择及实际视频 URL。
- `apps/vidmuse/src/domain/threadContent/documentProjectionShared.ts`：active 素材选择；同目录 `documentProjectionV1.ts`：V1 的 `shot.duration` 投影。
- `apps/vidmuse/src/view/ThreadContentView/hooks/timelineTrackViewModel/shared.ts`：从媒体条目时长生成时间线；按 DSL 版本追踪来源，不依赖单一 JSON 字段推断用户实际预览。
- [时间线预览时长与导出版本](../refs/timeline-preview-duration-and-export-version.md)：用于区分当前 DSL、历史聊天声明与独立导出文件。
