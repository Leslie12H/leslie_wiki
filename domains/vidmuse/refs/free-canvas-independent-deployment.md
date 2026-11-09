---
name: free-canvas-independent-deployment
type: reference
created: 2026-11-09
updated: 2026-11-09
tags: [vidmuse, free-canvas, deployment, isolation, inngest, nas]
links: [free-canvas-draw-video-chain, vidmuse-aion, vidmuse-zeus, vidmuse-ai-frontend]
---

# 自由画布独立环境部署入口

**Why**：新建 namespace 和部署镜像只能证明计算层已起。画布任务、计费、素材、调度和浏览器地址各有独立状态；共用现有业务数据、事件环境或 CDN 默认值会破坏隔离。

**How to apply**：以能登录、建空白画布、点一次 `draw-video`、回填并播放为首个验收范围。先列版本、资源、调用方和凭据归属，再从各仓库 base 派生目标 overlay。上海生产是拆分部署的参考，现有流水线、集群、PV 及数据源预检绑定原环境。验收计划需在新环境执行，本页记录的是源码与发布手册核对入口。

## 基础资源和初始化

- Aion：查 [Manager 部署手册](https://github.com/world-sim-dev/aion/blob/main/docs/runbooks/manager/shanghai-deploy.md) 的启动前条件、Manager README 的 Alembic 入口、`apps/manager/alembic/env.py` 的目标库取值。新库先验证 schema 和迁移记录，再以私有项目入口及 `service/model_config.py` 核对 project/token、模型配置、供应商和路由。即使只跑直接生成，也用真实的自由画布插件配置来创建项目。模板和共享资源按所启用能力准备。
- Zeus：查 [初始化清单](https://github.com/world-sim-dev/vidmuse-zeus/blob/main/deployment/overlays/zeus-vidmuse-c-prod/INITIAL-DATA-CHECKLIST.md) 和正式 schema 基线及后续迁移。确认测试用户、登录方式、credits、项目类型和插件映射、前端动态配置。新库历史用户、交易、会话和 outbox 从空状态开始。分别核对 Zeus 的 Aion 项目 token 和 Manager 的 Zeus 计费凭据。
- Asset Meta：查 `apps/manager/service/model_api/result_materialization.py::validate_asset_meta_preconditions` 和 `service/asset_meta_service.py`。指定结果落盘目录会在模型提交前校验服务配置。独立实例、schema 和存储目录从 [Asset Meta 部署手册](https://github.com/world-sim-dev/vidmuse-services/blob/main/docs/runbooks/asset-meta-server/shanghai-deploy.md) 回查，验收实际资产写入及浏览器查询。
- 存储：参照 Aion Manager/VidFlow/static-file-server 的区域 overlay，检查 RWX 挂载、各容器路径、UID 权限、媒体静态路由及 OSS 上传/预览。业务隔离看 PVC 实际后端和 bucket/权限；容器内可以保留代码识别的逻辑路径。保持私有目录与可浏览静态根分开。

## 服务接线与验收

- 依次核对独立 MySQL/Redis 和 broker、NAS、OSS、Asset Meta、Manager/Zeus、VidFlow/Inngest、Web 与媒体入口。Aion 的 event-emitter 和扣费补偿按对应发布手册启用。VidFlow 的 `AION_BASE_URL` 用新 Manager 服务根地址。Model API 随 Manager 部署。
- 调度核对 [上海 VidFlow 启用条件](https://github.com/world-sim-dev/aion/blob/main/docs/runbooks/manager/shanghai-services.md#vidflow-启用条件) 和 [Inngest App Sync](https://www.inngest.com/docs/platform-and-operations/apps-and-syncs)。为新环境使用对应的 event/signing key 与稳定 App ID。同步 `/api/inngest` 后回读触发器和环境；自托管需按锁定 Python SDK 核对 API/Event API 地址和持久化。
- 前端查 `src/api/index.ts` 的浏览器同源入口与 SSR `API_SERVER_URL`，`next.config.ts` 的 build asset prefix，`domainProbe.ts` 的媒体 fallback 和 `imageRemotePolicy.ts` 的主机允许列表。独立环境分别验收 Web 静态构建资源、素材原件、预览和登录跳转的实际 host。
- 验收顺序为目标集群与清单 dry-run、Pod/依赖连通性、双向鉴权、Inngest 注册和派发、网页一次最小生成。逐段回读 RTC、模型请求、积分交易、NAS/OSS、Asset Meta 和重开页面后的画布版本；用同一幂等键复查重复提交，再测失败的结算和回填。以访问日志与资源标识核对跨环境隔离。
- 如果纳入画布 Agent，另沿 Aion 上海 Runner/Sidecar 启用条件核对模板、网关、VidMCP 和插件/模型依赖，单独验收首条消息与按需启动。其他产品功能按各自仓库依赖另行初始化。
