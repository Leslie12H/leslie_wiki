---
name: isolated-model-media-delivery
type: pitfall
created: 2026-11-04
updated: 2026-11-04
tags: [maxwell, runtime, media, configuration, diagnosis]
links: [evolve-source-copy-read-coverage]
---

# 隔离环境图片读取成功仍可能无法交给远端模型

**Why:** Sandbox 的图片工具读取、资源托管、签名链接生成和供应商下载是不同环节。本机可读取的 loopback 地址不能交给远端供应商；供应商的下载失败还可能被网关包装为 HTTP 503，不能只看状态码就归因服务额度或模型能力。2026-11-04 的真实失败在最终 runtime.failed 的 modelCalls 中保留了下载文件失败与 invalid_value，主日志只显示服务暂不可用。

**How to apply:** 先保留原 Run、每次失败和缺失账目；从终态原始错误核对原因，再对齐实际签发地址与运行配置。若复用既有 dev 资产交付服务，必须核对同一资产的业务/Thread、存储与数据库归属，并将地址和签名配置作为一组核对，不能只替换 hostname。配置值只在进程内读取，不输出密钥或签名URL；记录原配置私有回滚副本和既有临时链接需重签的影响。使用标准入口同步 API 与唯一 Worker，核对实际双 poller。公开交付下载的完整 SHA 相同只证明文件可达，还需要原模型请求完成证明模型实际消费；恢复不能覆盖此前失败或冒充业务质量提升。

## 证据与代码指针

- `services/agent-server/internal/app/integration/runtime/assetmedia/resolver.go`：ResourceLink 在模型边界托管并签发。
- `services/agent-server/internal/modules/studio/asset/application/service.go`：签发与核验；实际配置以当前环境为准。
- 集成工作区 `.tmp/c15-autonomous-repair-20261104/media-delivery-config-proof.json`、`media-delivery-config-change.json`、`media-public-delivery-proof.json`：2026-11-04 同一原件与配置差异的脱敏证据。
- 最终恢复与质量状态：`output/evolve-unified-20261019/flexibility-acceptance-20261022.md`，不能以本页替代运行结果。
