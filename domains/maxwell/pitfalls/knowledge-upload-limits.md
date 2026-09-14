---
name: maxwell-knowledge-upload-limits
type: pitfall
created: 2026-09-14
updated: 2026-09-14
tags: [maxwell, knowledge, upload, huma, studio]
links: [maxwell]
---

# 知识库大文件上传：请求体与分块容量

**Why:** 2026-09-14 在 Maxwell main 基线 `eb238e44` 复现：知识库导入和切分预览未声明专用请求体容量，沿用 Huma 的默认限制；Studio 文本文件同时发送原文与 Base64，使传输内容进一步膨胀。文件体积、JSON 请求体大小和分块数量是不同限制，不能只放大其中一个。

**How to apply:** 按下列入口核对当前代码，再用超过旧限制的真实请求验证导入、预览、原文件回读和重切；验证超限拒绝和授权仍有效。前端大小提示与后端实际限制要同步，错误提示应保留服务端调整参数的建议。分块上限要在生成期间生效，拒绝整个操作，不能静默导入前半份文档。

压缩文档还需在解压、解析期间控制膨胀，不能等提取完成后才检查长度。PDF 主解析器、兼容回退和 DOCX 必须传递同类超限错误，不能把超限误当成格式不支持而继续回退；按行分块要按需读取，避免限量前先分配全部行。

## 当前代码和验收指针

仓库：`~/Downloads/sandai-code/maxwell-ai`。2026-09-14 修复工作树：`/private/tmp/maxwell-knowledge-upload-20260914`，分支 `codex/knowledge-upload-limits-20260914`。修复交付见 [PR #295](https://github.com/world-sim-dev/maxwell-ai/pull/295)；评审、CI、合并状态以该 PR 为准。用户明确要求仅合并、不部署，线上状态需单独核验。

- HTTP 导入与预览容量：`services/agent-server/internal/modules/studio/knowledge/transport/http/routes.go` 的 `knowledgeContentOperation`；权限预读：`internal/app/api/http/business_access.go` 的 `requestScopeValue`。
- 原文件字节上限：`knowledge/application/content_limits.go`；切分数量和有界生成：`knowledge/application/service.go` 的 `chunkContent` 及策略函数；原文件/Asset 生命周期：`knowledge/application/source_service.go`。
- 解压和提取预算：`knowledge/application/extraction_limits.go`；PDF 解析器补丁来源与升级要求：`services/agent-server/third_party/pdf/README.md`。本地替换模块需要同时核对 `go.mod` 和 Dockerfile 的模块缓存构建阶段。
- 前端读取与单份 payload：`apps/studio/src/middlewares/knowledge/importFile.ts`；页面读取状态：同目录 `ManagementPage.tsx`；错误原因保留：`apps/studio/src/api/client.ts`。
- 当前用户限制和操作说明：`apps/studio/src/pages/docs/content/agent/knowledge.md`。数字会变，以代码和在线契约为准。
- HTTP 回归：`internal/app/api/http/knowledge_upload_test.go`；字节边界：`knowledge/application/content_limits_test.go`；分块上限及重切失败不覆盖旧数据：`knowledge/application/chunk_limits_test.go`。
- 前端回归：`apps/studio/src/middlewares/knowledge/importFile.test.ts`，在 Studio 目录用 `pnpm exec node --experimental-strip-types src/middlewares/knowledge/importFile.test.ts` 直接运行；`check-*.mjs` 只放静态工程检查。客户端必须从后端 OpenAPI 按现有 `pnpm --filter @maxwell/studio api:generate` 流程生成。

2026-09-14 本地核验通过：后端 HTTP/knowledge/humagin 全套、后端架构检查、Studio `check`（含 typecheck）。临时恢复旧路由配置时，文本、Base64、DOCX 的大文件回归均返回 413。线上代理限制和实际用户文件仍需部署后验收；本地通过不等于线上恢复。

## PR 检查中的基线漂移

2026-09-14 的 PR #295 在 main 并发推进后遇到 `Detect changed areas` 的 `fatal: bad object`。排查入口为 `.github/workflows/pr-checks.yml`：比较事件中的 base SHA、checkout 的 merge ref 父提交和浅克隆深度；业务检查尚未执行时，不应把它认定为上传回归失败。本次同步最新 main 到 PR 分支后，范围检测恢复通过。后续遇到同类错误先核对这些提交指针，不直接跳过 CI 或扩大部署范围。
