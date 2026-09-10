---
name: evolve-received-evidence-before-run-freeze
type: pitfall
created: 2026-09-10
updated: 2026-09-10
tags: [maxwell, evolve, evidence, diagnosis]
links: [evolve-evaluation-blockers-20260910, evolve-retry-state-transition]
---

# EVOLVE 未冻结证据集与已接收输出的区别

**Why:** Trial 抽屉的“尚无证据”不能证明远端没有生成输出。2026-09-10 调查 Run `run_b788d5c4a09804f7a0219e9534021f57` 时，Worker 日志与只读数据库确认三条 Attempt 已到 evidence_received 并存有 response_hash，但 Run 在统一冻结 EvidenceSet 前因 optimistic version conflict 失败，六条未评分 Trial 被取消，界面未展示这些输出。具体竞争写入尚未定位，不能从通用错误推定多个 Worker 或用户取消。

**How to apply:** 先关联 Worker 的 evolve_trial_evidence_received 日志、evolve_trial_attempts.response_hash、evolve_trials.evidence_artifact_id，再判定输出是否存在。恢复评测优先核对已存 blob，避免直接重调目标。错误包装应包含操作名、Trial/Attempt ID、预期状态和版本，勿把通用 CAS 错误当作完整根因。

调查入口：Maxwell services/evolve-server 的 application/evaluation/live.go（liveReceiveEvidence、freezeLiveEvidence）、processor.go（failRun），infrastructure/postgres/attempts.go（CAS）、runs.go（失败终态提交）。线上版本及远端清理状态需重新读取，历史调查不是当前完成证明。
