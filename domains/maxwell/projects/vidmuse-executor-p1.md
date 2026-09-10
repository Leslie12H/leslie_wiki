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
