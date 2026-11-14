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
