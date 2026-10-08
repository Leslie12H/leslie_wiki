---
name: sandeval-self-review-stage-identity
type: pitfall
created: 2026-10-08
updated: 2026-10-08
tags: [sand-eval, quality, authorization, acceptance]
links: [sandeval-return-route-and-handoff-hints]
---

# Sand 质检待验收与自验身份

**Why:** 2026-10-08 排查冷垠君无法验收时，同一批次的供应商质检人和 Sand 质检人显示在相邻列，“待验收”下的人名容易被误读成验收负责人。质检通过只说明报告完成，不能推断报告执行人有权限验收。

**How to apply:** 从链接里的 `line`、`review` 和正式报告 `stage / assignee_id` 识别关卡，再核对账号当前能力和空间事实。区分供应商质检人、Sand 质检人、Sand 负责人复核人；同时检查验收资格与独立复核限制。列表固定提示不能替代真实身份核对。

## 角色与流程名称

“Sand 负责人”是复核流程的称呼，不是独立可指派的系统角色。`RoleService.role_for` 根据根空间事实返回 `sand_staff`，这也不是角色表中可分配的岗位；Sand 复核关卡 `sand_review` 校验根空间资格和复核权限，不要求另行任命“Sand 负责人”。最后仍须核对独立复核限制。代码指针：`app/services/facts/roles.py`、`quality/application/reviewer_service.py::_require_qualified`；每次使用核对运行版本。

## 当前规则的核验指针

- Sand 质检允许已分配的有效外部账号，Sand 负责人复核仍要求根空间资格；以运行版本的 `quality/application/reviewer_service.py::ReviewerService.validate_candidates`、`quality/infrastructure/client/reviewer_client.py` 和宿主 `RoleService.batch_get_account_capabilities` 为准。
- 验收命令另外检查原质检 `assignee_id` 是否等于验收账号，见 `quality/application/inspection/lead_review_service.py::LeadReviewService.accept`。赋予复核资格不能解除本人自验限制。
- `/quality/inspection?line=sand_qc` 的已提交报告是查看内容的入口。负责人批次验收按钮由 `frontend/src/pages/quality/management/BatchReviewTable.tsx` 渲染，以后端 `LeaderQueryService._detail_batches` 的 `available_actions` 为准。
- `inspector_list_policy.py::inspector_list_actions` 对待负责人验收使用固定提示；不能只凭该提示判断当前浏览器身份。

上述代码路径相对 `sand-eval/platform/backend/`（前端路径除外）；每次使用重新核对当前部署。

个案证据、运行版本、独立只读复核与观察边界见 [2026-10-08 核查报告](/Users/leslie/Documents/Playground/output/sandeval-acceptance-20261008/report.md)。账号权限和批次状态会变化，仅保存证据指针，不作为实时状态来源。未修改生产权限、未代验收。
