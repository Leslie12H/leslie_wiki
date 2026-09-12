---
name: vidmuse-executor-p1
type: project
created: 2026-09-10
updated: 2026-09-12
tags: [maxwell, vidmuse, a2a, executor, postgres]
links: [vidmuse-a2a-executor]
---

# VidMuse Executor P1 实现入口

独立本地仓库：`~/Downloads/sandai-code/vidmuse-executor`。查看 README、docs/acceptance.md、contracts/sources.json 与 scripts/check-maxwell.py 获取范围、核验源码和复现步骤；运行结果以当前仓库及回读为准。未在本次工作中部署或登记业务空间，也没有真实生成。

**Why:** 已实现的 P1 选择在 Executor 内保存任务与未决创建意图，承接队列、轮询和恢复；这是该版的架构选择，不是 A2A 或用户需求必然要求。用户于 2026-09-12 明确强调 Executor 只负责触发、查询结果和 Plugin 操作，应优先复用 Zeus/AION 的任务存储与 Maxwell 的评测状态。下文 PostgreSQL 是现有实现说明；去独立数据库的修订边界见文末。

**How:** 当前 P1 使用独立 PostgreSQL，go test 自动启动临时本地集群与 fake Zeus。创建前保存 intent；已有 binding 则继续查询；创建是否发生不明时停在 reconciliation_pending，不重建。GetTask 只读投影。input-required 后仍能取消，原证据保留、取消结果追加版本。不要把这些既有实现反推成用户必须接受的部署要求。

## 本次核验发现

- Maxwell `execution/contract.go:VariantApplied` 在核验 commit 828e7d87 的 fallback 中，只要顶层 variantHash 匹配，即使 applied=false 也可能判为已应用。external_a2a 的 marker echo 检查可以显示 l1_tune；不能据此让 P1 候选晋级。源码指针在独立仓库 contracts/sources.json，以后重新核对。
- a2a-go/v2 v2.4.0 的实际 wire role/state 为 ROLE_USER、TASK_STATE_*；不能把文档语义的 completed 等小写直接强转 SDK enum。认证 SecurityScheme 序列化使用值类型。
- Zeus 普通 adventurer 通过 options.plugin_id 选 plugin；产品 Vo 不单独暴露 AION Thread ID，P1 留空，不从产品 ID 推断。V2 messages 的 msg_id 是 before anchor，恢复必须保留向前分页语义。
- PostgreSQL jsonb 会调整 JSON 对象键序。证据哈希应先规范化嵌套 JSON，避免恢复后产生错误的新版本；不可变历史测试覆盖此路径。

校验入口：go test ./...、go test -race ./...、go vet ./...；原版 Maxwell evolve-executor-check 通过四项检查，测试 fake Zeus 调用为零。命令与当前记录见 docs/acceptance.md；不要将这些离线证据说成生产部署或媒体质量验收。


## DEV 部署准备核验入口 — 2026-09-12

**Why:** 可本地运行的 Go 服务不等于已具备部署交付物；部署 Executor 与发布候选 Plugin 需要分开验收。GitHub 没有 deployment 记录也不能单独证明所有集群都没有部署。

**How:** 从 [Executor PR #1](https://github.com/world-sim-dev/vidmuse-executor/pull/1) 的实际提交检查 Dockerfile、DEV 清单和 Actions，再读 cmd/vidmuse-executor/main.go 的监听地址及环境变量、internal/app/http.go 的健康路由和鉴权边界、internal/app/run.go 的 Worker/HTTP 生命周期、postgres/store.go 的显式迁移。构建固定版本镜像，使用独立 PostgreSQL 数据库与账号，先跑 --migrate Job，再启动服务；只给 DEV 目标和凭据权限。

上线前核对：容器监听可达、存活与就绪检查、Maxwell 到 Agent Card/A2A 的网络、Executor 到 DEV Zeus 和 PostgreSQL 的网络、产品账号身份与已部署 Plugin。先协议探针，再做受控真实 Case、Task 查询/取消/恢复和 Maxwell 结果证据验收；不把 probe 通过称为候选生效。

候选闭环还需 CLI 到 A2A 的装配、持久候选存储、DEV 增量发布、运行账号绑定和公共依赖版本支持。部署首版服务时不必先赋予 Plugin 仓库写入或云发布权限。实际部署、登记和真实生成状态以运行证据为准。

## 职责收窄与数据库去除方向 — 2026-09-12

**Why:** Zeus/AION 已保存 Thread、任务状态和业务产物，Maxwell 已拥有 Trial/Attempt、远端任务引用、轮询、取消与最终评测证据。用户质疑 Executor 再建四表任务系统的必要性。推荐把 Executor 收窄为 A2A/产品 API 适配器与 Plugin 操作模块，去掉其独立任务队列、后台轮询和数据库部署前提；并非把持久化状态改放内存。

**How to apply:** SendMessage 创建产品 Thread 并返回可恢复的 A2A 任务引用；GetTask/CancelTask 按账号权限查询和控制原 Thread；Maxwell 持有执行上下文并冻结最终证据。需明确 GetTask 所需 invocationId、账号绑定、完成条件和候选版本等上下文怎样通过现有存储或受控可验证句柄恢复。Git 保存 Plugin 版本，发布流水线保存发布状态，不依赖进程内异步任务。

移除数据库前必须补调用链幂等：Maxwell main 5917848e2aa8b68ece33de6253649ce77ea2570b 的 evaluation/live.go 与 live_dispatch_safety_test.go 明确允许 external_a2a 在 dispatching 且无 RemoteTaskID 时重发。普通 Zeus 创建链路现未贯穿调用方 request_id。应由 Zeus 以请求标识幂等创建并可找回 Thread，或调整 Maxwell 对不支持幂等的目标在结果未确认时停止自动重发并进入核对。不能只删除 Store 后宣称重启/重试安全。

这是设计修订，尚未重构业务代码或验证无数据库链路。源码入口：Executor execution/infrastructure/zeus/client.go 的 Create/Observe/Cancel；Maxwell evaluation/live.go 的 needsDispatch、ObserveInput 与 A2A registry.GetTask；候选版本入口仍见 candidate-preparation.md。
