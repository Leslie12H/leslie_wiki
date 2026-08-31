---
name: test-center-v2-run-detail-perf
type: project
created: 2026-07-02
updated: 2026-07-02
tags: [vidmuse, admin, test-center-v2, performance]
links: [vidmuse-admin, vidmuse-admin-harness, test-center-v2-mcp-direct-tool-call]
---

# Test Center V2 run detail 接口性能优化

目标:把 run/job detail 类接口从 30s+ 降到可接受(目标 P95 < 3s)。
边界:前后端都可改(用户已确认)。执行:sonnet 子 agent 按本计划分阶段做。

## 关键澄清(用户已确认)

- **慢的是单个 run detail 页面本身**,前端路由 `/playground/test-center/runs/{run_id}`(run_id 形如 `runv2_...`),不是 job 聚合接口。
  - 复现 URL 示例:`https://dev-vidmuse-admin.sandaii.cn/playground/test-center/runs/runv2_168b04d4ef87`
- **新假设**:单个 `/runs/{id}` 代码路径只 ~1-2s,但 detail 页面很可能**串行打多个 run 接口**——`/runs/{id}` + `/runs/{id}/artifact`(5-10s)+ `/runs/{id}/quality-inspection`(3-8s)+ `/runs/{id}/trace`——叠加到 30s+。
- 因此瓶颈聚焦 **`/runs/{id}/*` 四个接口 + 它们调用的 quality_bridge 函数**;job overview/quality-summary 降优先级。
- (早期误判:曾以为慢的是 job 聚合接口,已被用户复现 URL 推翻。)

## 证据(2026-07-02 代码扫描,file:line)

后端:`~/Downloads/sandai-code/vidmuse-admin/`

- 路由:`apps/admin/controller/admin/test_center_v2.py`
  - `/runs/{id}` L1061 · `/runs/{id}/artifact` L1066 · `/runs/{id}/quality-inspection` L1071 · `/runs/{id}/trace` L1101
  - `/jobs/{id}/overview` L922 · `/jobs/{id}/quality-summary` L931 · `/jobs/{id}/runs` L1009
- service:`apps/admin/service/test_center_v2/benchmark_service.py`
  - `get_run_detail` L1646 · `get_job_overview` L1328 · 未分页 `limit(1000)` L1333-1337 / L1402-1406
  - `_run_thread_id_lookup` L198-233 —— 每个 run 13 个 JSON_EXTRACT,fallback 强制加载全量 artifact_json+trace_json
  - 已有 in-memory enrichment cache(仅 terminal run,512 LRU)L1538-1556
- `apps/admin/service/test_center_v2/quality_bridge.py`
  - `quality_scores_for_runs` L3522 · `enrich_artifact_with_quality_scores` L3702 · `quality_inspection_for_run` L3554(单 run 5-6 次查询,L3607 重复查 RunV2)
- 模型:`apps/admin/database/model/test_center_v2.py`
  - `run_v2` L308(artifact_json/trace_json/asset_resolution_snapshot_json 为 `JSON` 列)· 已有 idx_run_v2_job* 索引
  - legacy `test_score` 表被逐 run 查询,索引存疑

### 确认 vs 假设

- **确认**(代码可读):接口清单、缺分页、JSON 列类型、thread_id JSON 提取路径、逐 run 扫 TestScore。
- **假设**(未实测):blob 实际大小、TestScore 索引质量、各接口真实耗时。→ 由 Phase 0 证实。

## 实测瓶颈表(2026-07-02 dev 环境真实测量)

dev token 直接打 `/admin/api/v1/test/v2/*`,curl `-w` 计时,多轮采样:

| 观测 | 数据 | 结论 |
|---|---|---|
| **每请求固定地板** | `runs?limit=1`(575B)= **1.1–1.8s** | 🔴 与 payload 无关的 ~1s+ 固定开销 |
| running run detail(~2KB) | 1.4–1.9s | 数据小仍慢 → 印证地板 |
| `runs/{id}`(463KB) | 3.1–3.8s,TTFB~2s | 大 payload 有影响但非主因 |
| `runs/{id}/artifact`(161KB) | 3.3–3.9s | 同上 |
| `quality-inspection` 轻 run(550B) | 2.0s | 🔴 550字节要 2s = 纯服务端查询 |
| `quality-inspection` 重 run(110KB,rebuilt) | **5.3s** | rebuilt-artifacts 路径是第二坑 |
| `trace`(659B) | 1.6–3.7s | 小数据,慢在地板 |
| 网络 conn | 全部 ~0.2s | **网络不是瓶颈** |

