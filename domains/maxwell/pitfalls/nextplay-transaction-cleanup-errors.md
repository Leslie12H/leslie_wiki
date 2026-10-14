---
name: nextplay-transaction-cleanup-errors
type: pitfall
created: 2026-10-14
updated: 2026-10-14
tags: [maxwell, nextplay, mysql, retry, testing]
links: [evolve-original-evidence-and-report-recovery]
---

# 结果保存的断连错误不能被清理错误覆盖

**Why:** 数据库驱动在连接中断后可能先关闭 socket，再抛出原始错误；异常分支继续回滚会产生第二个错误。若清理错误覆盖原始错误，调用方基于错误类型的有界重试就无法触发。只让替身抛连接错误、但保留可用连接，会遗漏这一行为；真实 COMMIT 成功也不代表调用方收到回执。

**How to apply:**

- 事务失败后尽力回滚，保留原始异常与进程中断语义；不把所有清理错误统一归为可重试，也不自动重试 DDL。
- 验证库驱动实际关闭连接后的行为，再测试提交前断开和提交后回执丢失；核对保存的是同一份原件或评分，终态不能异文覆盖，Runner / Judge 不被重跑。
- 测试客户端连接真实关闭，而非只在仍可用的连接上抛异常。数据库版本、测试库隔离、失败证据、清理和真实模型验收分别记录。

实现指针：Nextplay `eval-service/src/eval_service/repository.py` 的 `_transaction`、`database.py` 的 `migrate_schema`，以及 `test_repository_transactions.py` / `test_repository_mysql_integration.py`。当前修复、回归与未完成验收只查 [2026-10-14 断连恢复记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-transaction-recovery-review-20261014.md)，不从此页推断代码已合并或部署。相邻原件与评分保存边界见 [原件恢复指针](../refs/evolve-original-evidence-and-report-recovery.md)。
