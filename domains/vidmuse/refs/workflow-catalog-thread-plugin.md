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
- 2026-09-10 排查样本：[DEV Thread Chat](https://dev-vidmuse-admin.sandaii.cn/playground/thread/5247ac19-f757-411e-a159-2936a3efc050?tab=chat)。定位北京时间 11:35:28 的 list_workflow 调用，核对 workflow_id 参数类型，不能只看 Agent 的“无模板”结论。
- [Workflow 测试方案](https://j0yswlgboxz.feishu.cn/wiki/Nhc0wN6t3ipm0pkVllscS2GynJd)：已验证范围与业务场景入口；运行状态和代码版本以实时查询为准。
