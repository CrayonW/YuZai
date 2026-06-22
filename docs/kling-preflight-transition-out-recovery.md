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

- 已有视频：4
- 缺失视频：0

- sleep_to_sleeping：ready，assets/origin/generated/kling/sleep_to_sleeping.mp4，8204002 bytes
- waking_to_idle：ready，assets/origin/generated/kling/waking_to_idle.mp4，6501686 bytes
- poke_annoyed_to_idle：ready，assets/origin/generated/kling/poke_annoyed_to_idle.mp4，6767911 bytes
- paw_raise_to_idle：ready，assets/origin/generated/kling/paw_raise_to_idle.mp4，6749702 bytes

### 下一步

- 进入人工验收、去水印、抽帧和 runtime manifest 接入流程。
