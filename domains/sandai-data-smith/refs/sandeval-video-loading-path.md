---
name: sandeval-video-loading-path
type: reference
created: 2026-10-21
updated: 2026-10-21
tags: [sand-eval, media, performance, prefetch, cdn]
links: [sandeval-api-observability, sandeval-aac-corrupt-packet-browser-stall]
---

# Sand Eval 视频加载通用链路

**Why:** 页面转圈可能来自地址签发、媒体传输或浏览器解码；业务API耗时不能代表首帧耗时，已实现预热也不能证明所有题都已缓存。

**How to apply:** 先冻结主线SHA并核对目标部署，分别测量题目读取、签发、媒体首字节、首帧与拖动恢复。沿预热预算及门槛查跳过原因，沿签发服务查就绪读取、对象HEAD和审计写入；不要在没有线上分段耗时的情况下指定主因。

## 核验入口

- [2026-10-21只读通用链路报告](/Users/leslie/Documents/Playground/output/sandeval-video-loading-20261021/report.md)：冻结源码、等待机制、超时覆盖、候选优化与证据边界。本次未取得线上耗时或CDN命中数据，未修改业务代码或生产配置。
- 仓库 `world-sim-dev/sandai-data-smith`：`sand-eval/platform/frontend/src/components/questionTypes/shared/{MediaVideo.tsx,preparedMedia.tsx,mediaDeliveryRecovery.ts}`；从当前实现读取预算、失败冷却与超时范围，不在wiki复制易变数值。
- 预热编排：`frontend/src/pages/myTasks/{useQuestionPrefetch.ts,questionPrefetchGate.ts,questionWorkPrefetch.ts}`。核对移动端、忙碌、前台缓冲、大小探测与播放器复用条件。
- 签发：`backend/app/services/facts/{media.py,media_preparation.py}`。区分单对象与批量路径、源与目标同对象和副本路径，不将单路径往返次数外推所有题。
- 部署声明：`platform/k8s/configmap.yaml`；运行契约：`sand-eval/docs/operations/cdn-media-rollout.md`。实际Pod/CDN状态须独立回读；媒体传输日志与Web日志分开查询。
- 原文件固定位置解码故障沿 [AAC坏包案例](../pitfalls/sandeval-aac-corrupt-packet-browser-stall.md) 核验；历史案例不能代替当前素材取证。
