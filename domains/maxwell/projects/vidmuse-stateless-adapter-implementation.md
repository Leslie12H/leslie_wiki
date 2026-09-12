---
name: vidmuse-stateless-adapter-implementation
type: project
created: 2026-09-12
updated: 2026-09-12
tags: [maxwell, vidmuse, a2a, adapter, checkpoint]
links: [vidmuse-executor-p1, vidmuse-executor-candidates, vidmuse-a2a-executor]
---

# VidMuse 无独立数据库 Adapter 实施指针

**Why:** 用户明确指出 Zeus/AION 已保存 Thread 与业务数据，Maxwell 已拥有调优调度状态。P1 把独立任务库、租约 Worker 和证据副本放入 Executor 扩大了适配层职责。当前方案改为复用状态拥有方；这不是取消创建恢复、身份和版本验证要求。

**How to apply:** 先读[飞书完整方案](https://j0yswlgboxz.feishu.cn/wiki/FXkdwOqIpiSfrNka96vc07jnnFc) 第 3/4/9 节，以及独立 Executor 仓库 `docs/stateless-adapter.md`。核对 Maxwell 的 `limits.createReplayPolicy`、Attempt 原始请求 ObjectStore、远端句柄和产品状态，不再把新建 Executor PostgreSQL 当作部署前提。旧部署是否存在、是否有在用任务需单独审计，不因移除代码依赖就删除真实数据。

## 实现与验证入口

- Maxwell：[PR #286](https://github.com/world-sim-dev/maxwell-ai/pull/286)，说明 `docs/evolve-nonreplayable-adapter-contract.md`。复用既有 limits_json、Attempt.request_hash 和 ObjectStore，无新表/列；HEAD、合并与部署状态需实时读取。
- Adapter：[PR #1](https://github.com/world-sim-dev/vidmuse-executor/pull/1)，`execution/application/handle.go`、`service.go`、`infrastructure/zeus/client.go` 和 `scripts/check-maxwell.py`。认证加密句柄受 Maxwell 现有 500 字符约束；完整上下文仍归 Maxwell。更换账号/配置不能静默复用旧句柄，密钥与在用配置需保留。
- 候选完整包：`candidate/bundle` 与 `docs/dev-candidate-bundle.md`；源 Git 文件模式和 AION 缓存只读模式分开验证，公共依赖后覆盖本地文件的语义仍适用。完整包本地缓存验证不等于 DEV 发布。
- 节点续跑：[AION PR #1754](https://github.com/world-sim-dev/aion/pull/1754)、`checkpoint_manager/snapshot.py`、`file_manifest.py` 和包 README。只读传输、DEV staging 与显式文件采集钩子已离线验证，仍需授权、资产闭包、身份/路径重映射、产品绑定与 Runner；`ready_to_run=false` 不能被解释为可运行。
- 飞书两张架构图的源文件与实际云预览：`/private/tmp/vidmuse-node-audit/diagrams/2026-09-12T180000/verification.json`。文档正文与图的版本以实时回读为准。

## 必须保留的真实业务边界

- 普通创建响应未知时，Maxwell 禁止自动重发；不保证能自动找回 Zeus Thread，也不承诺 exactly-once。存量 Attempt 没有冻结原始请求对象时不能声称具备新策略保证。
- A2A SDK 的 map 序列化会改变冻结 JSON 字节或数值精度；协议用 rawContentBase64 保留原文并比较精确语义，明确 applied=false 不能进入旧 hash 回退。见 Maxwell PR #286 和 Adapter 正式 contracts，不能靠 probe 回显证明应用。
- Zeus Thread 的实际 JSON 所有者字段是 `owner`，不是 Java 成员名 `isOwner`；查看 `AgentThreadVoCreateContractTest`。账号来自 `/api/v1/user/profile`，实际 Plugin 来自 Thread options，Token 本身不是业务身份。
- AION 消息单页升序、分页从新到旧。组装多页需恢复全局顺序，不能只检查数量；旧消息 timestamp 可能为空。取消控制不能依赖历史/产物取证成功。
- recreate 是从原输入重新开始；restore-checkpoint 修改原 Thread；export-timeline 排除原生历史且可能初始化文档。线上节点评测需要独立只读导出与 DEV 新 Thread 导入，不能改线上源现场。
- 当前资产路径可能被覆盖，也可能出现后续节点资产；缺少历史不可变清单时不能拿当前目录证明旧节点。新文件清单只证明所列字节，完整恢复闭包与运行准入仍需分别验证。
- 私有 checkpoint 字节不得直接放在 Thread 公开静态目录；真实 Caddy/PVC 映射需按 AION README 的源码指针检查。保存新摘要不会改变公开目录的访问权限，独立私有目录和可信写入屏障是启用前置。
- 候选控制 HTTP 使用独立凭据与固定仓库/业务/Plugin 绑定；Git root 保存版本和准备 ref，需要持久性与单写入实例。它不是任务数据库，不能把每副本临时 Git root 当成同一个冻结 Work。接口与部署约束见 Adapter `docs/candidate-control-api.md`。
- DEV 发布需保留整个已发布树内的候选。普通 main 自动 DEV 刷新也必须经过保留门禁；仅增加候选发布工作流仍会被旧 checkout/reset/pull 入口覆盖。只读实证和完整树规划入口见 `docs/dev-candidate-release-contract.md`，计划输出不等于部署结果。
- 2026-09-12 无库真实 binary 通过原 Maxwell checker，启动只读账号校验一次，产品 POST 为零。marker probe 的 l1_tune 不证明候选真实应用。未完成 DEV 发布、业务空间登记、真实生成与节点 A/B 闭环。
