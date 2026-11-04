---
name: evolve-terminal-run-orphan-dispatch
type: pitfall
created: 2026-11-04
updated: 2026-11-04
tags: [maxwell, evolve, cancellation, recovery, evidence]
links: [evolve-source-copy-read-coverage]
---

# Run 终态和零在途不能证明所有派发占位已经关闭

**Why:** Run、Attempt 和持续调优控制是不同状态机。2026-11-04 查到旧 Search 的业务状态 completed 而控制仍 awaiting_confirmation；原 UI 停止后，两条历史取消 Run 的 Attempt 仍停留 dispatching、没有远端任务身份。现有取消恢复只处理已取得任务身份等分支，不能据 Run 终态推定远端未执行，也不能通过重发取得身份。

**How to apply:** 新授权失败时分别核对 Work 版本、Search 状态、控制阶段、累计用量和所有未闭合 Attempt，而不是盲重试。先查原请求进程是否退出、目标业务原窗口 Thread/Run/event 与持久 workflow，再决定恢复方式。没有精确回执就保留未知，不把空会话按时间强行配到某个 Attempt。确需窄数据修复时，先冻结完整前态和哈希、准备精确 CAS 与回滚并取得所需写入授权；不修改原评分、账单或退还预算。停止旧搜索不等于恢复已经完成。

## 指针

- `services/evolve-server/internal/modules/evolve/application/evaluation/live.go`：`cancelLiveAttempts` 的筛选和实际支持分支。
- `services/evolve-server/internal/modules/evolve/infrastructure/postgres/optimization_control.go`、`optimization_reused_baseline.go`：新授权的控制与在途检查。
- `output/evolve-unified-20261019/orphan-dispatch-reconciliation-20261104.md`：本次窄恢复提案、限制与批准状态。
- `output/evolve-unified-20261019/flexibility-acceptance-20261022.md`：实际处理结果，以最新记录为准；本页不代表恢复已批准或执行。
