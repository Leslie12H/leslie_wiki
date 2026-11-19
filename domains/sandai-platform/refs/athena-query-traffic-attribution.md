---
name: sandai-api-platform-athena-query-traffic-attribution
type: reference
created: 2026-11-19
updated: 2026-11-19
tags: [sandai, athena, zeus, observability, polling]
links: [sandai-api-platform-development-entrypoints, sandai-api-platform-openapi-quota-entrypoints]
---

# Athena Job 查询 QPS 溯源

**Why**　2026-11-19 上海 Athena Job 查询出现阶跃。Athena 按 job_id 的 GET 是一次下游访问计数，单个客户端可周期性重复查同一 Job，包括已经跑完推理的历史 Job。该指标与 Zeus 的任务数、查询请求数和 Dispatcher 按 requestId 恢复查询各自有独立口径。

**How to apply**

1. 在上海 SLS 的 `inference-prod` 验证 Athena `http.access` 的 method、完整 path、user_agent 和 api_key_fingerprint。指纹来自 X-API-Key 的 SHA-256 截断值。输出短指纹用于区分来源，通过可信项目元数据或入口转发日志识别归属。remote_addr 记录连接对端，多类客户端可共用同一对端。
2. 核对 Logstore 全文索引与分析索引。内容可以用全文搜索而无法在 SQL 中直接引用时，用已验证的全文条件缩小到指定指纹、UA 和路由样本，再按时间桶聚合。落结论前抽查峰值起点和持续期的实际 path、状态及指纹。
3. 定点复查多个 Job 的 GET 时间差，和 Athena worker 的推理结束记录、持久化终态分别关联。核对是否为周期扫描、重复扫描或正常单任务轮询。用已部署版本的 Zeus 状态查询源和发布回执验证是否转发 Athena，按 job_id 和 by-request 路由分别统计。
4. 本次证据见工作区 `.local/athena-query-qps-20261119/` 的 `time-buckets.json`、`verified-fingerprint.json` 和 `repeats.json`。实际流量、连接对端、凭据归属与客户端策略每次回源确认。
