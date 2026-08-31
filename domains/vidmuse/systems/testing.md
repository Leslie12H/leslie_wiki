---
name: vidmuse-testing
type: system
created: 2026-07-02
updated: 2026-07-02
tags: [vidmuse, testing]
links: [vidmuse-zeus, vidmuse-admin, vidmuse-ai-frontend]
---

# 测试仓库群

Vidmuse 的测试仓库(散落在 `~/Downloads/sandai-code/` 下)。

| 仓库 | 疑似用途(待确认) |
|---|---|
| `Vidmuse/`(大写) | 测试仓库(具体待确认) |
| `zeus_api_test/` | vidmuse-zeus 接口测试 |
| `web_uiautomation/` | Web UI 自动化 |
| `Vidmuse-test-center-v4-worker/` | test-center-v4 相关 worker |
| `vidmuse_eval_operator/` | 评测 operator |
| `vidmuse-*-email-recall-tests/` | 邮件召回测试(admin/vidmuse-zeus/ai 各一份) |
| `~/Downloads/vidmuse_test/` | (sandai-code 之外的独立测试目录) |

> 跨业务通用的测试方法论放 [disciplines/testing](../../../disciplines/testing/),这里只放 vidmuse 专属的测试资产与约定。

## TODO(涉及时现场确认后回填,不臆造)
- [ ] 各测试仓的框架 / 语言 / 运行方式
- [ ] 每个仓对应测哪个子系统
- [ ] email-recall-tests 为什么要按 admin/vidmuse-zeus/ai 分三份
- [ ] CI 集成情况
