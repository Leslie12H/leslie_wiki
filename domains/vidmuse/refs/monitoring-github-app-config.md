---
name: monitoring-github-app-config
type: reference
created: 2026-09-12
updated: 2026-09-12
tags: [vidmuse, monitoring, github-app, maxwell, secrets, browser]
links: [monitoring-code-scope-blocks-claim]
---

# 监控 GitHub App 配置定位与 Secret 定向读取

**Why:** 2026-09-12 用户确认目标为监控 App `vidmuse-monitor-ro-prod-leslie`。App ID、Installation ID 和 PEM 私钥来自不同入口；GitHub App 页面已存在私钥的条目仅提供指纹，不能从该条目重新下载私钥。需要复用现有配置时，应定位既有部署凭据并验证归属。本页只保留入口、字段名和读取边界，不保存真实 ID、私钥、指纹值或 Secret 内容。

**How to apply:**

1. 从[个人 App 设置](https://github.com/settings/apps/vidmuse-monitor-ro-prod-leslie)进入目标 App。General 查看 App ID；Install App 中进入 `world-sim-dev` 的安装管理链接，核对 Installation ID。不要把组织 ID、App ID 与 Installation ID 混用，后续仍需实时核对目标 App 和安装对象。
2. 现有私钥来源先查 `vidmuse-monitoring-mcp` 的 `.github/workflows/deploy-prod.yaml`：`prod` environment、ACK cluster 配置以及 namespace `vidmuse` / Secret `vidmuse-monitoring-mcp-secrets` 的写入链路。生产 cluster 具体标识从 workflow 读取，不在本页复制。`deploy/kubernetes.yaml` 的 `envFrom.secretRef` 是运行时关联证据；源码指针不能代替当前集群实查。
3. 只定向读取 `VIDMUSE_MONITORING_GITHUB_APP_ID`、`VIDMUSE_MONITORING_GITHUB_INSTALLATION_ID`、`VIDMUSE_MONITORING_GITHUB_PRIVATE_KEY` 三个键。优先用具备权限的只读 Secret 查询，并让返回值直接进入本地处理脚本；不要输出整个 Secret、注解、环境变量或凭据正文。导出文件由当前用户持有并限制权限，内容不提交到 Git。
4. 对本地 PEM 使用 OpenSSL 导出 DER 公钥并计算 SHA-256，与目标 App 页面已有 key 的指纹核对。比较时统一页面指纹的编码表示；只报告是否一致，不记录私钥或指纹值。不要仅根据文件名判断私钥归属。
5. Maxwell 的字段契约以 `maxwell-ai` 的 `services/mcp-server/internal/server/github_tool.go:githubToolConfigSchema` 为准，客户端读取见 `services/mcp-server/internal/github/client.go:Config`。核对 `auth_type`、`app_id`、`installation_id`、`private_key_pem`、`repositories`、`access_mode`；私钥字段需要完整 PEM 内容。读取最新 `origin/main` 时注意当前工作树可能较旧，避免把主干契约与本地旧文件混为一谈。

## 2026-09-12 ACK Secret 详情页踩坑

ACK Secret 详情的 annotations 可能包含 `kubectl.kubernetes.io/last-applied-configuration`，其中有整个 Secret 的 Base64 数据。Base64 不是脱敏，原样输出注解也会暴露凭据。

在该页面使用 `getByRole('row').filter({hasText: key})` 定位键时，外层注解行也会命中键名。此次因此触发 strict 错误，错误文本包含匹配元素内容。捕获异常后再输出原文同样会泄露；仅避免主动打印 Secret 正文并不充分。

下次先通过 `getByText(key, {exact: true})` 计数，确认唯一匹配后，再沿 DOM 定位最近的 `tr`，只读取该行目标值。唯一性不成立就停止该次读取并换定位方式；不要执行可能产生完整元素诊断的模糊定位。Secret 页面禁止输出全量 DOM 树、截图和错误原文；异常仅返回预设的无凭据错误码或简短失败说明。

## 核验指针

- 2026-09-12 核对的监控源码：`vidmuse-monitoring-mcp` Git ref `2a3389fe11e448bface2aaea7d0063c34cc8e98b`，`.github/workflows/deploy-prod.yaml`、`deploy/kubernetes.yaml`、`configs/config.prod.yaml`、`docs/readonly-code-database-evidence.md`。下次先刷新并核对当前部署；provider 激活路径会影响三个键是否存在。
- 2026-09-12 核对的 Maxwell 契约：`maxwell-ai` Git ref `4a91b77855583e960580bb452f827cb1fe6d986e`，`services/mcp-server/internal/server/github_tool.go` 和 `apps/studio/src/pages/docs/content/tools/github.md`。
- 监控可访问仓库与证据白名单的边界，见 [GitHub App 仓库范围不一致会阻断 Agent 自动认领](../admin/pitfalls/monitoring-code-scope-blocks-claim.md)。
