---
name: sandeval-manual-return-ancestor-misclassification
type: pitfall
created: 2026-10-14
updated: 2026-10-14
tags: [sand-eval, quality-center, manual-return, lineage]
links: [quality-allocation-blocked-status, sandeval-repeated-correction-ancestor-blocker]
---

# 整批退回把历史祖先误当直接前置

**Why:** 一轮重检的 disposition_refs 可以携带完整历史授权，不等于每条处置都直接针对 previous_task_id。存在一条仍在 processing 的历史 manual_return 时，若命令一律要求其目标等于当前直接前一轮，就会拒绝合法的跨多轮退回。“没有唯一的整批退回前置”也可表示前置身份不匹配，不能只按字面推断有多条父级或当天退回次数超限。

**How to apply:** 先固定 current review、attempt、previous_task_id、冻结计划和实际部署源码，再逐条关联处置的类型、状态、版本、目标与创建者。独立用真实非 root 身份核验 assert_returnable，将资格通过与后面的父级选择分开。修复应按同任务、同批次及连续轮次解析历史祖先，保留授权和责任链；不能把全部历史引用当直接前置或删历史处置来绕过检查。只读诊断不得调用真实 return / restart / recover。

- [2026-10-14 朱炜退回质检员的只读取证](/Users/leslie/Documents/Playground/output/sandeval-three-feedback-20261014/zhu-return-why.md)：临科 02 张舒新批次的轮次、历史退回目标、真实朱炜资格通过及父级选择不匹配。当前任务状态、人员与部署会变化，重新操作前回查原生服务和数据。该报告对应初次只读诊断；后续实现和验证见下方修复指针，生产恢复需独立核验。
- 源码指针：quality/application/resolution/manual_return_service.py::_return 的 parent_refs / candidate.target_ref.object_id 校验，以及 ReviewService.validate_plan、ReinspectionAuthorizationService。这个前置解析问题与来源权限读取/异常重试修复分别评估，不能用另一个 PR 的绿 Gate 当已经修复退回链。

- [历史退回与连续重检验收修复 PR #2438](https://github.com/world-sim-dev/sandai-data-smith/pull/2438)：区分直接前置与完整历史，原始冻结依据仍拥有各自的责任关闭路径；后续重检必须同送审、同质检员、规则一致、轮次连续且有真实退回事实，才能承接已封存答案整改与当前验收。完整回归应覆盖退回、重检和最终验收，不能只验按钮不再报错。当前 CI、合并和部署状态回查 PR；[修复及验证记录](/Users/leslie/Documents/Playground/output/sandeval-three-feedback-20261014/zhu-return-fix.md)。

- [2026-10-14 同一 PR 的验收中断 review](/Users/leslie/Documents/Playground/output/sandeval-three-feedback-20261014/zhu-return-review.md)：普通质量写入是 autocommit，完整退回/重检/验收成功不代表部分提交后可恢复。历史责任从直接 parent 改为完整继承时，必须同步验收重放：覆盖新退回已关闭而旧退回未关闭、以及负责人退回都已关闭但历史标注 closure 尚未提交的边界；不能只跑正常一次完成和重复点击。具体复现、审查 head 与后续修复状态回查记录及 PR，review 没有修改业务代码。
