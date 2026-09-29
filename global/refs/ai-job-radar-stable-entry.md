---
name: ai-job-radar-stable-entry
type: reference
created: 2026-09-29
updated: 2026-09-29
tags: [miaoda, job-radar, deployment]
links: [feishu-sheet-header-and-merge-sync]
---

# AI 秋招雷达固定入口与工作台

固定公开入口是妙搭 HTML 应用 `app_178y55fg9bb`：`https://j0yswlgboxz.feishuapp.com/app/app_178y55fg9bb`。实际工作台为全栈应用 `app_17abqm45rt4`，其在线地址为 `https://j0yswlgboxz.feishuapp.com/app/app_17abqm45rt4`。

`/Users/leslie/Documents/面试 2/public/portal.html` 用全屏 iframe 嵌入工作台；`deploy_daily.sh` 在生成日报后覆盖发布目录入口为该 portal，再发布固定入口。这样日报仍生成供通知/附件使用，公开 URL 的内容不会回退为静态岗位列表。

**Why:** 公开 URL 被复用为长期分享入口，而岗位、投递、简历和通知已迁至全栈工作台；直接改发日报会让后续定时发布覆盖入口页。

**How to apply:** 改工作台功能时更新 `app_17abqm45rt4` 并发布；改入口包装或每日发布流程时更新 `portal.html` / `deploy_daily.sh`。发布后必须在已登录浏览器用固定入口验收 iframe 内容；未登录访客应看到工作台登录页或使用“在新窗口打开”兜底链接。
