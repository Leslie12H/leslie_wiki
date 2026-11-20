---
name: magi2-generation-lineage-entrypoints
type: reference
created: 2026-11-20
updated: 2026-11-20
tags: [vidmuse, magi-2, free-canvas, cli, sandai-platform, athena]
links: [vidmuse-aion, free-canvas-draw-video-chain, free-canvas-generation-export, sandai-api-platform-development-entrypoints]
---

# VidMuse Magi-2 抽卡与 CLI 任务关联

## Why

一次画布操作可能产生多次模型请求。独立 CLI 模型调用可以没有 Thread。提交、派发和执行分别发生在不同服务，按时间或提示词拼接会串任务。先用持久化的业务 ID 关联，再用日志补历史缺口。

## How to apply

1. Thread 入口先查 VidMuse 产品记录到 AION Thread 的映射，从 RTC 任务或画布生成记录枚举每次尝试，保留模型提交前就失败的任务。到 VidFlow `generate_shot_video_workflow.py` 核对 `data.model_request_id` 回填和 RTC ID 向 AION 模型请求的传递。有明确关联时复用 AION 的 `remote_tool_task_id`，详情见 [自由画布 draw-video 链路](free-canvas-draw-video-chain.md)。
2. VidMuse CLI 的 `model run --async` 返回 AION 模型请求 ID，直接用主键查。关联 Thread 以服务端记录为准。核对 AION `model_api_requests` 的 `thread_id`、`request_params`、`upstream_provider`、`upstream_provider_id` 和 `upstream_task_id`。同一上游字段的含义随提供方变化，只有核实走 Sand AI Open 的提交才能把它解释为 OpenAPI generation ID。用该次实际出站 host 选择平台环境，历史路由的查证入口见 [访问日志入口](access-log-entrypoints.md)。[AION 模型请求](https://github.com/world-sim-dev/aion/blob/main/apps/manager/database/model/model_api_request.py#L40-L59) · [Sand AI Open 适配器](https://github.com/world-sim-dev/aion/blob/main/packages/api_aggregation_adapter/src/api_aggregation_adapter/adapters/sandai_open_adapter.py#L340-L367)
3. 开放平台 Zeus Dispatcher 在确认提交时会在任务上持久化 `task.attributes.infer_job_id`。优先按正确环境的 generation ID 读该映射及派发状态。缺历史记录时查精确 `task_submitted` 事件，或在确认路由契约后按平台任务号、Athena project 和 group 核对 Job。共用 worker 所在区域不能证明调用环境。参见 [Zeus 持久化入口](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/domain/task/dispatch/TaskDispatchMapper.java#L86-L94) · [Athena 排队与推理时长查证](../../sandai-platform/refs/performance-testing-entrypoints.md#2026-11-18-按组织拆解-athena-排队与推理时长)。
4. 输出提示词时标明采集层。任务提交原文和 AION 模型请求参数分别读。适配器还可能重写素材引用再提交，回溯实际平台入参应查精确 OpenAPI 任务，见 [抽卡导出入口](free-canvas-generation-export.md) 和 [适配器 payload 构造](https://github.com/world-sim-dev/aion/blob/main/packages/api_aggregation_adapter/src/api_aggregation_adapter/adapters/sandai_open_adapter.py#L248-L266)。

## 入口提案

- VidMuse Admin 的 Thread Detail 加「生成记录」页签。全局精确查 ID 同样接入服务端查询，覆盖无 Thread 的 VidMuse CLI 请求。沿 [现有 Thread 页面](https://github.com/world-sim-dev/vidmuse-admin/blob/main/playground/src/pages/ThreadPage.tsx) 和 [模型请求读取权限](https://github.com/world-sim-dev/vidmuse-admin/blob/main/apps/admin/controller/admin/model_api_request.py#L49-L55) 核对复用点。
- 首版由 Admin 后端按 Thread 或主键读 AION，再调用平台受控批量读取接口，以环境和 generation ID 查这一页的状态与 Job ID。用既有业务记录分页。状态按来源注明，区分未提交、受理未知、已受理待派发和历史缺证据。提示词详情和媒体引用沿授权读取与现有脱敏规则。
- 历史补查只采信精确关联。新请求在上游提交边界记录实际目标路由和此次回执。若有覆盖历史的多次供应商尝试，按尝试留存引用，避免被单列最新任务覆盖。按 Thread 对照成功、预派发失败、多抽或重试，以及持 CLI ID 查无 Thread 请求，逐项核验 ID 和提示词。
- 2026-11-20 核对源码与本机 CLI 帮助。上述入口为方案，生产覆盖率和部署状态待验收。
