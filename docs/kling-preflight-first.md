## 可灵生成前置检查报告

安全原则：本报告只记录密钥是否存在和长度，不输出真实密钥。

总体状态：暂不能生成
批次：1
动作数量：4

### 密钥与鉴权

- Access Key：已配置，长度 32
- Secret Key：已配置，长度 32
- 鉴权：鉴权未通过
- 鉴权状态：401 auth_failed
- 鉴权信息：Auth failed

### 鉴权诊断

- 探测地址：https://api.klingai.com/v1/videos/image2video/nonexistent-auth-probe
- 服务端时间差：-1 秒
- JWT 有效期：1800 秒
- JWT 可用起始时间：2026-06-16T05:52:42.000Z
- JWT 过期时间：2026-06-16T06:22:47.000Z
- 建议：
  - 确认 Access Key 与 Secret Key 来自同一组可灵开放平台 API Key，Secret Key 复制完整，并确认该 Key 已开通开放平台 API 权限。
  - 确认该 Key 不是仅能用于网页端或其他产品入口的账号凭据。
  - 确认 KLING_API_BASE_URL 和 image2video query path 与当前可灵开放平台文档一致。

### 参考图

- 路径：assets/origin/鱼仔参考图.png
- 状态：存在

### 批次产物

- 已有视频：0
- 缺失视频：4

- groom_face_wash：missing，assets/origin/generated/kling/groom_face_wash.mp4，0 bytes
- loaf_breathing：missing，assets/origin/generated/kling/loaf_breathing.mp4，0 bytes
- cursor_watch：missing，assets/origin/generated/kling/cursor_watch.mp4，0 bytes
- click_surprised：missing，assets/origin/generated/kling/click_surprised.mp4，0 bytes

### 下一步

- 先运行 `npm run kling:auth-check` 并处理可灵开放 API 鉴权问题。
