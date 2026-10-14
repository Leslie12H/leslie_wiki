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

- [2026-10-14 朱炜退回质检员的只读取证](/Users/leslie/Documents/Playground/output/sandeval-three-feedback-20261014/zhu-return-why.md)：临科 02 张舒新批次的轮次、历史退回目标、真实朱炜资格通过及父级选择不匹配。当前任务状态、人员与部署会变化，重新操作前回查原生服务和数据。此次仅定位根因，没有修改退回链或生产数据。
- 源码指针：quality/application/resolution/manual_return_service.py::_return 的 parent_refs / candidate.target_ref.object_id 校验，以及 ReviewService.validate_plan、ReinspectionAuthorizationService。这个前置解析问题与来源权限读取/异常重试修复分别评估，不能用另一个 PR 的绿 Gate 当已经修复退回链。
