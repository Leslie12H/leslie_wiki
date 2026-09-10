---
name: workflow-catalog-thread-plugin
type: reference
created: 2026-09-10
updated: 2026-09-10
tags: [vidmuse, aion, workflow, testing]
links: [vidmuse-aion, test-center-v2-mcp-direct-tool-call]
---

# Workflow Catalog、Thread 与 Plugin 排查入口

**Why:** 列表为空可能来自查询过滤，不足以单独证明系统没有 Workflow；工具返回与 Agent 对返回的解释应分开核对。

**How to apply:** 先读取 Admin Chat 中 list_workflow 的真实参数和响应，区分未传 workflow_id、JSON null 和字符串 "null"；再检查 Basic Information 的 plugin_id、Runner 实际绑定的 revision、加载日志和 Catalog。workspace 源码路径执行与 Plugin 目录发现分别验收，不把安装文件当作注册成功。

## 代码与证据指针

- Aion：apps/runner/tools/workflow/list_workflow.py 与 apps/runner/workflow/service.py；检查 list_workflows 的可选 ID 精确过滤和当前 revision 投影。
- Aion：packages/vidmuse_workflow/src/vidmuse_workflow/loader.py；检查 Plugin workflows 与 workflow_refs 发现路径，以及 run 的 ext_params/context 签名要求。
- Aion：apps/runner/tests/test_workflow_path_execution.py；检查路径执行不改变 Catalog 的断言。
- Admin：apps/admin/service/plugin.py 的 _validate_and_extract_zip / update_plugin_from_zip；发布前确认 ZIP 导入是否保留 workflows/，不能把上传成功当作源码已注册。config.workflow_refs 是公共 Workflow 名称与版本映射，不是任意脚本路径。
- DEV Plugin 注册验收：检查 Test/workflows 下源码与本地 .codex-artifacts/workflow-test-pack-20260907/workflows 的 SHA256、目标 Runner 的只读挂载和实际 list_workflow 返回。打包时排除 macOS ._ 元数据文件，以免被 Python 文件发现逻辑误读；保留已有 Prompt、配置与 Skills。
- Aion：apps/runner/workflow/service.py 的 refresh / _publish_registry_if_latest；核对定时刷新是否只替换 WorkItem Registry、保留启动时 Catalog。共享挂载能读到新文件不等于现有 Runner 已重新加载；需要区分 Plugin 文件发布完成和旧 Thread 重启后的发现验收。
- Aion：apps/runner/shared_skills_startup.py 的 bind_runtime_config 与 runtime/capability_preparation.py 的 _shared_plugin_dir；继续追踪 PLUGIN_REVISION 和 CacheResult.plugin_dir。Runner 重启仍可能绑定原 revision 的只读缓存，而不是 Plugin 可写源目录；对照缓存 plugin/workflows 是否存在，不能把重启当作发布新版本，也不要直接修改共享只读 revision 缓存。2026-09-10 样本在 14:43:57 重启后查询仍为空，需回到 revision 发布与选择链路验收。
- 发布链路：Aion apps/manager/runner_wrapper/kubernets.py 的 _prepare_shared_skills_request 与 packages/revisioned_skills_cache 的 resolve_repository_revision / archive 构建；核对 Plugin 仓库 HEAD 和已提交文件，未跟踪源码不进入 revision 缓存。正式 Test Workflow 变更入口为 [vidmuse-plugins PR #1785](https://github.com/world-sim-dev/vidmuse-plugins/pull/1785)，对应 [DEV 发布记录](https://github.com/world-sim-dev/vidmuse-plugins/actions/runs/34447718634)；2026-09-10 15:09:21 的目标 Thread 原始工具响应是三个 ID/schema 的验收证据，不能扩展成真实媒体调用已通过。
- 重启核验：先区分控制信号标记 terminated 与 Kubernetes Job 实际退出；run_agent_kubernetes 会复用仍 active 的 Job，claim_thread_for_reactive_execution / reconcile_expired_reactive_runner_claims 处理 pending 租约恢复。用户授权切换版本后，只针对明确 Thread 的 Runner Job 处理生命周期，保留工作目录和持久卷，并核对新 Pod 的 PLUGIN_REVISION，不能只看 Reactive API 200 或数据库状态。
- 2026-09-10 排查样本：[DEV Thread Chat](https://dev-vidmuse-admin.sandaii.cn/playground/thread/5247ac19-f757-411e-a159-2936a3efc050?tab=chat)。定位北京时间 11:35:28 的 list_workflow 调用，核对 workflow_id 参数类型，不能只看 Agent 的“无模板”结论。
- [Workflow 测试方案](https://j0yswlgboxz.feishu.cn/wiki/Nhc0wN6t3ipm0pkVllscS2GynJd)：已验证范围与业务场景入口；运行状态和代码版本以实时查询为准。
