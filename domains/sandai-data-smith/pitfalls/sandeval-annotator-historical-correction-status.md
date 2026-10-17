---
name: sandeval-annotator-historical-correction-status
type: pitfall
created: 2026-10-17
updated: 2026-10-17
tags: [sand-eval, annotation, correction, quality, note]
links: [sandeval-manual-return-passed-status-handoff-gap]
---

# 标注员历史整改通过与当前 Sand 退回分属不同责任链

**Why:** 标注员个人整改记录只回答本人接收的答案整改是否闭环。后续 Sand 将同批次退给供应商负责人时，接收人和处置链不同，旧的个人整改通过不能证明本次 Sand 退回已处理。页面未标明通过所属关卡和历史轮次时，容易让人把局部历史结果理解为当前批次总状态。这里与[人工退回后通过状态阻断重检](sandeval-manual-return-passed-status-handoff-gap.md)是不同机制，不能直接套用恢复方案。

**How to apply:** 先固定来源任务和批次 scope，再核对个人列表实际绑定的 disposition、stage、recipient、resolved 时间及当前 Sand 退回的子处置、执行、送审版本和复验任务。用标注员本人原生查询和负责人原生流水独立回读；流水中旧空间闭环与较新的 Sand 退回应分别解释。逐题备注、浏览器草稿与整批退回原因也必须分别核验，直接退回不能被当作逐题草稿保存动作。

## 核验入口

- [2026-10-17 单批只读报告](/Users/leslie/Documents/Playground/output/weixiangran-return-20261017/report.txt)：保存生产版本、两次回读时间、范围、旧空间闭环和当前 Sand 退回状态。具体账号、状态和运行版本会变化，重新处理前沿报告指针读取当前事实。
- 同目录 `evidence.json` 保存本批送审/检查/处置/逐题记录，`native.json` 保存第二 Pod 以两名实际账号身份读取的个人整改与完整流水；未实施业务代码或生产数据修复。
- 源码入口：`AnnotationBatchList.annotationBatchState`、`AnswerCorrectionService.annotation_page` 和 `DispositionRepository.annotation_page` 分别负责文案、本人整改投影与按接收人/annotator_batch 筛选。部署源码和对应 Git 提交的一致性核验留在 `evidence.json`。
- 保存入口：`ReviewWorkspace.returnBatch` 与整批退回弹窗。核对退回请求的独立 note 和当前逐题草稿是否实际提交；已保存逐题记录、处置 note 及浏览器暂存分别取证，不凭输入过文本推断服务器保存成功。
