---
name: browser-impersonation-concurrent-tests
type: pitfall
created: 2026-09-26
updated: 2026-09-26
tags: [testing, browser, authentication, sand-eval]
links: [sand-eval-quality-center-test-data]
---

# 并行浏览器测试的代登录会话冲突

2026-09-26，Sand Eval 测试环境质检时长验收中，同一 Chrome profile 的页面身份从“照野”变为另一测试操作使用的“Caption验收 A标注员1”，原数据看板随之失去访问权限。另一次切换账号显示“登录状态已变更，请重新登录”。重新登录可恢复操作，但继续使用共享会话仍可能受其他页面切号影响。

**Why:** 同一浏览器 profile 下的测试标签页不能视为独立登录会话。页面上的旧姓名也不能保证下一次请求仍使用该身份；并行代登录可能改变共享站点会话。

**How to apply:** 并行验收先安排独立浏览器会话；每次重要测试写入前核对当前代登录身份，切号后等待新身份加载完成再导航。遇到身份突然改变时暂停写入，重新确认会话隔离，不能把权限页或登录异常归因于正在验证的业务功能。2026-09-26 改用独立 in-app browser 后完成剩余统计核验；是否隔离仍应通过实际页面身份验证。

浏览器隐藏也不等于页面进入后台：本次自动化环境隐藏窗口或创建另一页后，`document.visibilityState` 仍为 `visible`，因此后台暂停计时用例被记为未验证。此行为是当次测试环境观察，不能推广到所有浏览器。

证据指针：本机验收报告 `/Users/leslie/Documents/Playground/qc-duration-test-20260926.md`，Codex 任务 `01a0d84a-d88c-79b0-abb7-aa7756ab88f2`。计时实现会变化，后续验收重新检查目标部署与实际页面状态。
