---
name: sandeval-historical-correction-stale-base
type: pitfall
created: 2026-10-15
updated: 2026-10-15
tags: [sand-eval, correction, submission, lineage, handoff]
links: [sandeval-repeated-correction-ancestor-blocker, sandeval-correction-handoff-stale-response, sandeval-reassigned-answer-frozen-review-conflict]
---

# 历史整改转交后从旧送审基线重复生成版本

**Why:** 历史退回仍为处理中时，可以保留它自己的 rejected 执行和 followup group；同一真实批次的另一后续退回可能已产生更高送审版本并完成质检。旧单转交只改变当前接收人，不能证明其回交基线已经接到最新版本。工作台四题都已更新、显示可提交，仍可能在保存正式回交时触发 `SUBMISSION_SCOPE_EXISTS`。该通用提示出现在正确的整改入口，不应据此判断用户进错页面。

**How to apply:** 从精确整改单核对 target、handoff_history、全部本单执行和同 scope 的送审版本链；按本人身份读取 `resubmit_base_submission_id` 与 manifest，再检查失败命令 intent.prepared.submission 的直接前置、版本号和正式落库/执行登记。用原生 `check_revision` 只读重放，不为复现触发完整提交。区分本单最近失败轮次、另一子单的后续通过和原责任是否已关闭；答案准备度不代表正式版本链可接续。恢复应保留已保存答案及历史报告，核对下游后走受控接续/收尾；不能绕过唯一性门禁、覆盖旧版本或仅手动增加版本号。

- 2026-10-15 徐佳玉纸面 0923_04 实例的正式时间线、本人工作台、实际失败意图及生产只读校验：[现场报告](/Users/leslie/Documents/Playground/output/xujiayu-correction-20261015/report.md)。动态对象、SHA 和当时状态留在报告和证据目录；初始只读诊断后，经用户授权完成指定单恢复，见下方指针。
- 源码入口：`sand-eval/platform/backend/quality/application/resolution/resolution_scope_service.py::original_group_ids`、`answer_correction_service.py::prepare`、`quality/application/management/submission_service.py::check_revision`、`resolution/legacy_correction_snapshot.py::recover_snapshot`。复用前核对现场部署；旧快照孤儿恢复有严格身份与未使用条件，不可推定可接续已正式复验通过的其他提交。
- [整改转交后的授权失配](sandeval-repeated-correction-ancestor-blocker.md)是另一种阻断，不能因同一人员或相似页面直接套用旧单修复。

## 2026-10-15 指定单恢复

**Why:** 已被后续检查消费的正式送审不是孤儿快照，不能套用仅允许同作者、未消费直接后继的 legacy 恢复条件。历史冻结版本和原失败 intent 都是证据；直接覆盖它们会使旧轮判断失去依据。

**How to apply:** 经指定单恢复授权后，以本单专用 operator CLI 固定完整 before-image 与计划哈希，在任务占用和本人写入锁内重新检查来源当前答案、同批次连续送审链、全部后续报告继承、未结责任全集及原质检员资格。用单独不可变运维归档保存原始与恢复意图，原始 intent 不改；把同一已保存答案集合接到已核实的最新直接前置，再通过未修改的原生版本、范围、责任、许可、执行登记及自动派回复验流程提交。不能以重试名义替人作判断。复验完成前仍保留处理中责任；另一生产副本核对来源答案、全部历史报告/判断、下游验收、本人真实待办和无重复新任务，再确认运维占用已释放。

- [指定单恢复及独立验收报告](/Users/leslie/Documents/Playground/output/xujiayu-correction-20261015/data-repair-report.md)：包含用户授权、计划/归档、原生命令回执与本人待办证据。具体 ID、时间、SHA 与核验时状态只保存在报告；本次没有业务代码发布，不代表防复发修复已经实施。
- 归档序列化也属于执行链：在冻结运维操作前先将 datetime 等值规范化为可持久化 JSON。若归档前异常触发 needs_review，先证明原执行器退出、未产生业务写入及原计划未变，再用 owning recover 协议恢复原操作，不清理占用键或重新建操作。
