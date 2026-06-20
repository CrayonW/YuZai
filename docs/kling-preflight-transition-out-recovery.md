## 可灵生成前置检查报告

安全原则：本报告只记录密钥是否存在和长度，不输出真实密钥。

总体状态：可以开始生成
批次：transition-out-recovery
动作数量：4

### 密钥与鉴权

- Access Key：已配置，长度 32
- Secret Key：已配置，长度 32
- 鉴权：已跳过
- 鉴权状态：- skipped
- 鉴权信息：Skipped by --skip-auth

### 参考图

- 路径：assets/origin/鱼仔参考图.png
- 状态：存在

### 批次产物

- 已有视频：0
- 缺失视频：4

- sleep_to_sleeping：missing，assets/origin/generated/kling/sleep_to_sleeping.mp4，0 bytes
- waking_to_idle：missing，assets/origin/generated/kling/waking_to_idle.mp4，0 bytes
- poke_annoyed_to_idle：missing，assets/origin/generated/kling/poke_annoyed_to_idle.mp4，0 bytes
- paw_raise_to_idle：missing，assets/origin/generated/kling/paw_raise_to_idle.mp4，0 bytes

### 下一步

- 运行 `npm run kling:generate-batch -- --batch transition-out-recovery` 生成缺失视频。
- 生成后运行 `npm run kling:batch-intake-checklist -- --batch transition-out-recovery --write docs/kling-batch-intake-transition-out-recovery.md`，先给用户确认清单。
