---
name: sandeval-reassignment-scope-and-batch-responsibility
type: pitfall
created: 2026-10-15
updated: 2026-10-15
tags: [sand-eval, reassignment, batch, correction, handoff]
links: [sandeval-transferred-correction-task-visibility, sandeval-reassigned-answer-frozen-review-conflict]
---

# 转派范围与冻结批次整改责任的一致性

**Why:** 普通转派按工作项换当前持有人，而整批退回按不可变送审成员要求一个当前整改接收人；部分搬走已答卡后，来源答案与原作者仍正确，冻结范围却可能分散给多人。历史作者、当前持有人、当前整改责任人不能合成一个账号字段。若人员移出空间后仍遗留持卡，普通派题工具又可能拒绝原持卡人，导致“先统一再退回”在实际操作上没有可行入口。整批退回报错是保护，直接删除它会丢失明确责任。

**How to apply:** 先从 review/submission 精确读取全部冻结成员，以 producer_account_id 确认历史作者、当前 assignment 持有人确认责任分布，再读取逐卡 reassign 审计、当前空间/角色、答案全版本与未结处置。不能把 assignment.account_id 当成历史作者，也不能只按数量转回目标卡。只读预览失败就是未形成可执行计划，不得解释为已修复。恢复孤立卡不应通过临时授予无关空间权限绕过约束；需要受控回收协议确认目标资格、精确成员、版本、计划、实际操作者和非目标保全。

2026-10-15 截图单的原始只读范围与诊断：[证据清单](/Users/leslie/Documents/Playground/sandeval-split-holder-20261015/findings.json)。该文件反映最初诊断阶段，后续写入与验收以同目录 `restore-plan.json`、`restore-apply.json`、`verify.json` 和 `verification-summary.json` 为准，不能把最初“未写入”当作当前状态。

## 已确认的业务裁决（2026-10-15）

Leslie 明确选择：“退回时选一名接手人，整批责任和持卡一并转交”。因此，即使冻结批次在标注中途或送审后发生部分转派，退回仍应允许当前质检员选择一名本空间合格标注员，按冻结完整成员原位统一当前持卡及整改责任。历史作者、原答案版本、冻结送审成员和检查判断保留。不能静默任选一人，也不以禁止全部部分转派代替本裁决。

1. 选择候选人及预览版本由服务端解析；当前单一持有人有资格时可默认选中，分散持卡必须显式选人。
2. 接手资格按当前空间、账号启用及标注权限重新核验；来源持卡人已离开空间不能单独阻断受控回收，不临时为其补权限。
3. 只处理冻结完整题集，不接受客户端自选子集。旧页面、持有人或检查版本变化须拒绝并重新选择。
4. 所有相关原持有人及接手人保存使用共同 producer lease，转卡、终止检查、创建整改单和幂等回执同一连接显式事务提交；不能只提交转卡和意图，再在另一连接完成退回。Hologres 事务内另借连接读取已锁表可能阻塞，应在原连接完成固定事实检查。
5. 历史被评价主体仍是原作者，当前整改接收人才是接手人；页面要分别显示。旧接口的普通中断恢复能力与新选人路径的原子提交分别验证。

此前提出“冻结后普通转派一律阻止分散责任”仅是备选建议，未被采纳为本次规则。未答余量筛选、浏览器草稿交接、移出空间前清单仍需独立业务需求，不属于本次修复范围。

## 单案恢复与实现指针（2026-10-15）

- 当前截图单使用冻结 before-image 与 SHA256 计划，通过原生持卡移动能力恢复精确两张孤立卡；独立 Pod 读回确认完整10张由原标注员持有，原响应及字段、送审、检查、处置及非目标派题保留，原生质检员接收人校验通过。没有代替质检员点击整批退回或创建新处置。后续状态只从上述回执和当前线上读回判断。
- 长期实现与验证看 [测试 PR #2482](https://github.com/world-sim-dev/sandai-data-smith/pull/2482) 及其最新提交 Gate；PR、Gate 和实际部署分别核验，不能互相代替。测试分支若存在跨域冲突，不把测试历史并入任务分支。
- 浏览器验收用当前分支真实列表/接手人组件，内存 API 隔离生产；截图与验收记录在 [交互验收目录](/Users/leslie/Documents/Playground/sandeval-split-holder-20261015/browser-plan.md)。页面成功仅代表内存交互，不能证明生产退回。

## 复核代码入口

- `app/services/facts/task_assignments.py`：_annotation_correction_context / _build_distribution_preview / _limited_movable / _plan_hash。
- `app/repositories/task_assignments.py`：allocation_snapshot / apply_distribution / transfer_correction_cards；普通选择范围与质量责任守卫分别核验。
- `quality/application/management/work_handoff_service.py`、`app/services/facts/work_handoff.py`、质量 router 与 WorkHandoffModal：核对当前可达交接入口及适用状态。
- `frontend/src/pages/quality/inspection/ReviewWorkspace.tsx`：弹窗接收人若仍用 producer_name，展示的是历史作者，须与真实接收人事实区分。
- 相邻已知问题：[转派后整改可见性](sandeval-transferred-correction-task-visibility.md)、[转派后冻结版本冲突](sandeval-reassigned-answer-frozen-review-conflict.md)。实现和部署会变，复用前按准确 SHA 阅读。
