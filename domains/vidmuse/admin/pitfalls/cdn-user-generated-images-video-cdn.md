---
name: cdn-user-generated-images-video-cdn
type: pitfall
created: 2026-07-02
updated: 2026-07-02
tags: [vidmuse, admin, cdn, media, test-center-v2, mcp]
links: [vidmuse-admin, test-center-v2-mcp-direct-tool-call]
---

# User-generated images 路径要走 video CDN

Test Center V2 MCP artifact 需要把工具结果里的本地 `/work/...` 路径转成浏览器可访问 URL。注意: `aion-user-base/assets/images/` 下的 user-generated images 要走 video CDN,不是 image CDN。

## 当前确认事实

- MCP adapter 会扫描 result JSON 中的 URL 字段和 saved path 字段。
- URL 字段匹配已经做过大小写/下划线归一化,例如 `video_url`, `videoUrl`, `videourl` 这类都要被识别。
- nested `error.message` 会被 surfaced 到工具错误信息里。
- `/work/aion-user-base-<env>/<user>/assets/images/...` 属于用户生成媒体路径,需要 video CDN domain。

## 代码指针

- `~/Downloads/sandai-code/vidmuse-admin/apps/admin/service/test_center_v2/adapters/mcp_tool_call_adapter.py`

## 验证命令

```bash
uv run pytest apps/admin/tests/test_center_v2/test_mcp_tool_call_adapter.py -q
```

**Why:** 2026-06-25 曾确认 user-generated images 在 `aion-user-base/assets/images/` 下必须使用 video CDN。错误 CDN 会导致前端预览/下载不可用,但问题表面上可能像是工具输出、OSS 或浏览器访问问题。

**How to apply:** 排查 MCP artifact 媒体不可见时,先看 result JSON 中是 URL 还是 saved path;如果是 `/work/aion-user-base-*/.../assets/images/...`,预期 public URL 应走 video CDN。不要只按文件扩展名把 `.png/.jpg` 归到 image CDN。
