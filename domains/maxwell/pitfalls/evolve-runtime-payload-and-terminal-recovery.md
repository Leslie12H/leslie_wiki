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

## 2026-10-23 重评沿用原执行证据

**Why:** 一个Run完成执行后，新建重评Work并不等于重新执行候选。持续调优根若把重评套入候选准入，会误报版本冲突；即使接纳成功，用新Work对照仍绑定原Trial的文件，也会误报证据无权访问。只验证同Work的mock会遗漏这个跨Work生命周期。

**How to apply:** 检查现有重评命令、根计数事务、运行期权限、原件解析、外部Judge拉取和详情下载整条链。真实用户身份从服务端注入；重复提交沿用同键，根用量不清零，自动阶段/租约不因重评改变。已授权的冻结EvidenceSet按完整引用、Case和执行次数核验原Trial，再由原解析器验证原Attempt及文件hash；不要给新Trial伪造旧文件绑定，也不要用platform身份跳过归属。测试应跨Work、跨Run、隐藏题和实际authorizer，并区分有效质量失败与基础设施失败。

- 源码入口：`application/commands/rescore.go`、`infrastructure/postgres/human_rescore.go`、`application/ports/human_rescore.go`、`application/evaluation/evidence_owner.go`（均在EVOLVE模块）；引用读取与详情分别检查`judge_references.go`及`application/queries/evidence.go`。
- 回归及真实结果指针：本轮验收记录与集成工作区`.tmp/rescore-root-cause-review-20261023.md`、`.tmp/rescore-review-freeze-20261023.json`。源码已测、Judge真实出分、完整十题和双轮提升分别查证，不把首题出分当验收完成。


## 2026-10-23 评分等待与数据库 JSON 往返

**Why:** 处理slice退出后继续保留心跳续租，会让已完成的评分空等剩余租约；大JSON进入MySQL队列filesort会耗尽排序内存；MySQL JSON数值规范化还可能让封存报告与数据库回读值出现末位差异，被严格原件比对当作修改。评分任务completed因此不代表平台已拿到可用报告。

**How to apply:** 先分别定位执行、判卷、报告回收和平台提交时间。让出处理槽时，在处理与心跳全部停止后，以精确旧deadline/owner/业务/Run释放租约，验证同worker新claim也不能被旧claim释放。队列只排序锁定任务身份，再按主键读取正文；不要长期靠提高排序内存掩盖整份JSON排序。数值恢复不得引入容差或修改评分：仅在数据库自身JSON规范化证明整份封存响应等于持久化结果后读取封存原精度，继续核对所有归属、文件摘要和内容；测试实际MySQL及被篡改响应拒绝。

- Maxwell代码入口：`internal/app/worker/worker.go`、`infrastructure/postgres/release_run_lease.go`及相邻公平轮转测试（EVOLVE）。
- Nextplay代码入口：`eval-service/src/eval_service/grading_repository.py`、`grading_reports.py`及`tests/test_repository_mysql_integration.py`。
- 真实恢复、源副本的基础设施补丁、完整十题与双轮提分边界，继续沿上述本轮验收记录及`original-judge-transport-patch-20261023.json`核对；评分内核不变不等于整体服务源码逐字未变。
