---
name: vidmuse-executor-p1
type: project
created: 2026-09-10
updated: 2026-09-10
tags: [maxwell, vidmuse, a2a, executor, postgres]
links: [vidmuse-a2a-executor]
---

# VidMuse Executor P1 实现入口

独立本地仓库：`~/Downloads/sandai-code/vidmuse-executor`。查看 README、docs/acceptance.md、contracts/sources.json 与 scripts/check-maxwell.py 获取范围、核验源码和复现步骤；运行结果以当前仓库及回读为准。未在本次工作中部署或登记业务空间，也没有真实生成。

**Why:** P1 只评测当前部署 plugin，无法把 EVOLVE resources 应用到 AION。外层必须保存任务与未决创建意图，避免崩溃后重复生成；不能把匹配的请求 hash 或 marker 当成真实版本证据。

**How:** 使用独立 PostgreSQL，go test 自动启动临时本地集群与 fake Zeus。创建前保存 intent；已有 binding 则继续查询；创建是否发生不明时停在 reconciliation_pending，不重建。GetTask 只读投影。input-required 后仍能取消，原证据保留、取消结果追加版本。

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
