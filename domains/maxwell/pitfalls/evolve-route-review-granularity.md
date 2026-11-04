---
name: evolve-route-review-granularity
type: pitfall
created: 2026-11-04
updated: 2026-11-04
tags: [maxwell, evolve, nextplay, latency, evidence]
links: [evolve-runtime-payload-and-terminal-recovery, evolve-nextplay-archive-navigation-parity]
---

# 路线交付粒度与创作复审组合的等待放大

**Why:** 复杂路线拆成许多正文、切片与短条件门后，如果每个小交付都套用完整创作流程的结构审查、新读者反馈和整稿交接，等待会随片段与复审环节相乘。父任务要求整批完成才写入会进一步推迟可用产物。多次 task 调用不等于重复派工，部分返工也可能由真实状态或剧情反证触发，不能把长时间直接归为 Runtime 重复投递。

**How to apply:** 从当前 Trial 对应的父子 Run 追踪实际归属，分别统计派工项、send、wait、读取和版本变更；按具有业务意义的完整交付单元追踪审查、返工及正式提交时间。核对实际生效的父 Prompt、路线 Skill、共享作家 Skill 和派工正文，明确哪些资源在候选范围内。探索合并机械拆分与复审单元、及时交付可用结果时，仍须依据实际需求保留必要质量检查，不靠追加固定次数限制或延长执行时限掩盖问题。

## 证据与限制

- 原始事件、取消链、版本/hash及本轮候选结论：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-unified-20261019/flexibility-acceptance-20261022.md`，2026-11-04 路线超时记录。
- 原件指针：集成工作区 `.tmp/c15-route-parent-child-events-db-20261104.json`、`.tmp/c15-route-loop-summary-20261104.json`、`.tmp/c15-route-cancel-descendants-20261104.txt`；后续诊断沿 `.tmp/c15-autonomous-repair-20261104/` 核验。
- 当前共享资源全文不能冒充历史 model.request；实际 Skill 激活 hash 可证明该 Skill 版本，无法证明所有当前配置。原凭证读取403应保留，不能扩大权限绕过。
- 超时回执中的取消未确认与随后独立读到子链取消是不同时间事实；后者不能覆盖前者，也不能补写缺失正式包或成本。

## 并发恢复测试的时序经验

执行回执恢复测试不能仅靠短 sleep 假定观察者与原进程重叠。用明确的就绪/释放信号控制重入窗口，保留 Python/子进程标准错误，给测试进程有界生命周期；业务执行时限保持原样。慢启动合成红绿只证明该测试的时序脆弱性，不能据此断言未知 CI 主机的具体原因。源码入口：`services/agent-server/internal/modules/backend/aliyun_execution_test.go`；当前提交与 CI 结果沿 Maxwell PR389 核对。
