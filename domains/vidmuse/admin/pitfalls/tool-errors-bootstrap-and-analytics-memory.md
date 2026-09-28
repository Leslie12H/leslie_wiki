---
name: tool-errors-bootstrap-and-analytics-memory
type: pitfall
created: 2026-09-15
updated: 2026-09-15
tags: [vidmuse, admin, analytics, memory, frontend, feishu]
links: [monitoring-problem-claim-replies-to-historical-alerts, analytics-maintenance-historical-rebuild-pressure]
---

# Tool Errors 白屏与 Analytics Worker OOM 要分别追溯

**Why:** 2026-09-15 排查飞书卡片跳转 Tool Errors 页面时，浏览器入口模块被返回为 HTML，React 未启动；同时生产 Analytics Worker 在反复 OOM 重启。两者属于不同进程和不同链路，时间接近不能证明页面 preview 请求导致 Worker OOM。分别核对浏览器资源、Web 查询和 Worker 处理的数据，才能给修复设定正确范围。

**How to apply:** 先按以下三条证据链定位，再决定修复与验收；保留不确定项，不将源码风险直接写成某次生产 OOM 的唯一原因。

## 1. 页面启动：先查入口模块 MIME

- 2026-09-15 Chrome 在精确 Tool Errors 入口上观测到 `index-CTdLn1tz.js` 返回 `text/html`，导致模块加载失败、React 未启动。这是此次所见白屏的直接证据。
- 源码 `apps/admin/app.py` 的 `SPAMiddleware` 原先会把任何以 `/playground` 开头路径的 404 替换为 `index.html`，包括缺失的 JS/CSS，形成“资源不存在 → 200 HTML”的确定缺陷。
- 后续 urllib 读取同一 asset 已是正常 200 JavaScript；未取得首次错误请求对应的上游日志，故没有证明究竟是滚动发布、缓存、路由或其他上游行为使那次请求返回 HTML。
- 修复入口：只允许正确 `/playground` 路径边界内、GET/HEAD 且显式接受 `text/html` 的页面导航回退；排除 assets 子树及带文件扩展名的路径。入口 HTML 使用 `Cache-Control: no-cache`，缺失资源保留 404 并 `no-store`，正常资产保持原响应。HTML 回退按 Accept 协商时增加 `Vary: Accept`。
- 浏览器还需验证 `playground/index.html` 中入口模块执行前的失败提示与重载按钮；React 内的错误提示无法捕获 React 尚未启动的场景。

## 2. Web 查询：preview 全量 ORM 与响应 limit 是两回事

- 原 `ErrorIntelligenceService.build_report` 为当前窗口及历史基线读入全量错误 ORM 行，再创建各窗口的 Thread 集合、指纹样本和摘要；最终返回的 `limit` 不约束这部分读取和内存。
- `get_tool_error_clusters` 与 LLM shadow 也要区分返回 Top N 和读取全部聚合结果。只减少最终卡片数不能证明查询内存已有上限。
- 修复/评审指针：`apps/admin/service/error_intelligence.py` 的窄列与分批迭代、精确去重及样本累计；`apps/admin/service/thread_analytics.py` 的分批分组结果与有界 Top N；`apps/admin/controller/admin/thread_analytics.py` 的查询执行及并发准入。
- 窗口合同保持 30 天聚合、3 天明细；按当前 tool 限定查询及改变加载方式不应改变窗口或指标含义。
- 本地 40,000 条 SQLite 合成数据、独立 Python 进程前后对照：Python traced peak 从 201.529 MiB 降至 6.524 MiB，进程 max RSS 从 441.562 MiB 降至 116.750 MiB。当前次数、去重 Thread 数、指纹数、7/30 日基线和前三样本计数等价。原始 fixture、脚本和 before/after JSON 位于 `/private/tmp/ei-memory-20260915/`，方法说明为 `README.md`；临时目录可能被清理，以 PR 的验证记录为持久追溯入口。这是 LLM 关闭下的本地合成对照，不是生产 MySQL 负载或 OOM 根因证明。
- 核验应比较语义分组、总次数、去重 Thread 数、基线比值、样本和低严重性过滤的前后结果，再检查 EXPLAIN、读取行数和真实内存。流式 Python 迭代不自动证明 SQL 扫描量、数据库负载或生产吞吐改善。

### 同步 SQL 移出 Web 循环时，不要迁移共享异步客户端

**Why:** 为避免同步 SQL/CPU 阻塞 Web 事件循环，在工作线程中通过临时 `asyncio.run` 执行服务时，不能让全局缓存的 AsyncOpenAI/httpx 连接池跟随请求进入不同临时循环；连接复用与循环关闭会造成跨循环错误。仅验证一次 mock LLM 成功发现不了这个问题。

**How to apply:** 保持 SQL/CPU 在有界线程池，Controller 显式传入原 Web 事件循环；LLM enrichment 通过 `run_coroutine_threadsafe` 回送原循环，只传数据。preview、send 及既有 LLM shadow 都按此边界处理；取消 HTTP 请求时仍要等待无法中止的同步查询退出后才释放执行槽和会话。代码指针为 `ErrorIntelligenceService._try_llm_enrich`、`llm_shadow_classify_tool_error_clusters` 及 Controller 的 `_run_analytics_query`。使用真实本地 HTTP keep-alive 连续请求测试，核对客户端执行循环、连接复用、取消路径及临时 SQL 循环关闭，不能只测首次调用。

