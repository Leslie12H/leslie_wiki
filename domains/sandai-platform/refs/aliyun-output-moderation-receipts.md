---
name: sandai-api-platform-aliyun-output-moderation-receipts
type: reference
created: 2026-11-19
updated: 2026-11-19
tags: [sandai, api-platform, athena, moderation, aliyun]
links: [sandai-api-platform-development-entrypoints]
---

# 阿里云成片审核明细查证入口

**Why:** 平台记录的成片拒绝说明审核阶段的终态。定位具体规则和画面时，需要继续对齐供应商审核记录。Athena 的阿里云适配器将中高风险归一化为拒绝，业务日志常仅显示总体结果。

**How to apply:** 从国内生产 Admin 任务确认组织、退款原因和审核状态。沿上海 SLS 的平台任务号查 Athena Job，再沿该 Job 的输出审核回调核对 DataId。进入阿里云内容安全控制台的机器审核增强版、视频审核、结果查询，按 DataId 和请求时间找到唯一记录。核对 TaskId、Service、整体风险、画面标签数量和语音风险，再打开音画结果定位抽帧时间、标签和分值。成片、输入素材与提示词各有审核阶段，按同一条回调绑定记录。抽帧显示的分值按供应商原值报告，是否误判需要结合命中画面人工复核。

- 官方入口见[视频审核增强版控制台指南](https://help.aliyun.com/zh/document_detail/2505811.html)。结果保留期限与截帧临时链接期限各查当前文档。
- [Athena 阿里云结果归一化](https://github.com/world-sim-dev/athena-admin/blob/1fbfab7a8972faa04dc68772d2777f377440ff49/ApiService/clients/green.py#L115-L149)和[审核数据结构](https://github.com/world-sim-dev/athena-admin/blob/f238f05c6676b7ce94af61bf81a95d3742acf378/ApiService/models/moderation.py#L33-L48)为源码查证入口。
- 2026-11-19 单任务回查的原始证据指针为工作区 `.local/task-872169152892613/` 的 `aliyun-console-summary.json`、`aliyun-flagged-frame.json`、`aliyun-frame-detail.txt`。任务对应关系、具体标签和时间点保存在该审计目录。
