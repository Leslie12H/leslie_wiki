---
name: sandeval-bulk-quality-fixtures
type: reference
created: 2026-09-21
updated: 2026-09-21
tags: [sand-eval, quality, fixtures, bulk]
links: [sandeval-auto-reinspection-verification]
---

# 供应商批量验收与整包送审测试数据入口

**Why:** 跨题包批量验收与单个题包内的多批次验收不是同一个能力。100+ 场景需要独立题包、实际完成的答案和质检报告，不能用一个包的 100 道题替代。

**How to apply:** 锁定目标环境和专用身份，走下发、派题、答案提交、质检分配及提交报告的业务接口，将数据停在目标待办状态。先用一包验证完整链路，再分批准备；创建成功不等于具备验收条件，最后用负责人页面和服务端状态共同核实。实例 ID、数量、状态与部署版本以当次记录为准。

- 单主任务题包约束：`sand-eval/platform/backend/app/domain/dispatch_masters.py` 的 `MasterConfig.require_single_package`，以及仓储保存入口；构造前检查当前约束，不能只看 packages 字段的长度上限。
- 正常链路复用入口：`sand-eval/platform/acceptance/e2e/client.py` 和 `flow.py`。普通 API 会话凭据需私密保存，不写入报告或知识库。
- UI 粒度核对入口：`BatchReviewTable.tsx`、`PackageHandoffDialog.tsx`，及实际部署的 `/quality/management` 页面；列表的“批量分配”不代表“批量验收/送审”。
- 2026-09-21 测试环境构造规格、执行回执和最终状态清单：`/Users/leslie/Documents/Playground/output/qt-bulk-acceptance-cases-20260921/`；用例见 `cases.md`，以最终报告和回读为准，规格不是执行成功证据。
