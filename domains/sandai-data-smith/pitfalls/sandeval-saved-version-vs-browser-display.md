---
name: sandeval-saved-version-vs-browser-display
type: pitfall
created: 2026-10-17
updated: 2026-10-17
tags: [sand-eval, inspection, amendment, browser, draft, evidence]
links: [sandeval-workbench-context-404-evidence, sandeval-correction-evidence-and-deferred-lineage]
---

# 已保存最新版与本人浏览器实际显示分开取证

**Why:** 质检页仍绑定原送审成员，同时通过本轮代改记录展示较新答案。只读到成员的原 `object_ref` 会误以为仍显示旧版；读到最新代改、执行回执和原生候选，也只能证明服务器当前有新版，不能否定本人界面显示旧内容。浏览器还包含当前视图、编辑器状态与本机草稿，这些必须直接观察。

**How to apply:** 固定 QT/RT/RI，经送审成员定位工作项，分别核验原作答人和检查员；对每个保存版本对齐来源答案、执行回执和代改事实。以实际检查员身份在 DML 拒绝保护下读取原生 item 和 answer-draft，比较 `member.content` 的实际版本、execution.fields、候选正文与来源字段哈希。再直接打开生产页面，核对实际登录身份、网络响应、原文/修订视图和草稿基线。代码存在本机草稿优先分支只构成候选，不能据此认定个案根因。先保留原草稿，不用清空浏览器数据作为诊断起点。

- 2026-10-17 李阳反馈的精确对象、跨 Pod 保存链、原生双接口正文比较、浏览器访问状态与未决事实：[只读取证报告](/Users/leslie/Documents/Playground/output/liyang-answer-version-20261017/report.md)。具体版本和当前状态会变，沿报告脚本重新核验；本页不保存“现时已恢复”结论。
- 源码指针：`AnswerAmendmentService.visible_amendment/display`、`ReviewQueryService.item_detail/items_page`、`ReviewService.answer_draft`、`StructuredAnswer.tsx` 的草稿载入和内容身份，以及 `caption_refine_v6/ui/Answering.tsx` 的原文/修订内容来源。按报告中的生产 SHA 读取。
- 浏览器新会话进入登录页时，先区分它与用户已经登录的内嵌浏览器或 Chrome 会话；不能把独立会话的登录状态当成用户页面状态。明确实际验收范围，不伪造账号会话，也不把原生服务读取或路由 mock 当作本人生产界面。
- 观察页带 `observe_account` 时，当前前端跳过本人浏览器草稿。用户说“应是某时刻修改的内容”，应补查该时刻之后的正式答案、来源回执、服务端候选和 `pending_write`，再区分服务器保存内容与本人原设备上的输入。质检输入当前走浏览器暂存，明确保存成功才产生来源答案与代改事实；这是实现边界，不能据此推定具体用户没有保存。本人浏览器与管理员观察页分别验收。
