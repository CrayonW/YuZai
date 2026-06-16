## 可灵生成前置检查报告

安全原则：本报告只记录密钥是否存在和长度，不输出真实密钥。

总体状态：可以开始生成
批次：remaining-state-and-variety
动作数量：6

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
- JWT 可用起始时间：2026-06-16T12:59:07.000Z
- JWT 过期时间：2026-06-16T13:29:12.000Z
- 建议：
  - 鉴权已被服务端接受，可以继续执行 `npm run kling:preflight -- --batch 1` 或第一批生成命令。

### 参考图

- 路径：assets/origin/鱼仔参考图.png
- 状态：存在

### 批次产物

- 已有视频：0
- 缺失视频：6

- desk_sniff：missing，assets/origin/generated/kling/desk_sniff.mp4，0 bytes
- stretch_yawn：missing，assets/origin/generated/kling/stretch_yawn.mp4，0 bytes
- poke_annoyed：missing，assets/origin/generated/kling/poke_annoyed.mp4，0 bytes
- shy：missing，assets/origin/generated/kling/shy.mp4，0 bytes
- dragging：missing，assets/origin/generated/kling/dragging.mp4，0 bytes
- call_response：missing，assets/origin/generated/kling/call_response.mp4，0 bytes

### 下一步

- 运行 `npm run kling:generate-batch -- --batch remaining-state-and-variety` 生成缺失视频。
- 生成后运行 `npm run kling:batch-intake-checklist -- --batch remaining-state-and-variety --write docs/kling-batch-intake-remaining-state-and-variety.md`，先给用户确认清单。
