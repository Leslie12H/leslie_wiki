---
name: sandai-api-platform-upload-preparation-recovery
type: pitfall
created: 2026-11-14
updated: 2026-11-14
tags: [sandai, api-platform, performance, assets, cleanup, permissions]
links: [sandai-api-platform-load-generator-readiness, sandai-api-platform-performance-testing-entrypoints]
---

# 上传失败回执、真实资产与暂存清理分别核验

**Why:** 上传接口可能先落正式资产，再做审核；503 或审核供应商错误不能证明没有创建。上传 finally 中暂存清理失败也可能只写警告，不影响一次成功上传返回。2026-11-14 的双区准备遇到这两类情况；盲目重传会重复创建，只有 soft delete 或停止客户端也不能证明暂存对象已回收。

**How to apply:** 每次 POST 先持久记录区域、组织、Key 指纹、图片 SHA 和意图，再保存真实 Request ID、资产回执和同组织 GET 验证。失败时停新增，按 Request ID 查真实日志/资产/审核状态，Trace ID 单独关联，先消除未知受理再决定后续。每个成功种子只从完成验证的回执绑定，不将审核 ERROR 当作 PASS。

暂存清理按本批 Request ID 关联精确对象 key，冻结清单；对已结束请求的暂存对象做 HEAD、原生 DeleteObject、HEAD 读回。403 要核对实际 RAM 主体、桶和前缀权限；不能从上传成功推断删除有权限，不能从生命周期配置不可读推断会自动到期。只按冻结对象清单处理，正式输入/结果、暂存对象、财务和审计的处置分别验收。

## 查证入口

- 本轮最终核验、当前阻塞、真实来源及正式步骤：工作区 `docs/production-load-final-readiness-20261114.md`。计数、部署和当前状态会变，按该文档指向的现场证据重读。
- 素材准备与离线绑定：`postman/load/magi2/prepare-assets.mjs`、`asset-mappings.mjs` 及测试。绑定须同时校验计划 SHA、组织/Key、图片 SHA、原始成功回执和 GET 验证；不完整映射保持启动阻塞。
- 已使用 Key、赠金和资产意味着清理范围已进入带业务阶段；空 fixture canary 不能代替带业务验收。实际能力边界沿 `postman/load/magi2/provision/CLEANUP.md`。
- 真实遥测将本批之外统一为保护 cohort 时，可能包含历史测试。长时间非终态记录不等于 GPU 正在执行；需核实归属、派发、公开状态与结算，不能为了开跑静默排除。

## 2026-11-14 多媒体入口、配置来源和准备恢复

**Why:** 同一个图片素材经旧 multipart 与新 reference raw 入口，上传预览审核和输入资格可能不同。源码中的配置值也可能因启动参数覆盖配置来源而没有生效。把固定错误文案当实际阈值，或把原始输入可引用写成审核通过，都会误判准备结果。

**How to apply:** 按当前区域部署核对启动参数、实际装载的配置源、框架默认值与 Controller/Service 链路。错误响应只留脱敏代码、允许公开的固定文案、正文 hash 和 Request ID；错误可能携带 `asset_id` 或 `assetId`，只能作为待核实线索。按失败阶段、准确组织和时间做独立只读对账，不能从已删除 Pod 的日志无匹配推断未创建资产。

旧上传成功回执和原计划原样保留。需要改协议时，显式冻结新计划与旧计划/账本/对账证明的 hash；已成功资产只承接，不重新上传，不把承接记录伪装成新成功 POST。缺失或不确定的副作用必须先消除，不能加通用强制重试开关。

原始输入资格、上传预览可见性、后续任务审核分别核验。GET 200 但 URL 为空不能记为已下载校验；若原生输入合同允许该状态，需用同组织 GET 和受限后台只读对象字节/hash证明闭合，不修改审核状态。时长字段为 0 时保留原值和 unknown 含义，按当前版本的输入合同与固定素材全解码证据判断，不伪造时长。

- 实现、当前准备进度与部署证据：API 工作区 `docs/magi2-multimodal-live-preparation-20261114.md`、`postman/load/magi2/prepare-multimodal-assets.mjs`，私有回执入口 `.local/magi2-multimodal-live-20261114/`。
- 原生合同查证：目标部署对应的 `ReferenceAssetUpload`、`ReferenceMediaImporter`、`AssetService.checkGenerationInput`、`GenerationMedia.checkExisting` 和 `MagiGenerationAdmission`；不能把准备工具的历史保守规则误写为服务端要求。
- 低 QPS 短档同时核对协议 × 素材大小 × 语言的分布；总协议占比均衡仍可能因组织轮转相位而把某一大小层偏向一套接口。相位修正只作用于对应数据集，保留其他案例的既有语义，并验证少量前缀和完整组织轮次。
- 发压器接入按组织固定完整多媒体引用、prompt hash 与 API 归属。准备上传字节、生成 JSON 正文字节和服务端读取字节分开统计；准备成功不自动开启生成准入标记或启动用户尚未指定的档位。
