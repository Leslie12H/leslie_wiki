---
name: evolve-nextplay-dev-release-20261015
type: reference
created: 2026-10-15
updated: 2026-10-15
tags: [maxwell, evolve, nextplay, dev, release, evidence]
links: [nextplay-independent-benchmark-entry, evolve-native-routing-vs-candidate-runner]
---

# EVOLVE 与 Nextplay dev 发布核验入口

**Why:** 用户授权两个仓库各进行一轮 dev 发布；服务部署、评分能力声明、平台注册与真实 Case 出分需要分开证明。已合并 main 不包含主工作区仍在修改的 UI。

**How to apply:**

- 本轮授权、固定 SHA、服务范围、配置补齐、独立镜像/就绪/公网核验、回滚及尚未执行的验收查[发布记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-dev-release-20261015/plan.md)。不要将记录中的历史 SHA 当成实时环境状态。
- 工作流证据：[Maxwell 38741714871](https://github.com/world-sim-dev/maxwell-ai/actions/runs/38741714871)、[Nextplay 38741725302](https://github.com/world-sim-dev/nextplay-eval/actions/runs/38741725302)；部署前活跃任务与数据库结构只读检查：[38741466205](https://github.com/world-sim-dev/nextplay-eval/actions/runs/38741466205)。实际成功或失败及最终镜像以工作流和独立读回为准。
- Studio 静态站点按 `.github/actions/cicd-service/action.yml` 发布到 OSS；用公网 HTML 的构建资源路径匹配工作流，不能寻找不存在的 Web Deployment。
- Nextplay 主动读取平台原件的可选 origin、鉴权复用和临时副本规则查 `eval-service/README.md` 的“从 EVOLVE 读取评分原件”及 `evidence_pull.py`；API/Worker 启动时加载同份配置，补配置后必须核对实际 `/describe` 声明。能力声明不是一次真实评分验收。
- 短 rollout 等待超时先看新 Pod 镜像拉取事件及最终 Ready，避免重复派发。账户页面暂时权限错误应刷新回读后再判断，不因单次错误扩大账户权限。

普通评测和 A2A 配对调优的分工仍见 [内部执行分流与候选 Runner](../pitfalls/evolve-native-routing-vs-candidate-runner.md)。
