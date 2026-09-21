---
name: public-jobs-private-applications
type: pitfall
created: 2026-09-21
updated: 2026-09-21
tags: [privacy, feishu, authorization]
links: [feishu-sheet-header-and-merge-sync]
---

# 公共岗位与私人投递信息的权限边界

**Why:** 登录门禁不等于记录隔离；把所有请求映射到固定投递所有者，会向访客返回个人进度。即使不返回 applications，导入到 jobs.summary 的时间线、状态与私人链接仍可能泄露信息。

**How to apply:** 服务端按平台真实角色区分只读岗位与私有工作台；无身份、无角色时默认拒绝私人读写。访客路径不查询个人表，以明确字段投影返回岗位；来源自由文本必须按隐私风险处理，不能只靠删几个关键词。写请求在查询和副作用之前拒绝，测试覆盖直接 HTTP 请求及伪造 body 身份。飞书 open_id 与妙搭运行时 userId 不可混用。

## 验证指针

- `/Users/leslie/Documents/面试 2/job-radar-fullstack/server/modules/workspace/workspace.service.ts`：私有读取和写入检查、公共岗位投影。
- 同目录 `workspace.controller.ts`、`workspace.privacy.spec.ts`：网关角色传递、禁缓存与 HTTP 权限回归。
- `lark-cli apps +role-member-list` / `+role-match-list`：现场核验角色成员和命中结果，不把成员快照记为长期事实。
- 发布成功、角色配置成功和登录后的真人验收是三类独立证据；登录页协议勾选必须交给用户。
