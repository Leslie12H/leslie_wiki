---
name: sandeval-transferred-legacy-batch-submit-qc-mismatch
type: pitfall
created: 2026-10-16
updated: 2026-10-16
tags: [sandeval, correction, reassignment, batch-key, handoff]
links: [sandeval-transferred-correction-task-visibility, sandeval-reassignment-scope-and-batch-responsibility]
---

# 转交整改后历史标注的普通提交入口误报

**Why:** 整改转交保留原工作项和历史 wave 成员，但个人批次按当前 assignee 连接 wave，可能回退成 `legacy:<current-account>`。普通送审服务另行投影真实的 `wave:<current-account>`；整改提交回执又保留原冻结范围键。三者只按 batch_key 对齐时，已成功交整改的卡仍显示“历史标注／待确认提交”，点击普通“提交质检”便报“标注批次不存在或已转派”。该提示不能证明数据再次转出，也不能证明此前提交复验失败。

**How to apply:** 先以 assignment、answer_card、当前 holder 和 disposition.recipient 证明身份，再同时核对个人列表键、普通送审范围键、整改正式回交及后继 review。把“保存答案”“提交整改”“普通提交质检”“派回复验”“质检正式通过”分别取证。不得通过改 URL、替换 batch_key 再交一遍或重派卡掩盖投影缺陷；修复须衔接同一工作项的当前批次、历史整改和已交状态，保留原作者及冻结谱系。

## 核验入口

[2026-10-16 柯衔只读核查](/Users/leslie/Documents/Playground/output/correction-two-errors-20261016/report.txt) 保存原转交链、当前卡身份、正式答案与整改提交、随后三次普通 submit-qc 404，以及真实后继复验任务。可变状态和具体 ID 只从报告及实时记录取得。

- `native.json`：当前账号身份调用现有只读服务，对比个人 legacy 批次、正式 wave 送审范围和整改工作台；没有重放写请求。
- `detail.json`、`independent-state.json`：同一冻结工作项、答案版本、整改提交及另一个 Pod 的当前复验状态。
- `request-summary.json`：普通 submit-qc 的错误与此前成功整改提交的时间关系；两者不是同一个动作。
- 代码入口为 `app/repositories/my_tasks.py::_personal_batch_members_sql`、`app/services/facts/my_tasks.py::_batch_key`、`app/services/facts/task_assignments.py::_submission_scopes_with_manifests` / `submit_annotation_batch_for_qc` 及 `frontend/src/pages/myTasks/AnnotationBatchList.tsx`。按报告中的部署 SHA 回读，不从本页推断当前代码是否已修复。

本次只读取证，未修改生产、提交或重派；后继复验 active 不代表复验已通过。


2026-10-16 长期修复指针：[PR #2510](https://github.com/world-sim-dev/sandai-data-smith/pull/2510)。个人批次沿同一工作项保留实际来源 wave；当前批次与历史整改的关联须验证完整且唯一的同一组答题卡，不能以部分重叠合并，也不能改写原冻结范围。PR、Gate 与生产部署分开核验，精确运行版本和原单只读验收留在[现场报告](/Users/leslie/Documents/Playground/output/correction-two-errors-20261016/report.txt)。


2026-10-16 部署后验收入口：[原单只读验收报告](/Users/leslie/Documents/Playground/output/correction-two-errors-20261016/postdeploy-report.txt)。报告独立保存 PR Gate、生产合并 SHA、全部副本、实际下发前端资源及多 Pod 原生查询；同时区分占用解除、列表状态、真实整包与正式提交，不能把源码或候选计算通过等同于业务交接完成。后续状态须实时读取。