## 3. Worker 内存：记录正在分析的 Thread，减少完整对象副本

2026-09-15 的现场定位指针如下，只用于重建当次事件：

- Worker Pod：`prod-vidmuse-admin-analytics-worker-54d4c8cd6b-xnrnq`；部署源码标识 `57b832dd9`。一次容器从北京时间 20:56:10 运行到 20:57:14，约 64 秒后 `OOMKilled`、exit 137，内存上限 4 GiB；只读检查期间重启计数从 6 增至 7。同版本的两个 Web Pod 当时均无重启。
- 实际 Pod 配置 `ANALYTICS_HOURLY_ROLLUP_ENABLED=false`；hourly 的 “loop starting” 日志在开关判断前无条件打印，不能据此认定小时重建正在执行。Outcome 初始等待 120 秒，本次 64 秒运行段还未开始该任务。
- previous logs 显示 facts reconcile、规则同步及一次 tool-daily tick 已结束，随后 recent-priority 选择了 39 个 Thread，持续记录分析成功；最后成功的 `ffdcbf99-00e0-4943-986d-2bdba3fc470b` 不是已证明的 OOM 触发 Thread。旧日志没有下一条分析开始记录，不能据末条成功日志反推。
- `_fetch_recent_missing` 最多读取 `RECENT_PRIORITY_BATCH_LIMIT * 5` 个完整 AgentThread（含 JSON/text 字段）后再筛选；常规切片按默认 `DAILY_REBUILD_CONCURRENCY=1` 执行。启动日志的 concurrency 4 不是该 recent 分组实际并发数，也没有发现跨全部已完成 Thread 长期保留聊天分析对象的结果集合。
- 已确认放大点：聊天源整份下载并解析，所有 subagent 聊天源原来无界 gather；`analytics_runner._chat_evidence` 再执行完整 `json.dumps(...).encode(...)`，在已解析对象外增加整份字符串和字节副本。单个聊天/工具结果很大时，候选批次上限不能约束单 Thread 内存。
- 最小修正：同参数 JSONEncoder 增量编码并逐块更新 SHA256；指纹及现有返回字段不变、编码总字节数相同。主聊天解析后立即释放 raw 文本引用，再加载 subagent；subagent 每批最多 4 个加载，完整保留全部记录和稳定时间排序。每条 Thread 在取得分析槽后记录结构化 started/finished、状态和耗时，不以截断聊天或永久跳过大 Thread 冒充成功。
- 合成 512 个大对象时，仅哈希阶段 Python 分配峰值从 25,402,394 bytes（约 24.2 MiB）降到 53,875 bytes（约 52.6 KiB）。输入对象在测量前构建；这是 tracemalloc 对照，不是生产 Worker RSS，也不能证明本次 OOM 的精确因果或已恢复。完整解析对象、超大单字符串及 token JSONL 仍需按真实文件尺寸和 RSS 继续核验。

## 代码与验证入口

- [PR #881](https://github.com/world-sim-dev/vidmuse-admin/pull/881)，固定提交 [28b0995e8](https://github.com/world-sim-dev/vidmuse-admin/commit/28b0995e8312b6dc4e3d55f90d8d89f00c45f069)，分支 `codex/fix-monitoring-claim-tool-errors`。2026-09-15 本地实现及回归完成，未合并、未部署；后续 PR 状态到链接核验。
- SPA：`apps/admin/app.py` / `SPAMiddleware`；隔离回归 `apps/admin/tests/test_spa_middleware.py`。
- Worker：`apps/admin/workers/analytics_worker.py` / `_process_batch`、`_main_tailer_loop`；`apps/admin/workers/analytics_runner.py` / `_chat_evidence`；`apps/admin/service/thread_analytics.py` / `_load_static_subagent_objects`。
- 内存与兼容性：`apps/admin/tests/test_analytics_worker_memory.py` 验证编码/指纹等价、合成峰值、分批加载完整性与开始/结束日志；保留原 `test_thread_analytics_backfill_paging.py` 的调度、延期及检查点回归。
- 2026-09-15 验证：联合 11 个后端文件 461 项通过；完成 LLM 原循环回送后，受影响的 16 项回归通过，其中新增 2 项覆盖真实 keep-alive 和取消。连续 preview/send/shadow 共 7 次 HTTP 请求复用一条连接，6 个临时 SQL 循环正常关闭。前端 9 项测试、两套 TypeScript 检查、构建，以及完整 Pylint 门禁和约定检查通过；回归入口含 `apps/admin/tests/test_error_intelligence_loop.py`。完整 461 项与最后 16 项是不同验证范围，不将前者写成最后修改后再次全量执行。
- 生产验收分别看：精确页面入口及缺失资源请求；Web preview 的数字/样本/负载；Worker 每条开始/结束、未完成 Thread 的源文件大小、峰值 RSS 和跨多个周期重启状态。旧镜像无重启、某次正常资源响应或本地测试通过，都不能替代这三条验收链。
