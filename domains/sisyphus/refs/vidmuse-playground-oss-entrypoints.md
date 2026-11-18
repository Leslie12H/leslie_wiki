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
