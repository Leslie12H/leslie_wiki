---
name: 2026-06-vidmuse-admin-knowledge-map
type: project
created: 2026-07-02
updated: 2026-07-02
tags: [vidmuse, admin, knowledge-map, june-2026]
links: [vidmuse-admin, vidmuse-aion, vidmuse-zeus, test-center-v2-mcp-direct-tool-call, vidmcp-auth-runtime-context, cdn-user-generated-images-video-cdn]
---

# 2026-06 Vidmuse Admin 知识地图

这页是 2026-06 期间在对话和开发工作中反复出现的 **vidmuse-admin** 主题索引。它不是完整 Vidmuse 业务百科;它的作用是让新 session 知道过去一个月 admin 子系统里哪些主题已经被探索过,下次遇到时从哪里接着查。

## 已确认且应优先沉淀的 admin 主题

### Test Center V2

- Test Center V2 在 `vidmuse-admin` 中是核心管理与评测工作台,前端在 `playground/src/pages/test-center-v2/`,后端在 `apps/admin/service/test_center_v2/` 与 `apps/admin/controller/admin/test_center_v2.py`。
- `mcp_tool_call` 是 Test Center V2 的一个 executor,用于直接调用 VidMCP 工具。细节见 [test-center-v2-mcp-direct-tool-call](test-center-v2-mcp-direct-tool-call.md)。
- MCP tool form 在 2026-06-25 附近做过重构:全局工具 catalog、text model 支持、JSON Schema normalization、string-list 默认值 bug 修复。
- Studio/Lite/Custom model preset selector 与 create-thread/profile UI 曾发生部署/接口可用性排查。

### VidMCP / Auth / Runtime Context in Admin

- Admin 调 VidMCP 是从 admin service 发起,不是从 thread container 发起。
- `MCP_URL`、`AION_MANAGER_JWT`、`X-Auth-Thread-Id` / `X-Auth-User-Id` / `X-Auth-Project-Id` 是排查 direct MCP call 的关键点。
- 详细坑位见 [vidmcp-auth-runtime-context](../pitfalls/vidmcp-auth-runtime-context.md)。

### CDN / Media URL in Admin Artifacts

- Test Center V2 的 MCP 结果需要把工具返回的本地 `/work/...` 路径转为浏览器可访问 URL。
- `aion-user-base/assets/images/` 下的 user-generated images 要走 video CDN,不是 image CDN。
- 详细坑位见 [cdn-user-generated-images-video-cdn](../pitfalls/cdn-user-generated-images-video-cdn.md)。

### Analytics / Repair / Quality via Admin

- 2026-06 中旬通过 admin 相关分析/修复入口排查过耗时分析 vs 实验分析统计差异,重点包括 daily rollup 边界、漏斗数据路径、render completion repair、credits 口径。
- 2026-06 下旬确认过 `repair_render_completion` 产出符合预期,并讨论过 concurrency=8 与其他 backfill 任务的资源消耗对比。
- 2026-06 上旬做过 MV 人物一致性四规则 pipeline,后续修过 `personConsistencyBreakdownSummary()` 的 scoredCount 和歌词 ground truth fallback 相关测试。

> 注意:这一组可能会牵涉 aion/vidmuse-zeus/业务指标口径。当前只作为 admin 侧排查索引保存;下次确认跨系统事实时,应拆到 `domains/vidmuse/projects/`。

## 只有标题线索,下次触发时再补细节

- `subagent_task` 缺失于 `MessageType` enum 导致 playground thread latency analysis 500。
- `runv2_96cb0c1c6229` 质量评分任务为什么没有被消费。
- daily rollup 边界问题和漏斗数据路径的具体代码点。
- credits calculation 的具体影响范围与原因。
- CreateThreadForm Studio/Lite/Custom preset selector 代码是否已部署到目标环境,以及 API failure 为什么会禁用选项。

## 关联源码入口

- `~/Downloads/sandai-code/vidmuse-admin/apps/admin/controller/admin/test_center_v2.py`
- `~/Downloads/sandai-code/vidmuse-admin/apps/admin/service/test_center_v2/`
- `~/Downloads/sandai-code/vidmuse-admin/playground/src/pages/test-center-v2/`
- `~/Downloads/sandai-code/vidmuse-admin/scripts/harness/README.md`

**Why:** 过去一个月的 admin 子系统知识分散在多个长对话、代码改动和排障记录里;如果只留在聊天中,新 session 会从零开始摸索。把它放在 `domains/vidmuse/admin/` 下,能避免误解成整个 Vidmuse 业务全景。

**How to apply:** 遇到 vidmuse-admin 问题时先读本页,确定主题属于 Test Center V2、VidMCP、CDN、Analytics 还是 Quality,再读对应 page 和源码。只有标题线索的项目不要当成事实使用,必须现场读代码或找历史详情后再回填。若排查发现影响跨 aion / vidmuse-zeus / vidmuse.ai / admin,把结论迁到 Vidmuse 全域项目页。
