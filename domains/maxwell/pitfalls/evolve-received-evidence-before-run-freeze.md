---
name: evolve-received-evidence-before-run-freeze
type: pitfall
created: 2026-09-10
updated: 2026-09-10
tags: [maxwell, evolve, evidence, diagnosis]
links: [evolve-evaluation-blockers-20260910, evolve-retry-state-transition]
---

# EVOLVE 未冻结证据集与已接收输出的区别

**Why:** Trial 抽屉的“尚无证据”不能证明远端没有生成输出。2026-09-10 调查 Run `run_b788d5c4a09804f7a0219e9534021f57` 时，Worker 日志与只读数据库确认三条 Attempt 已到 evidence_received 并存有 response_hash，但 Run 在统一冻结 EvidenceSet 前因 optimistic version conflict 失败，六条未评分 Trial 被取消，界面未展示这些输出。同日后续 SQL 审计定位到整篇文档题的 Attempt 在主节点执行 UPDATE 影响 0 行，随后同连接执行该 Attempt 的存在性检查，确认错误来自 UpdateTrialAttempt 的数据库 CAS 分支。不能从通用错误推定多个 Worker 或用户取消。

**How to apply:** 先关联 Worker 的 evolve_trial_evidence_received 日志、evolve_trial_attempts.response_hash、evolve_trials.evidence_artifact_id，再判定输出是否存在。恢复评测优先核对已存 blob，避免直接重调目标。错误包装应包含操作名、Trial/Attempt ID、预期状态和版本，勿把通用 CAS 错误当作完整根因。

调查入口：Maxwell services/evolve-server 的 application/evaluation/live.go（liveReceiveEvidence、freezeLiveEvidence）、processor.go（failRun），infrastructure/postgres/attempts.go（CAS）、runs.go（失败终态提交）。线上版本及远端清理状态需重新读取，历史调查不是当前完成证明。

## 2026-09-10：CAS 读写一致性排查

部署版本 `14df1d1b` 的 GetLatestTrialAttempt 与 UpdateTrialAttempt 独立从连接池取连接。现场代理为自动读写分离、会话一致性，开启事务拆分；审计确认故障窗口存在只读节点 SELECT 和主节点 UPDATE。该 Trial 在一次 GET 完成后不到 1 秒再次 GET，违反正常 2 秒轮询间隔，随后 CAS 失败。结合单 Worker、无提前取消的日志，旧版本读取是高置信触发解释；审计中参数化 UPDATE 保留占位符，未获得原始读取结果及绑定版本，不能把具体旧/新版本数字写成历史实测事实。

使用当时部署代码，本地单处理器注入一次旧 Attempt 读取即可复现 CAS 失败、整 Run 失败及已有输出 Trial 被取消；这证明应用缺少状态重读与协调，不证明历史复制延迟值。400 次只读在线采样未看到版本回退，不能冒充线上复现。

**Why:** 会话一致性只约束同一数据库连接，连接池跨连接的状态机需要更强读取保证。把 CAS 冲突直接传入 failRun 会将局部状态竞争扩大为整组取消。

**How to apply:** 状态机读应使用主节点一致性语义；CAS 冲突后核对最新状态和 Run 租约再协调，不能盲目重发远端任务。优先调整 EVOLVE 自身连接策略，勿直接更改共享集群全局配置。日志补操作、Attempt、预期/实际版本。重跑前先检查已存输出。

审计入口：PolarDB 集群 `pc-2zemufe66p6g9lc6h` 的 SQL 洞察，数据库 `dev_maxwell_evolve`，2026-09-10 17:17:48–17:17:55（UTC+8）；故障 Attempt `attempt_c112f20c209c9507abcc92d4119ee0fb`。代码及复现指针：Maxwell `.tmp/evolve-cas-diagnosis-20260910/ROOT-CAUSE.md`、其中的部署版本源码和 `live_stale_read_diagnosis_test.go`。临时目录可能被清理，永久判断以版本化源码与审计为准。

## 2026-09-10：修复与验证入口

修复 PR：[maxwell-ai #276](https://github.com/world-sim-dev/maxwell-ai/pull/276)。生命周期读取使用主节点路由，CAS 冲突后重读并校验租约，持续冲突让出处理片段；失去租约时不允许旧处理器终止 Run。部署与合并状态以 PR 和运行环境为准。

**Why:** 即使接管前后 Worker ID 相同，新 claim 的版本也必须隔离旧处理器；只比较 owner 会让旧处理器误终止新任务。

**How to apply:** 参考 application/evaluation/live_conflict_test.go 的旧快照、已有证据、连续冲突、取消及同名/异名接管回归场景；真实 PostgreSQL 的 CAS 错误详情见 infrastructure/postgres/cleanup_integration_test.go。2026-09-10 本地全量单元测试和其余 PostgreSQL 集成测试通过；TestRepositoryIntegration 的 artifact_objective 缺失在未修改 main 同样复现，不应记成全量集成通过。主节点 hint 的实际代理路由仍需部署后核验，历史失败 Run 不因代码修复自动恢复。
