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

**How to apply:** 按下面的代码指针核查整条链路：本人有效整改单授权 → 保存完整草稿及幂等回执 → 在保留历史正式答案的同时投影待定 → 由服务端计算精确的当前复验范围 → 冻结排除依据并重新验证状态 → 映射及抽样时排除待定份次。不得把待定冒充已更新或质检通过，不允许借此漏交其他有效答案；全部待定不创建空复验。测试应实际创建下一轮检查，核对其工作项，而不只断言页面按钮可点击。

实现与验收指针：[PR #2439](https://github.com/world-sim-dev/sandai-data-smith/pull/2439)。当前 Gate、冲突、测试发布和生产发布状态以 PR 与对应工作流为准，不把此页当作上线证据。

- 草稿、服务端写权限：`platform/backend/app/api/annotation_write_gate.py`、`app/services/facts/local_answer_commit.py`。已交卷答案必须仍属于当前用户可处理的有效整改。
- 读取与精确版本提交是不同契约：`app/domain/annotation_quality.py`、`app/services/facts/task_assignments.py`、`qc_verdict.py`。整改读取可返回待定及其历史答案，精确版本解析仍拒绝待定送审。新增整改状态不能顺带改变普通答案结果的序列化契约。
- 清单、冻结和复验：`quality/application/resolution/answer_correction_service.py`、`management/submission_service.py`、`management/reinspection_service.py`、`reinspection_sampling.py`。原不合格样本原则上必须复验，只有本次服务端冻结且重新核验过的待定排除依据才能例外。
- 真实双栏与吸顶：`frontend/src/pages/myTasks/annotationWorkbench.css`、`components/questionTypes/shared/useResizableQuestionFace.tsx`。应按实际容器是否仍为双栏核验，不用视口断点关闭仍在双栏中的视频吸顶；滚动到页面底部也必须保持视频可见。
- 回归与内置角色文档：`backend/tests/quality/application/resolution/test_answer_correction_service.py`、`frontend/src/pages/myTasks/MyCorrectionPage.test.tsx`、`QuestionWorkPage.workflow.test.tsx`、`backend/app/usage_docs/content/annotator/start-and-finish.md`。

本地真实组件配合合成素材的浏览器截图归档于 `/Users/leslie/Documents/Playground/annotation-sticky-defer-20261014/`；它验证布局和交互，不代替已部署测试平台或生产业务验收。测试分支发生与本任务无关的冲突时，不将测试历史合进开发分支；可在干净任务分支独立运行仅测试的完整 Gate，冲突仍由对应负责人处理。
