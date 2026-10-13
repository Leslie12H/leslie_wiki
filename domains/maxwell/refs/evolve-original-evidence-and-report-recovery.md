---
name: evolve-original-evidence-and-report-recovery
type: reference
created: 2026-10-13
updated: 2026-10-13
tags: [maxwell, evolve, nextplay, evidence, recovery, grading]
links: [nextplay-independent-benchmark-entry, evolve-design-clarity-20261013]
---

# EVOLVE 原件、评分报告与恢复验收入口

当前本地实现、真实 Run 的只读核验、测试日志与待完成项见[2026-10-13 收尾记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-completion-progress-20261013.md)。具体范围以[集中确认单](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-completion-contract-review-20261013.md)和用户后续指令为准，不用此页推断实时部署或成功数量。

**Why:** 大附件归档、完整评分报告、长事件记录是不同传输边界；只解决一种不能宣称全链路支持大文件。评分已完成后复制原件失败，也不应触发另一轮付费 Judge。共享 Case 的来源 Work 不等于该次评测所属 Work，权限应依据持久 Trial 绑定及隐藏等级判断。

**How to apply:**

- 查 EVOLVE `integration/judgeprovider/measurements.go`、`reports.go`、`infrastructure/evidencearchive`：评分调用完成状态先持久化，报告引用只允许登记的同源 Provider，验证业务/调用/摘要及文件哈希；重启只读取同一次调用和缺失块，成功归档后才冻结平台引用。
- 查 `queries/evidence_files.go`、`integration/evidenceresolve/authorization.go` 和对应测试：下载与 Agent 读取都核对 Trial 和冻结 assessment，不能凭 CAS 哈希或引用内自报归属授权；共享 Case、跨业务、隐藏题及兄弟题分别测试。
- 查 Nextplay `grading_reports.py` 与 `API.md`：报告只有显式协商时才改用引用；数据库 JSON 调整键序时，应按 JSON 值核对清单，再用封存原字节校验成员。完整文件与摘要不得互相替代。
- 查 `worker/evidence_cleanup.go` 和 `evidencearchive/store_test.go`：未完成传输用独立租期和活动锁清理，已发布清单不能随临时任务清理。
- 新 SQL 同时核对迁移 ConfigMap 与 Job 参数。SQL 文件存在、单元测试通过都不代表真实环境迁移已执行；共享 PVC/NAS 与 1 GiB 实际传输须独立验收。
- 结果页面按执行异常、评分异常、质量未达标分别组织，可读回答优先，原件和诊断按需展开。实时数量、截图及技术测试的适用范围只查收尾记录。

2026-10-13 用户明确要求：改动通过 PR 审查合并；**dev 部署须再次询问，不频繁自动部署**。这撤回了此前本轮连续部署的默认授权。PR、迁移、部署与真实业务验收分别记录；本地界面 fixture 不能充当 dev 或自然 Agent 验收。
