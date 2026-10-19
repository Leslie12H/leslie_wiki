---
name: claude-history-encrypted-archive-20261019
type: reference
created: 2026-10-19
updated: 2026-10-19
tags: [claude, archive, macos, encryption]
links: [macos-storage-cache-vs-state]
---

# Claude 本机聊天归档与清理入口

**Why:** 2026-10-19 用户要求将本机 Claude 聊天记录保存到 GitHub 后清除本机历史、缓存和登录凭证。目标知识库为公开仓库，用户明确选择保持公开并上传加密归档。

**How to apply:** 从 [加密归档说明](../../sources/claude-history-20261019/README.md) 获取同仓库 Release 分卷、解密工具和校验回执。恢复密钥由用户在仓库外单独保管；不得上传密钥或发布解密后的内容。先验证远端分卷与认证解密，再删除原始本机记录。

这是本机快照，桌面普通 Chat 只覆盖本地缓存；云端聊天、服务端密钥撤销和其它应用的数据分别处理。实际数量与哈希查归档回执；清理结果查同目录 `cleanup-receipt.json`；备份核验方式与边界查 `verification.json`。本次采用 GitHub 服务端完整文件 SHA-256/大小、下载片段匹配及同哈希本地归档的完整认证解密，没有完成远端整包重复下载。

另见 [macOS 存储清理边界](../pitfalls/macos-storage-cache-vs-state.md)。
