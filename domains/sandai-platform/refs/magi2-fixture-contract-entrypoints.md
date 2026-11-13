---
name: sandai-platform-magi2-fixture-contract-entrypoints
type: reference
created: 2026-11-13
updated: 2026-11-13
tags: [sandai, api-platform, magi2, testing, fixtures, contracts]
links: [sandai-platform-magi2-multimodal-api-test-entrypoints, sandai-api-platform-development-entrypoints, sandai-api-platform-performance-testing-entrypoints]
---

# Magi2 素材契约与冻结配对查证入口

**Why:** 2026-11-13 为压测准备不依赖生产账号的图片、提示词与图文配对时，发现公开网页、在线 schema 和后端解析实现需要交叉核对。把文档缺项当作能力禁用、把 URL 导入限制套到上传素材，或把本地提示词分层写成官方上限，会使正常样本和容量结论偏离实际请求。图片可读取、素材上传成功、请求确实消费了正确配对及业务完成也各需证据。

- 本轮完整说明在 API 工作区 `/Users/leslie/Documents/ChatGPT/Apipltform/docs/magi2-fixture-api-design-20261113.md`。公开网页 HTML/正文、在线 schema 原件和带采集时间的回执在同工作区 `.local/magi2-fixtures-20261113/`，其中 `api-contract.md` 保存核查范围与源码基线。规格值、当前动态模型、价格、组织、资产 ID 和最终素材数量不复制到知识库。
- 当前公开源为[国内 API 参考](https://platform.sandai.cn/docs/api-reference/)、[海外 API 参考](https://platform.sand.ai/docs/api-reference/)、[国内 schema](https://api.sandai.cn/openapi.json)及[海外 schema](https://api.sand.ai/openapi.json)。按地区同时读取网页与 JSON，记录时间和差异；上传 MIME 与国内 watermark 的本轮差异沿上述报告回查，不能只凭其中一份自动生成请求或宣告契约一致。
- 图片路径沿 Zeus `PlatformAssetController`、`AssetService`、`ImageHelper`、`ImageAssetImporter`、`PublicImageDownloader` 核对。multipart 上传的文件与整体请求预算分别检查并保留封装余量；上传后 assetId 与 URL 导入的像素校验入口不同，不能把 URL 专属限制误写成通用上传限制。精确路径、大小和尺寸规则沿本轮报告及当前源码读取。
- 提示词与首帧字段沿 `GenerationRequestDeserializer`、`OpenApiGenerationService` 回查，区域水印沿 `OpenApiWatermarkConfig`、`OpenApiWatermarkPolicy` 回查。本轮没有找到公开 prompt 字符上限；本地长短档位与防误输入的客户端上限属于负载设计，不能冒称官方限制，也不能由未公布上限推出无限长度可用。组织归属、ID 无损处理和模型动态权限另验。
- 实现与执行入口沿 [压测准备入口](performance-testing-entrypoints.md) 和工作区 `postman/load/magi2/README.md` 回查。本文只记录契约核查方法，不代替主实现记录或断言逐图配对已被运行器消费；配置、测试、上线、真实吞吐和扣退账务分别报告。

**How to apply:** 先冻结当前地区、协议、部署与模型证据，再按真实编码字节、解码格式和尺寸检查素材。把每个 image、对应 prompt、内容 hash 与 source 一起纳入冻结清单，保留本地文件到获准上传后区域/组织资产的映射；只校验 manifest 自报值不够。配对冻结后，以实际出站 payload 或本地替身回执证明运行器消费了正确图片和文字。先做纯本地准备，组织未指定时保留未知；正式请求另需本轮身份、额度、预算及执行授权。2026-11-13 本次仅公开读取、源码核查与本地报告，未上传、生成或发压，不能据此声称业务容量或素材效果已验收。
