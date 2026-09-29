---
name: vidmuse-thread-output-billing-and-export-evidence
type: pitfall
created: 2026-09-29
updated: 2026-09-29
tags: [vidmuse, aion, credits, video-generation, export, download]
links: [vidmuse-ai-frontend, vidmuse-aion, vidmuse-zeus, timeline-preview-duration-and-export-version]
---

# 生成扣费、时间线成片和浏览器下载是三段独立证据

**Why:** 2026-09-29 排查生产客诉时，同一项目出现模型调用返回视频路径、Zeus 有积分支出，但最终 DSL 只保留一个短片段；另一项目的导出界面停在 99%，而远程渲染任务已经成功。把生成调用、扣费、时间线、渲染和本地下载混为一个“完成”状态，会误判原因和责任层。Agent 对成功数量或下载结果的陈述也可能与工具记录不一致。

**How to apply:**

1. 用 Admin 用户信息按 Thread ID 查询，在「积分消耗」看项目与模型分组、原始 Zeus 支出流水；核对用户是否有其他项目。失败工具调用次数不能直接推导扣费，模型请求的预期价格也不能代替 Zeus 实扣。
2. 对齐 Chat 中原始用户指令、`generate_video` 请求/返回路径、停止或取消时间、`update_dsl` 的片段和时长、`render_video` 的实际输入与输出。成功返回素材路径只证明生成工具报告产物，不能证明已写入 DSL、成片或用户已下载；停止 Agent 后仍要检查在途生成是否随后返回。
3. 导出 99% 要先检查远程渲染/RTC 任务状态，再查最终视频资产、下载 URL 和浏览器网络请求。前端进度实现指针：`~/Downloads/sandai-code/vidmuse.ai/apps/vidmuse/src/util/exportProgress.ts` 与 `src/view/ThreadDetail/components/ArtifactHeader/index.tsx`；读取时核对线上版本。该实现按创建时间估算进度并封顶 99%，不是文件传输百分比。
4. 前端下载实现指针：同仓库 `apps/vidmuse/src/hooks/useLatestVideoDownload.ts`、`src/service/assets.ts`、`src/util/file.ts`。核对最终视频资产标签查询和浏览器 `<a>` 下载；本地标记“已下载”发生在触发下载后，不能单独证明 HTTP 成功或文件落盘。

## 只读案例入口

- [2026-09-28 短成片及积分客诉](https://prod-vidmuse-admin.vidmuse.ai/playground/thread/e91e89d3-3836-4997-aa35-2864a5754932?tab=chat)：核对模型返回、停止后的在途任务、最终 DSL 和 Admin 用户积分流水。
- [2026-09-28 导出 99% 客诉](https://prod-vidmuse-admin.vidmuse.ai/playground/thread/b09980de-aba2-4a88-9d3e-15a9d633ee47?tab=remote-calls)：核对渲染任务与用户下载结果；具体 HTTP 失败原因仍需当次浏览器网络证据。
