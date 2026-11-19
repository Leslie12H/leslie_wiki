---
name: sandai-platform-magi2-reference-prompt-entrypoints
type: reference
created: 2026-11-19
updated: 2026-11-19
tags: [sandai, api-platform, magi2, seedance, reference-media]
links: [sandai-playground-account-generation-entrypoints, ark-seedance-25-pe-entrypoints, sandai-api-platform-reference-pe-structured-output-pattern]
---

# Magi-2 与 Seedance 的多素材提示词引用

**Why**　2026-11-19 核对多张参考图如何和生成 API 的提示词对应。Playground 的输入格式、公开 API 的请求字段、Athena 的内部引用标签各有来源。创建受理和素材顺序回读也无法证明成片用了正确的参考图。

**How to apply**　调用 Sand.ai 原生 v2 时，按 [创建任务文档](https://platform.sand.ai/docs/create-generation/) 查文本项和素材项。对照 Playground 的 [同类型编号及序列化](https://github.com/world-sim-dev/sandai-website/blob/e7bd6949f6628544c15899852945c418b56f767a/apps/platform/src/features/generations/mentions.ts#L15-L29)、[生成正文](https://github.com/world-sim-dev/sandai-website/blob/e7bd6949f6628544c15899852945c418b56f767a/apps/platform/src/features/playground/pages/playground-page.tsx#L123-L144) 和 [素材顺序](https://github.com/world-sim-dev/sandai-website/blob/e7bd6949f6628544c15899852945c418b56f767a/apps/platform/src/features/playground/use-reference-assets.ts#L173-L186)。Zeus 的 [派发契约测试](https://github.com/world-sim-dev/zeus/blob/51b97abc89c633a5b4d6ef42678b6afc69a44bc9/modules/openapi/src/test/java/co/sandai/zeus/openapi/v2/generations/GenerationDispatchContractTest.java) 查提示词原文和素材顺序。需要核对提示词增强开关时，查 [Athena 参考输入契约](https://github.com/world-sim-dev/athena-admin/blob/c96e45409dfa9d97e0321f9276aa7c551c37e093/docs/architecture/i2fv-reference-inputs.md) 的关闭增强、按模态编号和推理派发小节。

- Magi-2 调用侧沿用 Playground 的拼写。Zeus 旧设计和测试里出现的其他拼写用于验证原文透传。要确认某种拼写的成片效果，用两张视觉特征明显的输入做交换顺序对照，并记录实际生效的提示词增强开关。历史 Playground 证据范围见 [在线体验生成与回读](playground-account-generation-entrypoints.md)。
- 火山方舟按所用版本查看 [Seedance 2.0 教程](https://docs.volcengine.com/docs/ark/seedance-2-0?lang=zh)、[Seedance 2.5 教程](https://docs.volcengine.com/docs/ark/seedance-2-5?lang=zh) 的提示词规则，以及 [2.5 提示词指南](https://docs.volcengine.com/docs/ark/seedance-2-5-prompt-guide?lang=zh) 的多素材映射。请求中的素材字段和角色查 [创建视频生成任务](https://docs.volcengine.com/docs/ark/create-video-generation-task-api?lang=zh)。

## 方舟 Python SDK 调用 Sand.ai

**Why**　安装包名与 Python 导入名可能不同。按 Sand.ai 文档的导入名选择匹配的火山 SDK 分包，避免依赖已移除的元包可选项。

**How to apply**　从 Sand.ai 方舟兼容文档取所在地区的 SDK base URL、组织密钥与请求结构。用 Volcengine PyPI 的安装说明核对分包与导入名。多张普通参考图分别传 `content` 项并显式填 `reference_image`。调用前可用 httpx MockTransport 检查 Bearer 鉴权、创建与查询路径、原文和素材顺序。2026-11-19 已做过双图模拟验证，成片效果仍需真实任务对照。 [国内文档](https://platform.sandai.cn/docs/ark-generations/) · [海外文档](https://platform.sand.ai/docs/ark-generations/) · [火山 SDK 分包](https://pypi.org/project/volcengine-ark-runtime/)
