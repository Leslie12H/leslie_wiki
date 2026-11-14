---
name: sisyphus-vidmuse-ui-full-captcha-and-empty-prompt
type: pitfall
created: 2026-11-14
updated: 2026-11-14
tags: [sisyphus, vidmuse, ui, captcha, regression]
links: [sisyphus, vidmuse-testing]
---

# VidMuse UI 全量回归的滑块重试和空提示词断言

**Why：** 2026-11-14 的 Sisyphus `RUN-20261114-0004` Attempt 1 中，`online / ui-full` 首次请求邮箱验证码收到 HTTP 422，业务码 `00102`。已部署的测试代码把该业务码判为不可重试，备用 Session Cookie 通过 profile 校验后套件继续执行。实际失败的空提示词用例在查找指定 Toast 时超时，尚未执行创建请求断言。滑块定位置信度、provider 校验、备用会话和业务断言分别查证。

**How to apply：** 在 Sisyphus Run 详情定位实际 Runner 和测试提交。对照 `world-sim-dev/vidmuse_test` 的 `utils/ui_email_login.py`、`tests/unit/ui/test_email_login.py` 以及 `world-sim-dev/vidmuse.ai` 的 `apps/vidmuse/src/api/Api.ts`，核对具体操作、HTTP 状态和业务码。该案的业务码应沿有限次数重新打开登录页获取新挑战。未知 422 保留原错误。空提示词回归沿 `tests/ui/thread/test_home_p0.py`，按 Enter 前监听创建接口，并核对按钮禁用、无 POST 和页面未跳转。Toast 是否展示可在对应 UI 契约中单独取证。

历史证据指针为 Sisyphus `RUN-20261114-0004` Attempt 1 及 Runner Job `sisyphus-run-20261114-0004-1`，测试源版本见 [vidmuse_test 476e0c72](https://github.com/world-sim-dev/vidmuse_test/commit/476e0c7253c31e0cec48d029dd68f2542c02642d)。线上验收时以新 Run 的实际测试 SHA、验证码尝试事件及空提示词用例结果为准。
