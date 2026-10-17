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
