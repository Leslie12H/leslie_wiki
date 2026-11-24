---
name: beta-homepage-magi-2-comparison
type: pitfall
created: 2026-11-24
updated: 2026-11-24
tags: [vidmuse, magi-2, beta, free-canvas, generation]
links: [vidmuse-ai-frontend, free-canvas-generation-export, vidmuse-thread-output-billing-and-export-evidence]
---

# Beta 首页 MAGI-2 示例复跑与候选数量

**Why:** 首页展示短摘要和样片。「去创作」打开的自由画布会带入原始参考素材和更完整的提示词。2026-11-24 在电影和动画动漫两个示例中，电影生成前的编辑器显示 `x1`，两个示例实际各点击一次后均出现三个「视频对比」候选。只看编辑器数量或首页样片会误判实际请求和产出。

**How to apply:** 从 [Beta 首页](https://beta.vidmuse.cn/#matrix) 打开对应场景的「去创作」，核对画布里的已上传素材、完整提示词、模型、比例、分辨率和目标时长。一次提交后先确认对比节点候选数与状态，再逐个查看终态和新生成的可播放视频。批量复跑以实际候选数估算；积分余额是页面观测，精确实扣按账单流水核验。候选参数用其提示词入口和实际模型请求核实。

**受理回读:** 2026-11-24 批量复跑中，有模板点击后瞬时显示「生成中」，关闭过早时回开只剩空生成节点，积分也没有对应变化。保留标签页至 `POST /api/v1/threads/{thread_id}/task-worker/draw-video` 返回 HTTP 200，确认「视频对比」显示候选，再重开同一项目确认结果可回读。补交前核对原项目的受理和持久化证据；仍存在不确定性时保留原项目检查。

2026-11-24 复现入口：[电影画布](https://beta.vidmuse.cn/thread/7634365b-3288-428e-ae6e-0f1c71502db1)、[动画画布](https://beta.vidmuse.cn/thread/1d444664-e42e-48ed-96ae-07ebd734a140)。
