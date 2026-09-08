---
name: suno-media-urls-mcp-regression
type: reference
created: 2026-09-08
updated: 2026-09-08
tags: [vidmuse, suno, mcp, download, regression]
links: [test-center-v2-mcp-direct-tool-call]
---

# Suno media_urls 下载回归入口

**Why:** Suno 页面解析、HTTP 下载成功、音频可解码是三个独立验收层。不要把工具返回 save_path 或 HTTP 200 当作音频可用证据。

**How to apply:** 用同一首歌的分享链接、歌曲链接、音频直链三路对照，查询当前 Case/Run/Trace，再验证保存文件的实际格式。历史线上失败需要 PROD trace 关联，DEV 结果不能代替线上根因证据。

## 持久化入口

- DEV Test Center Cases 搜索标签 `suno-media-urls-20260908` 或 `Nfi8IHKR8VeDpi60`。
- 分享 Case `casev2_e7e9eeafa68f`；歌曲 Case `casev2_d91e81f374be`；音频 Case `casev2_c8dda3f99f76`。
- 首次 DEV 执行：`jobv2_1f234d526526`、`jobv2_f458271d568f`、`jobv2_89e9d7862693`。状态与验收说明以在线记录为准。
- 本次抓取快照及 MCP evidence：`~/Downloads/sandai-code/vidmuse-admin/.codex-artifacts/suno-Nfi8IHKR8VeDpi60/`。
- Aion 代码指针：`apps/vidmcp/vidmcp_service/downloaders/suno_page_parser.py`、`suno_downloader.py`。核查目标歌曲的 `audio_url` 和 `media_urls` 选择逻辑，勿误选推荐歌曲。
- 本次样本暴露的验收问题：页面含 forbidden audio_url 和 media_urls；HTTP 200 的原始 M4A 文件 ffprobe 失败。编码原因、DEV 保存文件解码情况与 PROD 历史错误应另行验证，不由后缀推断。
