# Claude 本机聊天加密归档（2026-10-19）

加密分卷保存在[本仓库的归档 Release](https://github.com/Leslie12H/leslie_wiki/releases/tag/claude-history-20261019)，本目录保存无密钥解密工具、下载器和校验回执。恢复密钥由用户另行保管，没有提交至本仓库。

归档包括本机 Claude Code 会话及工具结果、文件历史、粘贴内容、桌面端 Code/Cowork 会话与本地会话产物、Claude 相关命令历史，以及普通 Chat 的本地缓存快照。独立登录配置、钥匙串、Cookies、应用设置、VM 磁盘和安装包未作为归档来源；聊天正文自身仍可能引用历史凭证，所以整个归档始终加密保存。

`receipt.json` 记录分卷及完整归档 SHA-256、日志统计与缓存恢复范围。`manifest.json` 和 `session-index.json` 在加密包内，保存逐来源文件映射、校验值和会话索引。日志统计包括重复/审计副本，不代表唯一消息数。普通 Chat 仅包含本地缓存，不能视为完整云端聊天导出。

## 恢复

需要 Python 3.8+ 和 Node.js（使用内置 crypto，无外部依赖）和单独保管的恢复密钥文件。进入本目录后执行：

```sh
python3 download.py
node archive-crypto.mjs decrypt claude-history-20261019.enc claude-history-20261019.tar.gz /安全位置/claude-history-recovery-20261019.key
tar -xzf claude-history-20261019.tar.gz
```

先按 `receipt.json` 核对各分卷与合并后文件的 SHA-256。解密会验证 GCM 认证标签；错误密钥或篡改分卷会报错并删除失败的输出文件。密钥遗失后无法恢复；请勿把密钥提交至公开仓库。
