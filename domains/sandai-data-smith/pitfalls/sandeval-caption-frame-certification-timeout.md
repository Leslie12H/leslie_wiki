---
name: sandeval-caption-frame-certification-timeout
type: pitfall
created: 2026-11-04
updated: 2026-11-04
tags: [sand-eval, caption-refine, frame-facts, r2v]
links: [sandeval-video-loading-path, sandeval-frozen-media-frame-facts-mismatch]
---

# Caption 标注页因逐帧认证超时返回缺少可信帧率

**Why:** 逐帧作答要求视频从零开始的完整恒定帧网格。容器声明的平均帧率与 OSS 可读性不足以完成认证。请求内逐帧扫描可能用尽时限，执行事实仅保留时长，导致题型初始化拒绝打开标注页。

**How to apply:** 对齐实际部署版本、题目请求状态、当前视频对象坐标和冻结执行事实。按生产预算与较长诊断预算分别运行同一帧网格验证器，记录头部和完整帧扫描耗时，区分超时、变帧率、对象不可读与冻结坐标不一致。盘点已认证范围时使用实际题包与投放关联。是否回填须按个案授权，回填只使用同一对象完成认证的帧网格，保留冻结时长及答案。

- [2026-11-04 R2V 标注只读对照](/Users/leslie/Documents/Playground/output/sandeval-r2v-frame-rate-20261104/report.md) 记录请求、两种扫描预算、同题初始化和实际题包范围。
- 源码入口 `sand-eval/platform/backend/app/services/facts/{navigation_frame_facts,video_frame_facts,question_media_facts}.py`。按实际部署 SHA 核对预算与持久化逻辑。

## 2026-11-04 定向恢复验证

按实际部署核对帧率来源和素材身份条件。写前重新读原对象与执行事实，已有正确帧率的题只验收；缺失的题以完整逐帧认证补齐，保留已冻结时长。提交后从独立副本同时核验认证网格和原答题卡的作答快照，并比较原作答基线。[恢复证据](/Users/leslie/Documents/Playground/output/sandeval-r2v-frame-rate-20261104/recovery.md)

## 2026-11-04 开放题存量补录

逐帧要求从当前部署题型的作答契约核定，严格要求与仅支持逐帧的旧题型分开。按开放任务的题包成员和实际投放取并集并去重，已分派候选优先。独立记录扫描、带原值保护的补录和回读结果，收尾用同一口径区分本轮存量与运行中新产生的候选。[批量审计](/Users/leslie/Documents/Playground/output/sandeval-caption-frame-stock-20261104/summary.json)
