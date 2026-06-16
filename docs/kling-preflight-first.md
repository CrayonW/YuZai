## 可灵生成前置检查报告

安全原则：本报告只记录密钥是否存在和长度，不输出真实密钥。

总体状态：可以开始生成
批次：1
动作数量：4

### 密钥与鉴权

- Access Key：已配置，长度 32
- Secret Key：已配置，长度 32
- 鉴权：通过
- 鉴权状态：400 auth_accepted
- 鉴权信息：Task not found by id/external id: nonexistent-auth-probe

### 鉴权诊断

- 探测地址：https://api-beijing.klingai.com/v1/videos/image2video/nonexistent-auth-probe
- 服务端时间差：0 秒
- JWT 有效期：1800 秒
- JWT 可用起始时间：2026-06-16T12:35:38.000Z
- JWT 过期时间：2026-06-16T13:05:43.000Z
- 建议：
  - 鉴权已被服务端接受，可以继续执行 `npm run kling:preflight -- --batch 1` 或第一批生成命令。

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

- 运行 `npm run kling:generate-batch -- --batch 1` 生成缺失视频。
- 生成后运行 `npm run kling:batch-intake-checklist -- --batch 1 --write docs/kling-batch-intake-first.md`，先给用户确认清单。
