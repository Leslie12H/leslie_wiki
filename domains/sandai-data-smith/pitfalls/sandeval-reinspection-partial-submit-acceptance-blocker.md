---
name: sandeval-reinspection-partial-submit-acceptance-blocker
type: pitfall
created: 2026-10-09
updated: 2026-10-09
tags: [sand-eval, quality-center, reinspection, acceptance, recovery, autocommit]
links: [sandeval-roles-and-workflow, sandeval-repeated-correction-ancestor-blocker, sandeval-direct-return-interrupted-by-leader]
---

# 复验部分提交导致待验收被自己的退回单阻断

**Why:** 质检报告通过、样本封存、整改执行接续和正式提交回执是不同的持久化事实。普通工作单元使用 autocommit 时，报告已经落库后，整改进度 CAS 失败会留下“报告通过但整改未接续”；只按报告判定的列表可显示待验收与按钮。负责人命令找不到整改执行的后继组，就会回落到普通汇总，被尚未闭环的子退回单阻断。不能根据待验收、1/1合格或某一步通过认定整条整改提交成功。

**How to apply:** 先区分供应商负责人真人退回、系统代委派与 Sand 直退标注员路线；固定质量任务、scope、报告组、真实质检员和负责人账号。核对报告 submitted_at、样本封存、提交成功回执、resolution_execution 的 execution_followup_group_id、实际报告提交身份及 verification_submission_id。用同一部署的只读 check_blockers 与普通 aggregation 门禁、真实负责人列表 DTO 对照，不调用实际 accept/recover 试探。capture 能写出后继关联不等于历史关联已保存；背景恢复计数增加也不等于补链。恢复空关联应依真实冻结授权与完整报告幂等补登记，保留父子退回历史并继续正式负责人复验；产品资格投影和命令需统一。事发 409 的响应长度及源码仅能支持具体 CAS 错误的推断，未取得正文时必须标注该边界。

- 2026-10-09 姚夏舟第1批次的只读取证、准确身份、部署对照、提交409、报告与题目已封存、提交回执缺失、列表与命令资格矛盾、capture无写替身及恢复缺口，见[排查报告](/Users/leslie/Documents/Playground/sandeval-acceptance-blocker-20261009/report.md)。实时对象、报告编号和生产状态从该目录 probe.py / final_readback.py 重新读取；本次没有执行修复或生产业务写入。
- 源码入口：quality/application/inspection/review_service.py 的 _change / submit；resolution/resolution_service.py 的 capture / prepare_lead_verification / _reconcile；management/leader_query_service.py 的 _detail_batches；management/aggregation_service.py 的 _unblocked；infrastructure/persistence/resolution_execution_repository.py 的 update；infrastructure/persistence/unit_of_work.py。
