---
name: evolve-bundle-local-file-identity
type: pitfall
created: 2026-10-14
updated: 2026-10-14
tags: [maxwell, evolve, evidence, identity, grading]
links: [evolve-original-evidence-and-report-recovery]
---

# 多 Provider 原件的下载身份

**Why:** 原件包内部唯一的文件 ID 不保证在一题的全部执行与评分报告之间唯一。聚合后直接将包内 ID 用于下载路由或界面状态，会选错原件或串联进度；正文哈希拒绝错误文件只能防止错误保存，不能恢复正确选择。

**How to apply:** 聚合资源的用户入口身份应覆盖完整冻结归档引用，底层读取继续使用包内身份；旧入口只能在唯一对应时兼容。授权依据仍是持久 Trial 与其冻结引用，不能凭下载句柄获得额外权限。测试应让多个合法包复用文件 ID、提供不同正文，并对实际读取的包和文件共同校验；补晚到、换序、重复引用、隐藏题与旧链接歧义分支。

实现、原失败、回归和待完成边界查[2026-10-14 原件下载复核](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-evidence-file-identity-review-20261014.md)。代码入口为 EVOLVE `queries/evidence_files.go`、`TrialEvidenceFiles` 和 `EvidenceDownloadStore`；Agent 读取入口为 `integration/evidenceresolve/archive.go`。当前具体身份算法、协议与测试状态只查源码和复核记录，不把本地验证视为真实评分或发布证据。

关联：[原件与评分报告恢复](../refs/evolve-original-evidence-and-report-recovery.md)。
