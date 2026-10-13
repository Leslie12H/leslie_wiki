---
name: sandeval-manual-return-missing-reinspection
type: pitfall
created: 2026-10-13
updated: 2026-10-13
tags: [sand-eval, quality-center, manual-return, reinspection, recovery]
links: [sandeval-repeated-correction-ancestor-blocker, sandeval-direct-return-interrupted-by-leader]
---

# 已验收批次退回质检后缺少后继重检

**Why:** 负责人退回质检包含“保存退回事实”和“创建后继重检”两步。只看到退回成功或质检待办，不能证明新轮次已生成。原轮次已封存时，未结负责人退回会合法阻断在旧轮次上再次退回标注员；通用“召回或未闭环”提示也不能证明发生了召回。2026-10-13 指定实例确认已有 open 退回单、原命令 reinspection_ready=false、没有后继轮次/复验授权，且原质检员门禁精确指向该退回单。最初创建未完成的具体原因未取得完整原响应或堆栈，不应臆造。

**How to apply:** 固定源任务、标注员完整批次范围、旧质检/验收报告、退回单和部署版本。先只读核对 current successor、正式 permit、单版本与人物资格，按原质检员实际身份运行 assert_returnable 和原生重检前置校验。已有退回事实但未创建新轮次时，经摘要冻结、完整备份及读回、当前版本再验证和互斥租约，通过 owning operator 对这一张单调用 ManualReturnService.restart；不要关闭未验收的上级责任、改写旧通过报告或复用旧判断作为新结论。恢复后用其他副本读取新轮次，核对 available_actions、完整执行依据、当前唯一 correction_recipient 和浏览器真实只读观察；管理员只读模式禁止确认写入，不能用模拟操作当生产命令验收。

- [2026-10-13 指定批次取证与恢复报告](/Users/leslie/Documents/Playground/output/kemeng-return-blocker-20261013/report.md)：可梦 02 / 李骐帆 6 题批次的原验收、真实阻断对象、只读预检、摘要、完整备份、原生恢复、新入口及独立回读。实例状态、人员资格与源码均会变化，使用时重新核验。
- 可变代码指针：quality/application/resolution/manual_return_service.py 的 submit / restart / recover / assert_returnable，以及 quality/application/inspection/review_service.py 的 check_blockers。负责人已退回后应进入新的后继检查，旧封存报告继续作为历史保留。
- 运维脚本应从持久化 ReviewTask 取 attempt，不能假设 ReviewTaskSummary 包含相同字段。原生业务已完成但核验脚本异常时，先确认旧执行器及在途写入停止，独立查明完成事实，再只补审计与原操作回执；不能重放业务命令或直接删 Redis 占用。本次完整过程及边界见恢复报告。
- 历史 submitted_by 可为代交接负责人，来源标注员、当前持卡接收人和命令提交人须分别核对；submitted_by 与标注员不同不自动构成异常。
- 本次为指定存量恢复，没有平台代码改动或发布；原生重检恢复成功不证明未来创建不会再次中断。
