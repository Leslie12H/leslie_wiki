---
name: sandeval-correction-defer-reinspection
type: pitfall
created: 2026-10-14
updated: 2026-10-14
tags: [sand-eval, annotation, correction, defer, reinspection, css]
links: [sandeval-caption-refine-skip-defer-handoff, sandeval-caption-review-scroll]
---

# 整改待定必须贯穿读取、送审范围与复验抽样

**Why:** 首次标注和整改共用单题工作页，但整改曾关闭视频吸顶并排除待定入口。单纯开放按钮会遇到已交卷写入栅栏、已完成答案的待定限制，以及把待定当作来源不完整的整改读取。2026-10-14 用户确认整改待定按首次标注规则排除本次复验，其余题目可继续提交；这项确认不授权删除历史答案、质检判断或部署。

**How to apply:** 按下面的代码指针核查整条链路：本人有效整改单授权 → 保存完整草稿及幂等回执 → 在保留历史正式答案的同时投影待定 → 由服务端计算精确的当前复验范围 → 冻结排除依据，仅重新验证尚未发布的新增待定状态 → 映射及抽样时排除待定份次。不得把待定冒充已更新或质检通过，不允许借此漏交其他有效答案；全部待定不创建空复验。测试应实际创建下一轮检查，核对其工作项，而不只断言页面按钮可点击。

实现与验收指针：[PR #2439](https://github.com/world-sim-dev/sandai-data-smith/pull/2439)。当前 Gate、冲突、测试发布和生产发布状态以 PR 与对应工作流为准，不把此页当作上线证据。

- 草稿、服务端写权限：`platform/backend/app/api/annotation_write_gate.py`、`app/services/facts/local_answer_commit.py`。已交卷答案必须仍属于当前用户可处理的有效整改。
- 读取与精确版本提交是不同契约：`app/domain/annotation_quality.py`、`app/services/facts/task_assignments.py`、`qc_verdict.py`。整改读取可返回待定及其历史答案，精确版本解析仍拒绝待定送审。新增整改状态不能顺带改变普通答案结果的序列化契约。
- 清单、冻结和复验：`quality/application/resolution/answer_correction_service.py`、`management/submission_service.py`、`management/reinspection_service.py`、`reinspection_sampling.py`。原不合格样本原则上必须复验，只有服务端冻结的有效待定排除依据才能例外；已发布前置版本中的历史排除可继承，本轮新增排除须重新核验。
- 真实双栏与吸顶：`frontend/src/pages/myTasks/annotationWorkbench.css`、`components/questionTypes/shared/useResizableQuestionFace.tsx`。应按实际容器是否仍为双栏核验，不用视口断点关闭仍在双栏中的视频吸顶；滚动到页面底部也必须保持视频可见。
- 回归与内置角色文档：`backend/tests/quality/application/resolution/test_answer_correction_service.py`、`frontend/src/pages/myTasks/MyCorrectionPage.test.tsx`、`QuestionWorkPage.workflow.test.tsx`、`backend/app/usage_docs/content/annotator/start-and-finish.md`。

本地真实组件配合合成素材的浏览器截图归档于 `/Users/leslie/Documents/Playground/annotation-sticky-defer-20261014/`；它验证布局和交互，不代替已部署测试平台或生产业务验收。测试分支发生与本任务无关的冲突时，不将测试历史合进开发分支；可在干净任务分支独立运行仅测试的完整 Gate，冲突仍由对应负责人处理。

## Review 的历史排除与摘要核查

**Why:** 已发布版本的排除依据属于冻结历史，不能把它等同于本轮尚未发布的待定状态；排除后新复验成员也不再与旧完整批次一一对应。

**How to apply:** 多轮整改时，从身份、版本及策略声明均兼容的已正式送审直接前置版本识别历史排除；累计排除须保留它们，只重新读取本轮新增待定题的当前状态和持有人。前置有效成员减去新增排除应恰好等于本轮成员，不能借历史继承漏交有效题。恢复或转派上轮待定题后，剩余题仍应可以再次整改。列表在待复验和已完成状态按当轮冻结的实际送审范围比较正式版本，同时保留原授权范围；缺失未排除成员、重复结果或空间不匹配仍应显示未知进度。重点入口为 `SubmissionService.prepare_correction/freeze` 和 `AnswerCorrectionService.annotation_page`。

2026-10-14 review 证据：PR #2439 的 `ca969cf43`，复现脚本及输出位于 `/Users/leslie/Documents/Playground/annotation-sticky-defer-20261014/review/`。检查涵盖正常关闭、多次退回、历史排除项恢复及待复验/已完成摘要。具体发现和后续修复状态以 review 记录与 PR 为准，此次 review 未修改业务代码、未访问生产。

2026-10-14 修复与回归指针：[最终提交 60305ca75](https://github.com/world-sim-dev/sandai-data-smith/commit/60305ca7510f9c5de8ade7cfca04fbd80f483092)、[完整 Gate](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/38534096535)。回归覆盖历史待定保持、恢复及转派后再次复验，以及两个冻结终态的有效范围进度和异常成员。具体通过、冲突或发布状态以 PR 与工作流为准。
