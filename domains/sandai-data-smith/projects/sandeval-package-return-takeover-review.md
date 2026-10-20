---
name: sandeval-package-return-takeover-review
type: project
created: 2026-10-20
updated: 2026-10-20
tags: [sand-eval, quality, package-return, review, concurrency]
links: [sandeval-completed-review-followup-round, sandeval-sand-wrapper-deferred-declaration]
---

# 整包退回接管未结复验的方案复审

状态：2026-10-20 候选实现已完成隔离测试环境真实 API 流程与不同包并发验收，未合 main、未发布生产。浏览器截图等待飞书重新授权。以下保留方案复审背景；当前证据以文末 PR、CI 与验收记录为准。

**Why:** 停止旧 Sand 复验并不自动转移旧整改责任。旧责任继续阻断新流程可能形成循环等待，强行关闭又可能制造通过结论；持久化接管字段还会影响旧 worker 的解析和恢复。

**How to apply:** 实施前明确精确责任范围和接管授权、新 Sand 正式结果如何收口旧责任、并发决定与保存的统一围栏、每阶段幂等恢复、旧问题必检与合法待定、混合版本及回滚兼容。首版建议限于供应商整改正式完成而 Sand 复验未结束的完整覆盖范围。这是评审时的约束，不能据此跳过现有生产阻断。候选实现边界见文末核验指针。

## 核验指针

- [2026-10-20 完整复审与验收清单](/Users/leslie/.codex/visualizations/2026/10/20/01a15791-b458-7e83-a099-1620fc10895e/package-return-review.md)。源码基线和全部发现以该记录为准，后续实施时重新核对。
- 代码入口：`quality/application/management/package_self_check_service.py`、`package_decision.py`、`aggregation_service.py`；`quality/application/resolution/resolution_service.py`；`quality/infrastructure/persistence/unit_of_work.py`、`resolution_execution_repository.py`，均位于 `sand-eval/platform/backend/`。
- 已核验的现有机制与个案边界：[已检完与后继轮次](../pitfalls/sandeval-completed-review-followup-round.md)。


## 第二轮补充复审（2026-10-20）

**Why:** 原复审还需区分预览与执行授权、决定已落地与实际派出自查、报告写入与答案代改写入。连续整包退回及撤销若无明确语义，也可能使责任链丢失或旧轮次被重启。

**How to apply:** 沿同一完整复审清单核验权限绑定、可接手负责人及失资格质检员的重新分派、旧页面和延迟代改写入守卫、跨代接管关系与旧问题覆盖，以及关闭弹窗/发布回滚/业务撤销的区别。上述均为待实施方案约束，不当作已确认生产漏洞；首版建议不开放一键撤销。


## 用户确认的终止边界（2026-10-20）

用户明确要求：被终止的对象及其下属流程应全部进入不可业务操作态，不得再分配质检或由后台恢复推进。此要求适用于终止生效后的前端、服务端、自动派单和恢复入口；保留历史及审计只读查看，必要技术清理不得恢复业务执行。

整包退回与终止整个数据包需要在方案中分开：退回可以依据明确的新退回决定创建新一轮自查，但已停止的旧轮次仍永久只读，不能重派或被复活；终止整个包则不得继续创建自查、整改、复验等后续任务。前文“旧任务停了，新自查无人接”的接收能力检查仅属于整包退回路径，不适用于终止包。

并发边界：终止与已在途保存/交卷/代改/派单必须有明确先后；终止生效后旧请求不得继续推进流程。按钮置灰不足以验收，需覆盖直接 API、旧页面、延迟请求和恢复 worker。此为用户确认的目标规则，不代表本次已验证或修复当前实现。


## 会话范围与锁竞争约束（2026-10-20）

用户明确本会话专注整包退回的处理和优化；终止审计仅用于相关边界核验，不扩展全平台改造。旧轮次停止只读，新退回决定创建新自查；不能以终止整个来源 task 替代旧轮次接管。

**Why:** 本次源码核验仍有整包准入 mixed DML 跨表事务与 Sand 保存跨表围栏条件。缩短超时不等于物理锁隔离；模拟回归通过也不证明其他正常包无业务影响。

**How to apply:** 沿 [2026-10-20 代码审计与锁约束](/Users/leslie/.codex/visualizations/2026/10/20/01a15791-b458-7e83-a099-1620fc10895e/package-return-code-audit.md) 核对冻结 SHA、7 项离线用例和入口边界。接管计划、旧代次写准入、在途收敛、幂等恢复与常规包性能一起设计；禁止把范围遍历、来源 RPC 和整批派单塞进持锁事务，也不能无替代协议直接删围栏或只用 Redis 锁。测试环境用真实 Hologres 计划/锁等待与不同包 p95/p99 对照验收，不做生产压测。该节记录实施前的审计结论，后续候选实现见文末；没有验收或修改生产。


## 候选实现与测试验收（2026-10-20）

**Why:** 只停止旧执行不足以保证后续可用：旧分配仍可占用批次，连续退回会丢失已转交的责任，串行恢复和嵌套连接借用还会牵连其他正常包。合格题备注需要继承，但不能转换成不合格结论。

**How to apply:** 接管范围读取结束后再展开来源；准入重验复用调用者连接。沿不可变完整包版本链继承责任和必检范围，原证书保持不变，最新完整包正式 Sand 验收才关闭原责任。旧执行按精确持久化围栏退役，释放对应批次占用，不删除原分配或释放其他批次。恢复使用独立可追踪任务、无等待 drain 及稳定分页，避免慢包和首屏受阻包饿死后续工作。原备注和图片沿授权责任链作为上下文投影。

- [候选测试 PR #2664](https://github.com/world-sim-dev/sandai-data-smith/pull/2664)：开发分支直接面向测试分支。因共享测试分支冲突，采用精确候选 SHA 的手动完整测试发布，没有引入 test 历史。
- [精确候选完整测试与测试部署](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/39384185542)：实际验收提交、镜像与检查结果从该不可变运行核对。
- [真实 API 流程、并发、锁采样及权限撤销证据](/Users/leslie/.codex/visualizations/2026/10/20/01a15791-b458-7e83-a099-1620fc10895e/package-return-acceptance.md)：连续两次退回、原备注图片与必检范围、不同包正常保存提交、旧入口拒绝及独立回读。仅隔离测试的小包验证，不当作生产压测。
- 代码核验入口：`quality/application/management/package_takeover.py`、`package_self_check_service.py`、`batch_allocation_service.py`，`app/infra/package_transition.py` 和 `quality/infrastructure/runtime.py`，均位于 `sand-eval/platform/backend/`。
- 页面与 API 验收要使用实际承接人身份：反馈只向授权质检员投影，管理员元数据视角缺少反馈字段不能直接认定继承失败。API 流程通过不替代浏览器截图；本次后者因飞书重新授权被自动审批拦截，未绕过。
- main 和生产发布需另行决定；测试开关启用和全部执行器同版本是本次真实验证的前提，不把代码默认关闭状态当作生产已启用。
