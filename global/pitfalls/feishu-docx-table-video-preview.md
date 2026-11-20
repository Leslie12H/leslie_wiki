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
