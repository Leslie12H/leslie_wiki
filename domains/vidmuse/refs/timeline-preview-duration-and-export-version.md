---
name: timeline-preview-duration-and-export-version
type: reference
created: 2026-09-08
updated: 2026-09-08
tags: [vidmuse, timeline, export, evidence]
links: [vidmuse-ai-frontend, vidmuse-admin]
---

# 时间线预览时长与导出版本核对入口

**Why:** 同一线程可以先后输出全长混流、裁短分镜、加片头等独立文件。早期 Agent 自述的截断和偏移不能直接作为当前 DSL 或最终文件的事实。

**How to apply:** 先读取当前生产 DSL，逐段求主轨结束时间，比较音频及子轨结束点；再用前端格式化代码解释时间码。导出需绑定具体聊天消息、工具执行及文件，单独核验媒体元数据与切点。Agent 的认错或修复声明不等于产物验证。

## 代码指针（使用时重新读取）

前端仓库 `~/Downloads/sandai-code/vidmuse.ai/`：
- `apps/vidmuse/src/view/ThreadContentView/hooks/timelineTrackViewModel/v3.ts`：DSL duration 到轨道时长的投影。
- `apps/vidmuse/src/view/ThreadContentView/components/TimelineEditorV2/logic/timelineLayout.ts`：顺序轨求和、定时轨结束点、轨道总长度取最大值。
- 同目录 `logic/timecode.ts`：显示帧率、向下取整及分秒帧格式；不要假定使用源视频帧率。
- 同目录 `components/TimelineControls.tsx` 和 `index.tsx`：总时长显示与取值入口。

## 案例入口

2026-09-08 只读核验 Take Me Over：
- [生产当前时间线](https://vidmuse.ai/zh-CN/thread/71334852-5d6f-43ed-a194-4dee7a24b651?view=timeline&track=shot)
- [生产 DSL](https://prod-vidmuse-admin.vidmuse.ai/playground/thread/71334852-5d6f-43ed-a194-4dee7a24b651?tab=dsl)
- 对话查找 `shorten 1-4 to fit the storyboard` 与后续片头请求；最终独立视频文件仍需另行核验，不将聊天声明当成实际导出参数。
