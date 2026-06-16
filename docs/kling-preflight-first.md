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
