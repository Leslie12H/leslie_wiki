---
name: ai-job-radar-stable-entry
type: reference
created: 2026-09-29
updated: 2026-09-30
tags: [miaoda, job-radar, deployment, authentication, privacy, ownership]
links: [feishu-sheet-header-and-merge-sync]
---

# AI 秋招雷达固定入口与工作台

固定公开入口是妙搭 HTML 应用 `app_178y55fg9bb`：`https://j0yswlgboxz.feishuapp.com/app/app_178y55fg9bb`。实际工作台为全栈应用 `app_17abqm45rt4`，其在线地址为 `https://j0yswlgboxz.feishuapp.com/app/app_17abqm45rt4`。

`/Users/leslie/Documents/面试 2/public/portal.html` 用全屏 iframe 嵌入工作台；`deploy_daily.sh` 在生成日报后覆盖发布目录入口为该 portal，再发布固定入口。这样日报仍生成供通知/附件使用，公开 URL 的内容不会回退为静态岗位列表。

**Why:** 公开 URL 被复用为长期分享入口，而岗位、投递、简历和通知已迁至全栈工作台；直接改发日报会让后续定时发布覆盖入口页。

**How to apply:** 改工作台功能时更新 `app_17abqm45rt4` 并发布；改入口包装或每日发布流程时更新 `portal.html` / `deploy_daily.sh`。发布后分别用本人已登录浏览器和未登录浏览器验收固定入口与工作台直达链接；访客应直接看到公共岗位，仅主动点击“关联飞书表格”后才打开飞书登录。

## 访客浏览与私人权限边界

2026-09-30 起按用户要求支持匿名岗位浏览。平台可见范围与业务角色是两个独立层：运行时入口允许未登录访问，不代表访客可以读取私人工作台。当前配置用 `apps +access-scope-get --app-id app_17abqm45rt4 --as user` 回读；不要只看页面按钮判断安全。

实现与回归入口在 `/Users/leslie/Documents/面试 2/job-radar-fullstack/`：

- `client/src/api/index.ts`：公共读取不自动跳转登录；`client/src/pages/Workspace/Workspace.tsx`：关联按钮调用平台登录 SDK，嵌入页面时在新窗口登录。
- `server/modules/workspace/workspace.service.ts`：访客只查公共岗位投影，源表自由文本和链接可能混入个人时间线，因此不直接公开；私人数据仍通过现有 `radar_owner` 平台角色授权。
- `server/modules/workspace/workspace.controller.ts` 与 `workspace.privacy.spec.ts`：公共 GET 不要求登录，私人写入要求登录并继续核验角色；匿名请求、无角色用户和伪造请求体均需覆盖。
- 发布证据指针：代码提交 `82c03ee144c9d19c1c35b19e9561044b9559bb8a`，release `7691228014432881600`；状态用 `apps +release-get` 查询，不能把发布中返回的旧 commit 当作本轮完成版本。

**Why:** “一打开就登录”可能同时来自平台入口强制登录和客户端请求库收到登录提示后自动跳转；只隐藏私人导航不能替代后端数据隔离。

**How to apply:** 先验证公共投影与私人权限，再发布代码并关闭入口强制登录；用独立未登录浏览器检查搜索、翻页和岗位详情不触发登录，关联按钮才打开登录页，同时核验本人已登录视图仍保留原有记录。不用生产写接口作为权限探测，也不向飞书源表回写。

## 个人账号使用与应用归属

应用业务角色、开发协作者/资产所有者、所属租户是不同边界。私人工作台角色用 `apps +role-match-list` 回读；资产所有者在[妙搭我的应用](https://miaoda.feishu.cn/my-apps)及应用协作者设置核查。登录页展示的组织名不能用业务角色授权来改变，授予角色也不等于转移应用。

个人版能力查[官方数据库公网连接说明](https://bytedance.larkoffice.com/wiki/SKtpwTnaqiP6wgkATbMcRlEOncf#KUIVdouqOokfOuxwS3zcHf0JnyC)的个人版租户条目。该说明不证明现有应用可以跨租户转移；2026-09-30 本应用的 CLI 协作者查询返回 `feature_not_available`，网页已核查的菜单也未找到转移入口。跨租户直接转移、目标账号的创建/导入额度、能否保留旧 app ID 与 URL 均需另行确认，不能据此断言平台完全不支持转移。

**Why:** 能用应用、能开发应用和拥有应用资产是三件事；保留旧公开入口作为包装也不等于旧入口已脱离原组织。

**How to apply:** 若要迁至个人账号，先让目标账号登录自己的妙搭空间核验创建/导入能力，再确认官方转移路径及代码、数据库、业务角色和飞书源表授权的迁移边界。未经明确授权不更改所有者或扩展私人数据权限；保留原入口的要求需单独验收。
