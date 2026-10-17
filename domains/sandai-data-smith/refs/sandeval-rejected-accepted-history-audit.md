---
name: sandeval-rejected-accepted-history-audit
type: reference
created: 2026-10-17
updated: 2026-10-17
tags: [sandeval, quality, acceptance, audit, hologres]
links: [sandeval-qc-reject-threshold-not-enforced, hologres-replica-sync-lag-20261013]
---

# Sand 不合格题目随批次验收通过的当前核验

**Why:** 逐题不合格、整份质检报告通过、负责人验收和写入下游成果表是不同事实。仅从 passed 标签或历史 rejected 记录汇总，容易把未验收、后来改判、同题多轮复验或外部交付混为同一数量。本地默认环境也可能仍指向旧 Hologres 实例。

**How to apply:** 核验生产版本与实际实例，在 Leader 以只读连接查询。将已封存 Sand 不合格明细通过精确送审成员与冻结 review_bundle 关联正式 sand_review 通过报告；独立按 question_id、work_unit_id、response_id 和批次去重，再从 ev3_response 回读原答案与归属。历史验收事件、当前有效复验结论和下游落库凭证分别报告。用户明确要求排除历史整改时，仅纳入当前正式送审、当前质检轮次仍不合格且当前批次已验收的题目；已被新轮次取代、正在复验或整改后通过的旧不合格不计入。没有交付凭证不能宣布外部成果表没有数据。

## 证据指针

- [2026-10-17 历史只读审计报告](/Users/leslie/Documents/Playground/sandeval-qc-audit-20261017/report.md)：保存本次历史/当前口径的区别、当前送审及复验排除、人工/自动验收拆分、逐题明细、批次汇总、独立 SQL 与作答回读。数值是当次快照，以后回答应重新查询。
- 规则核查：`sand-eval/platform/backend/quality/domain/inspection/review_rules.py::calculate_result` 与 `quality/application/inspection/lead_review_service.py::accept`；版本证据随审计保存。代码变化后须重新确认，不能把本次运行事实永久当作产品契约。
- [质检阈值与报告结果的边界](../pitfalls/sandeval-qc-reject-threshold-not-enforced.md)：复用分层口径，不直接重释存量阈值。
- [副本同步延迟取证](hologres-replica-sync-lag-20261013.md)：核验当前实例和计算组；旧实例数据单独隔离，不进入生产总数。
