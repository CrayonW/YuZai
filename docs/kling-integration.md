# 可灵 AI 视频生成接入说明

本项目通过本地 CLI 调用可灵图生视频接口，生成桌宠动作素材。CLI 只用于素材生产，不会接入 Electron 桌宠运行时。

## 密钥配置

使用环境变量：

```text
KLING_ACCESS_KEY
KLING_SECRET_KEY
```

推荐把密钥放到本机 `.env.local`，该文件已被 `.gitignore` 忽略，不能提交到 Git。

```text
KLING_ACCESS_KEY=你的 Access Key
KLING_SECRET_KEY=你的 Secret Key
```

如果官方 API 文档字段变化，可以在 `.env.local` 里覆盖：

```text
KLING_API_BASE_URL=https://api-beijing.klingai.com
KLING_IMAGE_TO_VIDEO_SUBMIT_PATH=/v1/videos/image2video
KLING_IMAGE_TO_VIDEO_QUERY_PATH=/v1/videos/image2video/{task_id}
KLING_MODEL_NAME=kling-v2-6
KLING_MODE=std
KLING_DURATION=5
KLING_CFG_SCALE=0.5
```

说明：`KLING_DURATION` 只是兜底值。动作计划里的 `durationSeconds` 表示桌宠设计目标时长；`generationDurationSeconds` 表示当前可灵 API 实际提交时长。2026-06-16 实测当前模型/模式拒绝 8 秒生成，因此第一版统一用 `generationDurationSeconds: 5` 跑通生成链路，运行时再通过序列帧循环和动作调度保持日常动作的陪伴时长。

## 动作计划

动作计划文件：

```text
docs/kling-action-generation-plan.json
```

它定义：

- 参考图：`assets/origin/鱼仔参考图.png`
- 猫咪特征描述
- 输出目录：`assets/origin/generated/kling`
- 日常动作、交互动作、过渡动作的提示词
- 每个动作的 `durationSeconds`、减少重复感说明和最小冷却时间

计划质量校验：

```bash
npm run validate:kling-plan-quality
```

该命令会检查日常动作数量、交互动作数量、日常动作时长、水印/logo 排除、输出路径和减少重复感字段，避免动作计划退回到短促重复的状态。

## Dry Run

先 dry-run 检查提示词和输出路径，不会发起网络请求，也不需要密钥。

```bash
npm run kling:generate -- --dry-run --action idle_primary
npm run kling:generate -- --dry-run --all
```

## 鉴权检查

真实生成前可以先检查密钥是否能通过可灵 API 鉴权。这个命令只查询一个不存在的任务，不会生成视频。

```bash
npm run kling:auth-check
```

如果返回 `kind: "auth_failed"`，说明当前 `KLING_ACCESS_KEY` 和 `KLING_SECRET_KEY` 没有通过可灵鉴权。常见原因是 Secret Key 不匹配、密钥已失效、密钥没有开放平台 API 权限，或需要在可灵后台重新生成 API Key。

## 真实生成

生成单个动作：

```bash
npm run kling:generate -- --action idle_primary
```

批量生成：

```bash
npm run kling:generate -- --all
```

如果输出文件已存在，默认跳过。需要覆盖时使用：

```bash
npm run kling:generate -- --action idle_primary --force
```

## 输出与验收

生成视频会保存到：

```text
assets/origin/generated/kling/<action>.mp4
```

生成后不要直接接入运行时，先人工检查：

- 是否为纯绿色绿幕背景
- 是否无水印、无文字、无 logo
- 猫咪身份是否与参考图一致
- 是否全身入镜，没有裁切耳朵、尾巴、脚掌
- 动作是否平稳，开始和结束是否适合循环或回切

确认可用后，再按现有流程转透明序列帧并更新 manifest。

## 2026-06-14 联调记录

使用本地 `.env.local` 中的密钥执行过一次 `idle_primary` 真实生成请求。网络请求成功到达可灵 API，但接口返回 `401 / Auth failed`。随后使用假任务 id 做鉴权探针，确认：

- `Authorization: Bearer <JWT>` 格式正确。
- 反向使用 key 会返回 `access key not found`。
- 正常方向返回 `Auth failed`。
- 可灵服务器时间与本机时间一致，不是 JWT 时间漂移问题。

当前判断：Access Key 可被服务识别，但 Secret Key 不匹配、已失效或该 key 没有开放平台 API 权限。需要在可灵后台轮换或重新创建 API Key 后，再运行 `npm run kling:auth-check`。

## 2026-06-15 直接接入验证记录

按用户确认，已直接使用本机 `.env.local` 中的可灵 key 进行联调；密钥只保存在本地忽略文件中，没有写入代码、文档或提交历史。

已验证：

- `.env.local` 能被 CLI 正确读取，`KLING_ACCESS_KEY` 和 `KLING_SECRET_KEY` 均存在。
- `npm run kling:auth-check` 能访问可灵 API，但返回 `401 / Auth failed`。
- `npm run kling:generate -- --action idle_primary` 能把图生视频请求提交到可灵 API，但返回 `HTTP 401`，响应包含 `code: 1002` 和 `message: "Auth failed"`。

