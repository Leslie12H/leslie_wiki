---
name: sandeval-amendment-lookup-recovery
type: reference
created: 2026-09-25
updated: 2026-09-25
tags: [sandeval, quality, amendment, migration, recovery]
links: []
---

# 修订索引缺失与质检版本冲突

**Why:** “该固定答案已有后续版本，请重新送审”不必然意味着需要重新送审。已由前置通过报告封存的质检修订，若事实存在但派生查询索引缺失，会读不到应继承的答案；草稿的最新版本保护因此拦截旧答案，前端未 ready 又阻塞保存判断。

**How to apply:** 同时核对原送审成员、最新来源版本、修订事实、窄索引、修订归属报告和本轮冻结前置报告链。必须先确定修订有继承资格，不能直接用 latest_response_id 覆盖冻结成员。原版与当前版 ID 不同也可能是正常继承，不等于所有此类题均故障。

- 2026-09-25 Raymond 案例、精确范围、只读模拟及授权后恢复：`/Users/leslie/Documents/Playground/output/raymond-review-version-20260925/report.md`；应用回执与独立验收见同目录 `lookup-apply.json`、`lookup-verify-final.json`。具体现场和执行状态以报告及核验产物为准。
- 核验入口：`quality/infrastructure/persistence/review_amendment_repository.py::for_member`、`quality/application/inspection/answer_amendment_service.py::visible_amendments`、`quality/domain/inspection/amendment_lineage.py::sealed_by`。
- 报错与 UI 入口：`app/services/facts/answer_amendment.py::verify_current`、`quality/application/inspection/review_service.py::answer_draft`、前端 `StructuredAnswer.tsx` 的读取失败与 ready 状态、`ReviewWorkspace.tsx` 的 amendmentError 保存门禁。
- 索引协议：`backend/sql/119_review_amendment_lookup.sql` 的历史回填与完成标记，以及修订仓储 `add` 的事实/索引双写。迁移标记存在不能证明随后旧实例或中断路径均写齐索引；具体漏写过程仍需历史实例及写日志证明。
- 恢复方式指针：案例目录 `repair_lookup.py`。默认预检，显式 apply 和计划摘要；先验证事实内容、替换摘要、报告状态/版本/计划，再只追加精确缺失索引并保留原 created_at。修复后用真实身份读取正式草稿与题目服务，保护已有判断；不要伪造或重置判题结果来消除错误。
- 核验注意：正常在线双写的事实与索引 created_at 可以不同；原有索引按备份逐行保护，仅历史补齐行要求沿用事实时间。调查到应用期间业务可能继续产生修订，验收应绑定精确记录身份，不能以总数固定不变作为唯一判据。
