---
name: sandeval-frozen-batch-return-after-duplicate-defer
type: pitfall
created: 2026-10-27
updated: 2026-10-27
tags: [sand-eval, quality, batch-return, deferred, duplicate-cleanup]
links: [sandeval-caption-refine-skip-defer-handoff, sandeval-remediation-frozen-overlap-same-scope-version]
---

# 重复题清理后的历史质检批次退回范围

**Why:** 整批退回使用历史送审冻结成员，接收人查询却要求这些成员全部属于当前有效应交范围。送审后若重复题清理写入与最新答案绑定的有效待定回执，当前范围会排除此题，历史批次仍可读但退回可能报“整改工作项已不属于当前任务范围”。不能由此推断答案丢失、持有人转移或标注员刚刚操作待定。

**How to apply:** 从QT/RT/RI定位冻结submission成员，比较当前完整范围与差集；逐项读持有人、duplicate标记、待定回执context及最新response。待定须绑定当前持有人和最新答案才生效。比较送审时间与有效回执时间，区分普通标注待定与operator_duplicate_defer_v1清理。仅在只读会话调用接收人查询复现，不执行整批退回。修复需要衔接有证据的范围收缩并验证后续整改提交/复验，保留原历史、待定与范围保护。

2026-10-27 单案的准确ID、生产SHA、两副本取证、时间线与原生409复现见[只读诊断报告](/Users/leslie/Documents/Playground/output/qc-return-scope-20261027/report.md)及同目录原始JSON。回执operator字符串不独立证明具体人的身份或原始授权；本次仅诊断，未改代码或生产数据。运行状态使用前重新读取。

代码指针：`sand-eval/platform/backend/quality/application/resolution/manual_return_service.py` 的冻结批次成员与接收人查询；`app/services/facts/task_assignments.py::_annotation_correction_context` 的当前范围包含校验，以及 `_quality_context_from_facts` 的待定排除；`app/repositories/answer_card_deferred.py` 的有效待定身份绑定。路径与实现使用前重查。


## 2026-10-27 明确授权后的单案恢复

**Why:** 原生整改读取与回交已支持待定排除，但退回前的接收人查询仍要求原冻结成员全部属于当前有效范围；仅证明持有人未变不足以恢复，必须证明差集只来自精确有效的清理回执。

**How to apply:** 使用默认只读的 `app.cli.deferred_batch_return_recovery` 核对原检查版本、完整冻结清单与答案、题集、唯一持有人和唯一清理待定差集，冻结计划哈希。人明确授权后显式apply，先存完整before-image和恢复审计，再在独立进程限定接收人查询例外，调用原生带版本、幂等和终止历史的退回；不修改历史清单、答案或待定。另一个副本以真实接收人权限读detail/workspace/manifest/preview并对账全部答案及冻结成员，不替本人提交整改。当前生产状态、哈希、处置ID、14个保护测试及全部验收见[恢复与根因报告](/Users/leslie/Documents/Playground/output/qc-return-scope-20261027/report.md)。工具代码见[测试PR #2912](https://github.com/world-sim-dev/sandai-data-smith/pull/2912)，PR/Gate与生产单案结果分别核验；此次未部署通用平台修复。

去重见证的两卡虽引用同一视频，其Caption来源、baseline与正文不同；这只能确认素材相同，不能自行裁定答案任务重复。原清理脚本与需求未找到时，保留该不确定性，也不由operator标签推断具体执行人。普通待定入口对已送审批次的原生保护及本次operator回执时间线见报告；后续清理应在写入前核查冻结质检范围，并把同视频去重与任务语义去重分开确认。


## 2026-10-27 通用修复与复发边界

**Why:** “仍属于原任务义务”与“本轮可交质检/复验”使用不同范围。待定应从后者排除，但它不能单独让原冻结批次失去可退回接收人。仅做单案恢复并不修复其他批次的通用入口。

**How to apply:** 来源服务的 `annotation_correction_recipient` 使用包含待定成员的原任务义务，再校验真实账号、任务状态、题集、正常卡身份与唯一当前持有人；该内部选项不能扩展到普通送审或整改发布。后两者继续排除有效待定，全待定不能创建空复验；真正越界、缺卡、重复卡、多个持有人和无权限仍应阻断。实现与10个回归场景见[通用修复PR #2914](https://github.com/world-sim-dev/sandai-data-smith/pull/2914)；完整Gate、只读候选重放、同次清理的存量核查范围及发布状态见[通用修复证据](/Users/leslie/Documents/Playground/output/qc-return-scope-20261027/general-fix.md)。使用前重读PR和生产部署，完整Gate通过或单案已恢复均不代表通用代码已上线。

代码指针：`app/services/facts/task_assignments.py` 的 `_quality_context`、`_quality_context_from_facts`、`_annotation_correction_context` 与 `annotation_correction_recipient`。题集/持有人等判断继续沿原来源事实，不增加运维标签白名单，也不删除待定或改写冻结历史。
