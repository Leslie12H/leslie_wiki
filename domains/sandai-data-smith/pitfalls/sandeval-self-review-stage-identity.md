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

## 先复现真实授权，再命名直接阻断点

**Why:** 验收命令先验证复核资格，之后才比较原质检人与验收人。两条规则同时不满足时，把自验限制直接当成首先发生的错误，会掩盖外部质检委派与复核授权的边界。

**How to apply:** 使用实际运行代码、真实账号和当前空间，只读调用报告读取、任务授权、`ReviewerService.validate_reviewer` 与负责人详情查询，记录每步错误码。禁止为了测试权限调用真实验收写命令。复现依赖注入时必须保持生产的外部委派连接，同时禁用缓存写入并拦截数据库写入；测试组合缺少委派连接产生的 404 不代表生产拒绝。

- 质检分配只授予个人 Sand 质检入口：核对 `RoleService.presentation_for`、`DelegatedSandQcAccess.has_assignment`、`TaskAssignmentService._quality_context`。2026-09-20 提交 `1cfe694320237a3b8aa890d13e4dd5d2e78704be` 的历史 diff 明确保留 Sand 复核的根空间条件；后续使用重新核对当前实现。
- 人工复核是否来自创建配置：比较上游主任务 `frozen_config.qc_config.values.sand_review_mode`、质量配置与报告冻结规则的 `quality_policy_json.sand_review.mode`，再查配置版本和创建/修改时间。转换入口为 `app/domain/dispatch_masters.py::QcConfiguration.policy_values`；不要把界面等待标签当作临时权限故障。
- 同日实际授权复现、任务冻结配置来源和直接阻断点见上述核查报告的“继续排查”段及其 `authorization.json` 指针。证明调用的是只读授权函数，不把检查结果写成真实验收命令回执。

## 恢复当前批次与选择后续流程

**Why:** 人工模式固定在已提交报告的快照中，修改主任务现在的配置不能补出历史验收报告；单纯放开按钮或重写状态会缺少真实复核依据。

**How to apply:** 当前人工批次先用另一名真实且具备实时资格的账号只读查询目标分配，核对该批次 `available_actions`、阻塞和当前报告版本，然后由该账号使用正常验收流程。只读预检不能算已完成验收；处理后读回正式复核报告、批次状态及推进结果。本案可执行人的预检仅保存于上述核查报告及 `remedy-preflight.json`，每次重新确认，不复制为实时人员名单。

- 新任务如果要求 Sand 质检完成后自动验收，查 `frontend/src/pages/dispatchMasters/MasterEditor.tsx` 的既有模式选择及 `api.ts::defaultQcValues`；当前默认和配置选项每次从代码核对。自动模式需复用正式系统报告和后续推进，指针为 `quality/application/inspection/automatic_review_service.py::execute / _unblocked`、`advancement_service.py::_attempt / _automatic`。
- 独立人工复核的工程建议是明确另一位合格复核人、在服务端校验任命，并把质检人、当前状态与待处理人分开呈现；建议尚未实施，不能当作现有契约。历史批量转换需要受控 operator 与审计，不覆盖已冻结依据。
- 自动复核的质量语义要结合 `quality/domain/inspection/review_rules.py::calculate_result`、完整报告及未结退回/召回等阻断核验。QC 报告通过不能单独证明零拒绝项，不能只依赖一个 `passed` 字段反推质量结论。