当前结论：项目侧的 CLI、提示词计划、参考图读取、JWT 生成、请求提交链路已经接入；当前阻塞点仍是这组 key 没有通过可灵开放 API 鉴权。密钥可用前，不能生成真实视频文件，也不能把可灵产物接入 `assets/origin` 或运行时序列帧。

## 2026-06-16 直接接入复测记录

按用户要求“不用再问，直接使用已提供 key”，再次执行 `npm run kling:auth-check`。结果仍为 `401 / Auth failed`，可灵服务端返回时间为 `Tue, 16 Jun 2026 00:26:17 GMT`。

本次同时做了不泄露密钥内容的本地诊断：

- `.env.local` 已被读取。
- `KLING_ACCESS_KEY` 存在，长度为 32。
- `KLING_SECRET_KEY` 存在，长度为 32。
- 未把真实 key 写入仓库文件。

当前结论不变：项目侧可灵 CLI 已接入，当前不能真实生成视频的原因仍是这组 key 没有通过可灵开放 API 鉴权。下一次换 key 或开放平台权限调整后，先运行 `npm run kling:auth-check`；通过后再按 `docs/kling-generation-batches.md` 选择批次执行 `npm run kling:generate-batch -- --batch <batch-id>`，生成后先刷新素材清单和统一审查报告，再处理素材。

## 2026-06-16 鉴权诊断增强记录

再次执行 `npm run kling:auth-check`，结果仍为 `401 / Auth failed`。本次 `auth-check` 已增强为结构化诊断输出，仍不输出真实 key 内容。

本次诊断字段：

- Access Key：已配置，只输出长度。
- Secret Key：已配置，只输出长度。
- API 探测地址：输出 baseUrl、probePath 和 probeUrl。
- JWT：输出算法、有效期、nbf 偏移、签发时间、可用起始时间和过期时间。
- 服务端时间差：输出 `serverClockSkewSeconds`，本次为 0 秒。
- 建议：检查 Access Key/Secret Key 是否同组、Secret Key 是否完整、该 Key 是否开通开放平台 API 权限，以及 API base/path 是否仍符合当前可灵开放平台文档。

当前判断：JWT 时间窗和本机时间不是主要问题；更可能是 key/权限/API 入口配置问题。真实视频生成仍不能继续，第一批动作仍需等 `npm run kling:auth-check` 返回 `ok: true` 后再执行。

## 2026-06-16 官方入口修正与余额状态

通过可灵官方文档页 `https://klingai.com/document-api/apiReference%2Fmodel%2FimageToVideo` 核对图生视频接口，官方示例使用：

```text
POST https://api-beijing.klingai.com/v1/videos/image2video
Authorization: Bearer <token>
model_name: kling-v2-6
duration: 5
```

本次已同步项目默认配置：

- 默认 API base URL 改为 `https://api-beijing.klingai.com`。
- 默认模型改为 `kling-v2-6`。
- 本机 `.env.local` 的非密钥配置已同步到北京 API 入口和 `kling-v2-6`。
- `docs/kling-action-generation-plan.json` 新增 `generationDurationSeconds: 5`，保留原 `durationSeconds` 作为桌宠动作设计目标。

验证结果：

- `npm run kling:auth-check` 返回 `ok: true`，探测任务返回 `400 auth_accepted` 和 “Task not found”，说明 JWT 和 key 已被服务端接受。
- `npm run kling:preflight -- --batch 1` 显示“可以开始生成”。
- `npm run kling:generate-batch -- --batch 1` 已进入真实提交，但返回 `HTTP 429`，错误信息为 `Account balance not enough`。

当前结论：项目侧可灵 API 接入已打通到真实业务接口；当前不能生成第一批视频的原因变为账号余额不足，不再是鉴权或接口入口问题。余额补足后，继续执行 `npm run kling:generate-batch -- --batch 1` 即可从第一批 `groom_face_wash` 开始生成。

## 2026-06-16 直接使用本地 key 复测记录

按用户要求“直接接入，不用再问”，本次直接使用本机 `.env.local` 中已配置的可灵 key 执行联调；真实密钥仍只保存在本地忽略文件中，没有写入代码、文档或提交历史。

执行结果：

- `npm run kling:auth-check` 返回 `ok: true`，可灵服务端接受 JWT 和 key。
- `npm run kling:preflight -- --batch 1` 显示“可以开始生成”，第一批 4 个视频仍缺失。
- `npm run kling:generate-batch -- --batch 1` 已提交到图生视频业务接口，但返回 `HTTP 429` 和 `Account balance not enough`。
- `npm run kling:batch-status -- --batch 1 --last-error "<最近一次错误>"` 可刷新第一批状态，阻塞类型为“余额不足”。

当前结论：项目侧可灵接入已按当前 key 打通到真实业务接口；现在不是鉴权失败，也不是项目代码未接入，而是可灵账号余额不足。余额补足后，从下面命令继续：

```bash
npm run kling:generate-batch -- --batch 1
```

生成成功后，先刷新素材清单并给用户确认，再进入水印检查、去水印、抽帧和 runtime manifest 接入。

## 2026-06-30 文档清理记录

已清理早期批次执行过程中生成的临时 preflight、batch-status、batch-intake 和分拆审查文档。后续查询动作批次与生成状态时，以 `docs/kling-generation-batches.md`、`docs/kling-generated-video-audit.md` 和当前仍被发布校验引用的 transition-out/runtime-intake 证据文档为准。
