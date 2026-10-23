---
name: evolve-runtime-payload-and-terminal-recovery
type: pitfall
created: 2026-10-23
updated: 2026-10-23
tags: [maxwell, evolve, runtime, recovery, performance]
links: [evolve-query-latency-and-tuning-visibility, evolve-nextplay-archive-navigation-parity]
---

# EVOLVE 大输入、停机恢复与新会话计划的排查边界

**Why:** A2A 包装器收到请求、内层被测系统完成、证据归档可读和评分完成是不同层。附件原文如果经过多层 Base64/JSONB 往返，会放大派发耗时；本地观察器停机也不能证明远端仍在运行。持续任务换会话后，旧会话的执行许可与新会话的只读准备权必须分开，描述画像中的旧执行器不一定是基线实际使用的接入对象。

**How to apply:** 先按既有 Run/Trial/Attempt、远端 Thread/Run 和原引用追踪，不重复派发。对照大输入的实际请求字节、私有存储 CAS 与回读耗时，再判断是否传输放大。私有封装可以压缩，但恢复身份仍校验原始大小、摘要与归属，并限制解压读取；回滚必须保留在途命令的兼容读取。观察器恢复时先读远端真实终态，父任务取消仍要有效；已确认完成但归档暂不可读应重读同一任务。新会话仅准备计划不能继承旧执行许可；真实接入默认继承已测基线，仍保留明确授权与根用量审计。

## 源码与验证指针

- Maxwell：`services/agent-server/internal/app/integration/runtime/storeadapter/command_payload.go` 及相邻测试；`services/evolve-server/internal/modules/evolve/application/evaluation/live.go`、`live_outage_recovery_test.go`；`application/commands/optimization_explicit_run.go`、`infrastructure/postgres/human_measurement_integration_test.go`。当前实现和版本应重新核对，不把本页当作已发布声明。
- 本轮完整记录：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-unified-20261019/flexibility-acceptance-20261022.md`。
- 本轮源码冻结及增量复审：集成工作区 `.tmp/evolve-unified-1019/.tmp/final-runtime-recovery-review-20261023.{md,json}`。真实运行、评分、发布和自动审批边界沿记录回查。

技术单题替换通过不能替代自然调优或双轮十题提升。多个真实子任务或模拟用户回合会增加等待时间，应读实际事件与终态定位，不因长等待直接归因于 Adapter 轮询，也不能用部分评分覆盖历史基础设施失败。

## 隔离评分的证据来源必须对齐

**Why:** 2026-10-23 真实验收发现，评分接纳202、任务查询200仍可能只表示评分任务已失败。使用本地EVOLVE运行、共享dev Judge的混合拓扑时，Judge固定回取共享EVOLVE，无法访问本地任务及原件；继续等待或重发执行不会修复这个归属错位。

**How to apply:** 同时核对执行结果所在地、评分服务配置的证据来源、任务归属及评分返回体；通过原任务只读回取复现，不只看HTTP状态。隔离验收应使用相同证据域内的原评分副本或已有被授权的传输拓扑，保留原评分版本和模型，不关闭鉴权、不把失败算零分、不迁移或覆盖旧终态。库初始化及新增凭据目的地按既有确认规则处理。具体回执与恢复计划见本轮验收记录及`output/evolve-unified-20261019/isolated-original-judge-20261023.md`；本页不声明恢复已完成。
