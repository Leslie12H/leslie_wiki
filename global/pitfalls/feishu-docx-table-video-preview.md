---
name: feishu-docx-table-video-preview
type: pitfall
created: 2026-11-20
updated: 2026-11-20
tags: [feishu, docx, video, attachments]
links: [feishu-sheet-header-and-merge-sync, sandai-api-platform-playground-success-video-unavailable]
---

# 飞书文档表格中的内嵌视频回填

**Why**　2026-11-20 在已有文档的表格单元格中，用 lark-cli 1.0.66 执行带本地文件路径的 XML 插入。回执为 `partial_success`，降级码 `2127`。飞书保存了预览容器，容器内没有视频资源。期间表格序号也被编辑过，目标列的空段落 block ID 保持有效。

**How to apply**

1. 用 `docs +fetch --detail full` 定位文档、表格、目标列和空段落 block ID。用该锚点对应给定用例，写前重读目标单元格。
2. 用 `docs +media-insert --type file --file-view preview --file ./clip.mp4` 上传本地 MP4，保存返回的外层 block ID。具体参数以当前 CLI 的 `--help` 为准。
3. 用 `docs +update --command block_move_after`，将外层预览块移动到目标空段落后面。上传后读取新的 revision；写后确认同一外层 ID 位于目标单元格，含 `Preview`、MP4 文件名、媒体 token 和预期字节数。回读后再计入完成。
4. 出现部分成功或回执丢失时，先检查文末与目标单元格里的实际块。只清理本次产生且已确认没有资源的空壳。发现已上传的预览块时沿其 ID 续办，以免重复上传。

## 追加用例到已有表格

先读取表格和当前文档 revision。对表格块调用 Docx 批量更新接口，在 `insert_table_row` 中传 `row_index: -1`。批量更新的每个请求体只允许同一 block ID 出现一次。追加多行时逐次提交，每次读回新行数与 revision 后再继续。 [飞书批量更新块](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/batch_update)

2026-11-20 的回读中，每个新单元格都含默认空段落。可以按新段落 ID 批量填写序号和提示词，并保留成片列的空段落供后续移动预览块。比较追加前已有行的 XML，可核对旧内容及已有成片。
