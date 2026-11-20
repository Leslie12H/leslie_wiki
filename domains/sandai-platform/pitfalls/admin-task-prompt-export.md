---
name: sandai-admin-task-prompt-export
type: pitfall
created: 2026-11-20
updated: 2026-11-20
tags: [sandai, api-platform, admin, generation, export]
links: [sandai-api-platform-development-entrypoints]
---

# 管理台批量导出原始任务 Prompt

## 为什么

2026-11-20 在美国生产管理台核验。任务 CSV 由任务元数据组成，表头没有 `prompt`。任务视频视图的响应带 `prompt`，抽检显示它将较长文本截为 240 字符。任务详情的内容接口对同一任务返回更长的原始 `prompt`，另有独立的 `enhancedPrompt` 和 `firstFramePrompt`。

## 如何核验

1. 从[管理台任务管理](https://zeus-admin.sandaii.cn/tasks)核对环境及组织，固定创建时间上界。通过 `GET /admin/api/v1/sites/{site}/tasks` 的游标取得任务 ID 全集，按任务 ID 核对组织归属和去重。全部删除状态用 `deleted=all`。服务端拒绝日期筛选时核对返回码并补查对应时段。
2. 通过同环境的 `GET /admin/api/v1/sites/{site}/tasks/{taskId}/content` 读取原始 `prompt`。逐项校验返回任务 ID，检查 `truncated` 与文本长度，区分源字段为空和读取失败。大批次使用限速、断点和失败重读。
3. 按任务 ID 对账后再输出单列纯文本。保留重复内容和多行文本，按用户要求处理空值。对疑似截断先核对来源长度。业务数据留在授权交付位置，知识库只保留入口。

相关入口见[开放平台研发入口](../refs/development-entrypoints.md)。
