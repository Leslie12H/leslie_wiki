---
name: sandeval-two-stage-sampling-scope
type: pitfall
created: 2026-10-15
updated: 2026-10-16
tags: [sandeval, quality, sampling, inspection]
links: [sandeval-cross-workbench-question-order, sandeval-reinspection-sampling-lineage]
---

# 两级抽检范围与题号变化分别核验

**Why:** 供应商质检、Sand 抽检和退回后的重新抽样可能采用同一完整标注批次的不同子集。用户描述“质检完全没见过这道题”时，既可能是真正未入样，也可能把当前复验链接、上游真正退回题及页面题号混为一谈。统一题序不能建立两级样本的包含关系。

**How to apply:** 先以 `work_unit_id`、作者和冻结送审成员绑定同题，再分别列出供应商首轮、Sand、供应商复验的持久化检查项集合；对照正式提交时间和有效判断，区分未入样、已判合格、整批退回后的重检与当前链接锚定题。页面“已检”只证明系统记录，不能据此推断实际观看行为或人的记忆。两级样本关系必须和业务裁决核对，不可仅凭最大题号或当前队列位置推断漏检。

## 权威规则与代码入口

- 规则归 `sand-eval/knowledge/DECISIONS.md` 中 2026-09-03 的 Sand 抽样母集裁决：允许包含供应商未质检对象。是否改为仅抽已检题属于业务规则变化，不能作为顺序修复静默实施。实时规则及后续变更应回读原文件。
- 候选入口：`quality/application/management/assignment_service.py`；查看 Sand 的 `sand_batch` / `vendor_package` 如何展开完整冻结子批次，再交给 `quality/domain/management/sampling.py`。不同关卡的候选身份、分组、种子与最终成员集合分别核对；不要由“按比例抽样”推断是对界面排序取前 N 项，也不要由规则允许分层推断所有配置入口已实现。
- 题序入口：`quality/application/question_order.py`、`quality/application/inspection/review_query_service.py::queue_page`。题号保留与样本集合是两个事实；历史队列位置还须和原标注题号区分。背景见 [跨工作台题序](sandeval-cross-workbench-question-order.md)。
- 退回与复验：沿处置的 `source_review_task_id`、委派子处置、`previous_task_id` 和冻结来源对照；整批重检会包含 Sand 未抽中的题，当前 URL 锚点不必就是上游不合格题。跨轮必检与有效结论见 [复验抽样谱系](../refs/sandeval-reinspection-sampling-lineage.md)。

## 2026-10-15 单案验证指针

[岳黎明 / 冯杰批次核验报告](/Users/leslie/Documents/Playground/output/yueliming-sampling-20261015/report.md) 保存完整批次计数、三轮题号映射、真正 Sand 退回题与用户链接题的区别、运行提交/镜像、数据库只读保护和源码哈希核验。原始范围、提交与逐题判断见同目录 `production.json`；集合差异见 `scope-comparison.json`。实时状态须重新查询，不从此知识页推断。

本次仅只读取证并给出业务边界，没有改变抽样、判断或生产部署。


## 2026-10-16 单题抽样显示原第 2 题

**Why:** “只有题目二，没有题目一”还可能是抽检只选中原第 2 题、界面继续保留原题号。不能用最大题号推断当前应检总数，也不能把质检员姓名当成答案作者。

**How to apply:** 以冻结 `plan.assignments` 确认应检集合，用 `plan.question_order` 对齐原题号，再对照实际 `batch_allocation.sample_rate` / `plan.execution.sample_rate` 和最少抽样数；默认 `policy_snapshot` 不一定等于本批执行比例。核对首轮、复验和 `previous_task_id` 后再提供当前待办入口。

[王文轩 Sand 抽检核查记录](/Users/leslie/Documents/Playground/output/wangwenxuan-inspection-20261016/report.txt) 保存两题的冻结身份、两级实际比例、原题号映射、原轮停止和新轮派回的查询证据。原始证据为同目录 `production.json`、`detail.json`、`detail-independent.json`，运行源码与生产不可变提交对照见 `source-verification.json`。两台 Pod 独立只读结果一致；页面跳到登录页后，自动审批拒绝飞书登录，未宣称已完成登录后的浏览器复现。实时比例、状态和待办入口须回读线上，不从本页推断。

本次仅只读取证，没有修改生产数据、抽样规则、答案、判断或部署。