### 三个硬结论(推翻早期"大 JSON"假设)

1. **主因 = 每请求 ~1s+ 固定开销**(575字节接口也 1.1s+,TTFB≈total,网络仅 0.2s)。乘以页面每次调用 → 最大杠杆。疑似 auth 中间件/project scoping/DB 连接池/session 创建每请求重复跑。**待 Phase 0 在中间件层计时证实。**
2. **30s+ = 固定开销 × 串行调用次数**,不是单接口。run detail 页面串行打 4+ 接口。
3. `quality-inspection` 的 rebuilt-artifacts(5.3s)是第二坑;大 artifact 反序列化非主因。

> 复现:`curl -H "Authorization: Bearer <dev-token>" https://dev-vidmuse-admin.sandaii.cn/admin/api/v1/test/v2/runs/{id}`
> 样本 run:轻=`runv2_dc2fbc78b63d`(running),重 quality=`runv2_f615e083ca6a`,大 artifact=`runv2_168b04d4ef87`。

### 优化优先级(按实测收益重排)

1. 消除/降低每请求固定开销(auth/scoping/连接池)—— 影响所有接口,最高收益
2. 前端并行化 run detail 页面的多接口调用(Promise.all)
3. `quality_inspection_for_run` 去重复查询 + rebuilt-artifacts 按需
4. 大列按需加载

## 分阶段计划

### Phase 0 — 先量,不改(必须最先做)
- [ ] 确认 UI 慢页面实际调用的接口(看 `playground/src/pages/test-center-v2/` 的 API 调用)。
- [ ] 在 4 个可疑接口加轻量计时日志(每个主要 DB 查询/enrichment 段落 log 耗时 + 命中的 run 数)。
- [ ] 用一个真实的大 job(run 数多的)复现,记录:哪段耗时最大、run 数、artifact_json 实际大小。
- [ ] **交付:一张"实测瓶颈表"**,据此决定后续阶段优先级。此前不改业务逻辑。
- 验证:能明确指出"30s 里 X 秒花在 Y"。

### Phase 1 — 安全高确定性优化(不动 schema)
- [ ] `_run_thread_id_lookup` fallback 不再对全部 run 加载 artifact_json+trace_json;仅对主查询未命中的 run 补,且分批。
- [ ] job overview/quality-summary 的 `limit(1000)` 改为真正分页(默认页 + max),或按需只在展开时加载重列。
- [ ] `quality_inspection_for_run` 去掉 L3607 对 RunV2 的重复查询,复用已加载对象。
- [ ] enrichment cache 扩展到 job 聚合结果(带 job updated_at/run count 作为 key 失效)。
- 验证:同一个大 job,目标接口从 30s+ 降到个位数秒;harness/现有测试不回归。

### Phase 2 — 需 schema/迁移(视 Phase 0 结果决定是否做)
- [ ] 把 thread_id / case name 等高频字段从 artifact_json 反规范化成 run_v2 独立列(带回填迁移),避免 JSON 提取。
- [ ] 给 legacy `test_score` 按 (run_id, scorer_id) 补索引(若 Phase 0 证实这里慢)。
- [ ] 大 JSON 列评估 `JSON` → 压缩存储 / 拆表 / 按需字段投影。
- 验证:JSON 提取从热路径消失;迁移可回滚。

### Phase 3 — 前端配合(边界已放开)
- [ ] run detail 页面改为分步加载:先出摘要/指标,artifact/trace/quality 懒加载或按 tab 拉取。
- [ ] job overview 大列表虚拟化 / 分页,不一次要 1000 run。
- 验证:首屏可交互时间显著下降,即使后端仍在补算。

## 执行约束(给 sonnet)

- 先做 Phase 0,产出瓶颈表,**不要跳过测量直接改**。
- 每阶段独立、可回滚;在分支上做,**不 commit/push,不改数据库**除非明确到 Phase 2 且用户批准迁移。
- 保持现有 harness 可用(`make harness-*`),改完跑一遍。
- 遵守仓库既有风格(FastAPI + SQLAlchemy),不引新依赖。
- 每段改动追溯到瓶颈表里的具体项;不做证据之外的"顺手优化"。
