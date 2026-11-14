---
name: sandai-api-platform-media-functional-acceptance-entrypoints
type: reference
created: 2026-11-14
updated: 2026-11-14
tags: [sandai, api-platform, media, functional-testing, openapi]
links: [sandai-api-platform-v2-input-validation-entrypoints, sandai-api-platform-performance-testing-entrypoints]
---

# 开放平台多媒体功能验收入口

**Why:** 2026-11-14 用户要求为图片、音频和视频准备各格式及阈值素材，供功能验收。旧版上传和 Magi 多模态参考接入的文件限制、媒体类型和校验阶段存在差异。单个素材的结果需要落实到具体入口、协议版本和生成终态。

- 契约入口：[开放平台视频生成 API 参数说明](https://j0yswlgboxz.feishu.cn/wiki/BOG6wZQpjiQ9lJk0jf7c91LBnyl)、[公开上传参考](https://platform.sand.ai/docs/api-reference/#upload-an-asset)、Zeus `docs/openapi-v2-generations.md`。确认目标环境实际部署的路径、原生结构及 Ark 兼容状态。
- 源码查证：Zeus `PlatformAssetController`、`LegacyAssetUpload` 和 `FFmpegHelper` 对应通用素材上传；`ReferenceAssetController`、`ReferenceMedia`、`ReferenceMetadata`、`ImageAssetImporter`、`GenerationMedia` 对应参考上传和生成。若输入校验与部署链路有差异，记录接受或拒绝发生的阶段，并查询任务终态。
- [素材包与用例所在 Codex 对话](https://chatgpt.com/codex/threads/01a1d8d0-8c94-7523-95ea-8263a990e1d5)。本地交付目录为 `/Users/leslie/.codex/visualizations/2026/11/14/01a1d8d0-8c94-7523-95ea-8263a990e1d5/`。CSV 记录精确字节、解码结果、素材与用例映射和接口预期，ZIP 保留媒体实物。

**How to apply:** 对 multipart 完整请求固定 boundary、filename 和 MIME 以构造阈值上下各一字节的可重复请求。对原始二进制入口按实体字节构造合法媒体容器，验证可解码及独立的尺寸、时长、数量和累计时长。对延后预检通过的素材同时记录上传 ID、生成终态、结果规格与账务；离线解码仅作为素材证据。
