---
name: sandeval-shot-tail-vs-end-boundary
type: pitfall
created: 2026-10-15
updated: 2026-10-15
tags: [sand-eval, caption-refine, video, frame, time-boundary]
links: []
---

# 镜头尾帧时间与结束边界相差一帧

**Why:** 用户在 2026-10-15 的截图中看到同一镜头显示 1.72 秒与 1.76 秒。帧的显示时间指该帧起点，包含尾帧的片段结束边界则在该帧播放完之后；两者可以相差一帧。25 fps 下每帧 0.04 秒，从 0 开始的第 44 帧起点为 1.72 秒，该帧结束于 1.76 秒，总时长为 1.76 秒。界面若混用尾帧、结束边界与时长而没有明确标签，会导致用户误判。

**How to apply:** 先确认素材实际帧率、当前帧号和区间定义，再分别回答尾帧位置、结束边界与镜头时长。不要因为读数相差一帧就改答案。下面记录源码复核入口；当前界面及线上版本每次重新核验。本次仅截图与本地源码核对，未定位具体线上题目，未修改业务代码或数据。

## 复核指针

仓库：`/Users/leslie/Downloads/sandai-data-smith`。

- `sand-eval/platform/question_types/caption_refine_v6/README.md`：尾帧包含、time_span 使用下一帧起点作为结束边界的契约。
- `sand-eval/platform/question_types/caption_refine_v6/ui/Answering.tsx`：`ShotFrameSummary` 的尾帧换算、镜头卡片的 `time_span` 展示。
- `sand-eval/platform/frontend/src/components/questionTypes/shared/SegmentTrimEditor.tsx`：`selectedDuration` 与标题时长、当前帧号及帧起点读数。
- `sand-eval/platform/frontend/src/components/questionTypes/shared/captionFrameTimes.ts`：准确帧元数据与公开秒数的转换，以及 exclusive end 注释。
