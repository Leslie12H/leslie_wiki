---
name: sandai-admin-task-prompt-export
type: pitfall
created: 2026-11-20
updated: 2026-11-21
tags: [sandai, api-platform, admin, generation, export]
links: [sandai-api-platform-development-entrypoints]
---

# 管理台批量导出原始任务 Prompt 与参考素材

## 为什么

2026-11-20 在美国生产管理台核验。任务 CSV 由任务元数据组成，表头没有 `prompt`。任务视频视图的响应带 `prompt`，抽检显示它将较长文本截为 240 字符。任务详情的内容接口对同一任务返回更长的原始 `prompt`，另有独立的 `enhancedPrompt` 和 `firstFramePrompt`。

## 如何核验

1. 从[管理台任务管理](https://zeus-admin.sandaii.cn/tasks)核对环境及组织，固定创建时间上界。通过 `GET /admin/api/v1/sites/{site}/tasks` 的游标取得任务 ID 全集，按任务 ID 核对组织归属和去重。全部删除状态用 `deleted=all`。服务端拒绝日期筛选时核对返回码并补查对应时段。
2. 通过同环境的 `GET /admin/api/v1/sites/{site}/tasks/{taskId}/content` 读取原始 `prompt`。逐项校验返回任务 ID，检查 `truncated` 与文本长度，区分源字段为空和读取失败。大批次使用限速、断点和失败重读。
3. 按任务 ID 对账后再输出单列纯文本。保留重复内容和多行文本，按用户要求处理空值。对疑似截断先核对来源长度。业务数据留在授权交付位置，知识库只保留入口。

相关入口见[开放平台研发入口](../refs/development-entrypoints.md)。

## 2026-11-21 原始参考素材核对

后台模型显示名随当前配置解析，历史任务可能返回空值。按冻结的组织任务清单统计时，用已查证的内部模型标识与对外模型名共同校对，保留各标识的计数。运行任务类型也可能覆盖多种输入模式。区分纯文本与图片或其他参考输入时，读取详情的 `inputs`，核对素材类型、角色、顺序和 `assetId`。

详情返回的素材下载链接有 `expiresAt`，整批签发后再下载容易过期。下载前分批刷新，按原任务、素材 ID、类型和顺序核对；保留文件哈希和字节数供去重与回查。将原件存入指定云空间时，用回执中的稳定文件链接回填表格并逐行读回。知识库只记录方法和入口。
