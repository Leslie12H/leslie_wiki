---
name: vidmuse-playground-oss-entrypoints
type: reference
created: 2026-11-18
updated: 2026-11-18
tags: [sisyphus, vidmuse, oss, deployment]
links: [sisyphus, vidmuse-admin]
---

# VidMuse Playground OSS 配置查证入口

相同的 bucket 出现在开发配置、Admin 视频预览校验和 Sisyphus 发布文件中。开发配置与运行时配置即使一致，也要向实际区域的 OSS 验证凭证是否可用。

判断 Sisyphus 实际使用哪套配置时，先看 `sisyphus/deploy/README.md` 的 GitHub Secrets 到 Kubernetes Secret 映射，再看 `deploy/k8s/base/configmap.yaml` 的 bucket 和区域，以及 `deploy/k8s/base/api.yaml`、`deploy/k8s/base/worker.yaml` 的 `secretKeyRef`。发布脚本在 `scripts/release/deploy.sh` 的 `apply_oss_secret` 中建立映射。以部署集群的 Deployment 和 ConfigMap 回读为准。

2026-11-18 只读复核时，API 和 Worker 都指向部署文档对应的 OSS Secret，部署的 ConfigMap 指向目标 bucket。对本地与运行时的凭证做内存比对，两者相同。分别向目标区域的 OSS 发起 `ListObjectsV2` 均返回 `403 InvalidAccessKeyId`。复核时只请求目标 bucket 所需前缀，记录状态即可。

`vidmuse-admin/apps/admin/service/oss.py` 的 `video_preview_source_url` 用于校验预览 URL。查 Admin 的签名配置从同文件的 `OSSService.__init__` 开始。

## 2026-11-18 凭证更新与验证

从 Dev 和 Staging 的现行 Deployment 查到 Admin、Aion Manager 和 VidFlow 的配置来源，并以实际 bucket 字段为准筛选。对同一 bucket 的 AK/SK 做内存去重后，确认有一对不同于旧 Sisyphus 凭证的候选。向新加坡 OSS 做只读验证时，V1 和 V4 签名均返回 `200`。配置对象的更新时间只能用来定位现行来源，不等于密钥签发时间。

更新 Sisyphus 时应核对 `.github/workflows/release.yml` 和 `.github/workflows/deploy-existing.yml` 中引用的 GitHub Actions Secrets，并确认 repo 与 environment 的实际存放层级。发布脚本会重新写入集群 Secret，因此凭证同步同时覆盖 GitHub 来源与上线配置。2026-11-18 的更新使用已经校验过的候选，更新 GitHub 仓库级 Secrets 和集群 OSS Secret，回读后使用 Sisyphus 自身的 OSS 前缀验证。

API 和 Worker 将 Secret 注入进程环境，变更后需替换两者 Pod。API 可滚动更新，单副本 Worker 使用 Recreate 策略。更新后核对新 Pod 的就绪状态、进程实际使用的凭证以及 OSS 请求结果。本次 API 两个副本和 Worker 一个副本均就绪，进程内凭证与更新后的 Secret 一致，按 Sisyphus 前缀进行只读访问均返回 `200`。已经启动且以环境变量注入凭证的 Runner 不会自动刷新凭证。
