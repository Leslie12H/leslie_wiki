---
name: free-canvas-draw-video-chain
type: reference
created: 2026-11-09
updated: 2026-11-09
tags: [vidmuse, free-canvas, draw-video, model-api, inngest, vidflow, nas]
links: [vidmuse-aion, vidmuse-zeus, vidmuse-ai-frontend, free-canvas-generation-export, free-canvas-download-attribution]
---

# 自由画布 draw-video 链路核对入口

**Why**：自由画布抽卡涉及请求受理、事件投递、供应商执行、原件落盘和画布版本同步。排查时要分别确认各阶段的完成证据，并按入口区分浏览器抽卡、镜头视频生成与服务端托管画布生成。

**How to apply**：先确认区域及入口。按目标环境的发布记录找实际镜像 tag，再到对应提交核对代码。排查单次抽卡时，从画布节点和 generation run/slot 找 RTC task ID，再关联 Inngest 事件和 workflow run、Model API request、供应商任务及素材路径。区分业务任务、模型请求和供应商任务各自的状态与 ID。

## 代码回查顺序

1. 网页请求在 `vidmuse.ai` 的 `threadFreeCanvasRuntime.ts` 和 `threadCanvasGenerationGateway.ts`。核对抽卡数量、幂等键和画布元信息。产品鉴权及 thread ID 映射看 `vidmuse-zeus` 的 `AgentTaskWorkerController`、`AgentTaskWorkerService`、`AgentTaskWorkerClient`。
2. Aion Manager 受理看 `apps/manager/controller/public/agent_task_worker.py::trigger_draw_video`、`service/task_worker_reliability.py::accept_task_batch` 和 `service/inngest_service.py::send_event`。分别核对 RTC、outbox、事件名与事件 ID。VidFlow 接收入口看 `apps/vidflow/inngest_app.py::mount_inngest`，执行看 `vidflow_tasks/generate_shot_video_workflow.py` 的认领、提交、轮询与结束步骤。
3. Aion API 的服务边界看 `apps/manager/app.py` 与 `apps/vidflow/vidflow_service/aion_client.py` 的 scope 路由。模型路由、计费、供应商任务和原件物化看 `apps/manager/controller/model_api.py::generate_video`、`get_task_status`、`_materialize_polled_success_result_data`。用 `model_api_requests` 回查模型实际参数和供应商任务号。
4. 素材存储回查 VidFlow 的 `_submit_video_generation` 和 `generation_utils.py::extract_saved_path`，再核对 `UserFileManager`、Manager/VidFlow/static-file-server 同一区域 overlay 的 PVC、subPath 及挂载点。原件、OSS 预览和浏览器 CDN 地址分开查证。浏览器路径转换看 `vidmuse.ai` 的 `convertFilePathToUrl.ts`。
5. 结果回填先看 VidFlow 的 `_finish_thread_task` 及 `standalone` 分支，再核对 Manager 的 `service/agent_task.py::update_task_status`。网页 `draw-video` 从 `canvasTaskChangeFeed.ts` / `threadCanvasTaskGateway.ts` 读取任务，`canvasTaskSupervisor.ts` 合并节点版本，`threadCanvasRepository.ts` 保存文档。服务端托管生成另查 `service/mcp_async_task_v2.py` 和 `service/canvas_generation/projection.py`。用当前文档版本和文件可读性分别核验回填与播放。

## Runner 启动边界

- 核对点击生成是否依赖 Agent Runner，从 `trigger_draw_video` 和 VidFlow 的 `_run_remix_shot_video` 追实际派发。直接抽卡独立于 Agent Runner 的执行和生命周期。
- 新建项目和发送 Agent 消息分别核对。空白画布创建检查 `service/agent_thread.py::_should_defer_blank_free_canvas_runner`、`LAZY_BLANK_FREE_CANVAS_RUNNER_ENABLED` 与 `blank_free_canvas_lazy_start`。首条消息、模板、初始 artifacts 或 App 启动可进入其他分支。画布 Agent 发消息看 `service/agent_thread_message_v2.py::queue_user_message_v2` 到 `check_or_reactive_thread`，用于核对 Runner 的复用或启动。开关有效值及单个项目的启动情况应查目标环境。

## 发布证据指针

- 2026-11-09 以海外 `prod` 为核对范围。从 [Manager 发布回执](https://github.com/world-sim-dev/aion/actions/runs/42330870994) 和 [VidFlow 发布回执](https://github.com/world-sim-dev/aion/actions/runs/41636805777) 的日志查目标环境、实际 `ACR_EE_TAG` 和 rollout 结果。VidFlow 回执中的 workflow HEAD 与发布镜像 tag 不同。
- 上海生产沿 `manager-deploy-cn-prod.yml`、`services-deploy-cn-prod.yml` 与各自的 `prod-sh` overlay 核对，环境配置以实际部署为准。本次取证覆盖海外生产发布回执及对应源码，未取生产 Pod 快照或发起实单。
