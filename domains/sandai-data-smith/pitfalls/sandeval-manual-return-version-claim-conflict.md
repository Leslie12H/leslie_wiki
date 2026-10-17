---
name: sandeval-manual-return-version-claim-conflict
type: pitfall
created: 2026-10-17
updated: 2026-10-17
tags: [sand-eval, manual-return, idempotency, recovery]
links: [sandeval-manual-return-partial-write, sandeval-manual-return-passed-status-handoff-gap]
---

# 退回质检的版本占用与重复请求冲突

**Why:** 2026-10-17 的单案核查发现，退回已保存、原请求回执已补齐，但后继重检尚未生成，页面仍可看到旧报告通过。通用“相同请求标识不能用于不同内容”既可能来自请求号本身，也可能来自同一报告版本的唯一退回占用。新请求号被纳入指纹，因此关闭弹窗后另发请求，即使业务原因相同，也不代表能绕过原版本占用。不能据文案责归用户改了原因，也不能把客户端超时当作业务零写入。

**How to apply:** 固定部署 SHA，分别读取原报告、`MANUAL_RETURN_VERSION`、完整 intent、最终 receipt、退回责任与唯一后继组。按原操作者和完整原请求重算指纹，以同事项续办保持原接收人、答案范围与封存报告；不得删除占用或改写不可变回执来新建。真正恢复前仍须原生资格/来源预检、旧执行停止确认、精确生产写入授权和独立读回。源码只说明可触发路径，截图请求体未取得时应明确保留归因边界。

- [2026-10-17 原单只读报告](/Users/leslie/Documents/Playground/output/quality-return-20261017/report.md) 保存截图对象、数据库与 SLS 证据边界、原请求指纹复算和未执行的恢复范围提案。会变化的身份、状态、深层准备阻断及执行结果均以报告与后续实时核验为准。
- 当前代码入口：`quality/application/resolution/manual_return_service.py::_return/submit/restart`、`quality/application/resolution/manual_return_intent.py::resume_manual_return`、`quality/infrastructure/persistence/unit_of_work.py::CommandReceipts`、`frontend/src/pages/quality/management/ReturnBatchModal.tsx`。路径归 Sand Eval 业务仓，以实际部署版本读取。
- 同一链接中的 work-handoffs 超时须另查其请求与事务，不能拿转交故障解释退回弹窗的幂等冲突。

## 2026-10-17 明确授权后的原单续办

- [原单恢复与独立验收报告](/Users/leslie/Documents/Playground/output/quality-return-20261017/recovery-report.md) 固定用户本次明确授权、原生资格/来源预检、原请求和单题范围、显式 apply 计划摘要、持久审计及另一个生产副本的实际入口/队列/管理页回读。具体报告和责任状态会变化，以该报告及后续现场读取为准。重检就绪与真正作答、提交和验收分别核验。
- [修复 PR #2575](https://github.com/world-sim-dev/sandai-data-smith/pull/2575) 处理关闭弹窗后相同业务内容的新请求接回冻结原意图，并提供单条恢复 CLI。代码 Gate、合并和部署按 PR 当前证据核对，不能由个案恢复反推代码已经发布。
- 恢复的业务预检归 Quality application owner；operator CLI 负责环境、输入、显式 apply 与审计。新增 CLI 命中现有词汇门时，应回到实际 owner 边界修正，不扩大兼容基线或拆字符串绕过扫描。
