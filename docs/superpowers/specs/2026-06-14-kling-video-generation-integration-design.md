# 可灵 AI 视频生成接入设计

## 背景

项目已经有 `docs/cat-video-prompt-guide.md`，用于根据 `assets/origin/鱼仔参考图.png` 生成日常动作、交互动作和过渡动作的视频提示词。当前缺口是：提示词仍需要人工复制到外部视频生成工具。新的目标是接入可灵 AI 视频生成能力，让项目能通过本地命令批量提交图生视频任务，并把生成的视频保存到 `assets/origin/generated/kling`，后续再进入现有序列帧处理流程。

用户已经提供过可灵 Access Key 和 Secret Key。该密钥不能写入代码、文档、Git 历史、前端或 Electron 运行时。由于密钥已经出现在聊天上下文中，建议在可灵后台轮换一次，然后使用新的密钥通过环境变量接入。

## 目标

- 增加本地 CLI，读取猫咪动作提示词并调用可灵图生视频接口。
- 以 `assets/origin/鱼仔参考图.png` 作为默认参考图。
- 支持后续替换成其他猫咪参考图和猫咪特征描述。
- 输出视频统一保存到 `assets/origin/generated/kling/<action>.mp4`。
- 生成结果不直接进入运行时，必须先经过用户确认和现有序列帧转换校验。
- 所有密钥只来自环境变量。
- 不把可灵能力接入 Electron 前端，避免密钥泄漏。

## 不做的事

- 不在桌宠运行时 UI 中调用可灵。
- 不提交真实 Access Key 或 Secret Key。
- 不自动把生成视频覆盖现有 `assets/origin/鱼仔*.mp4`。
- 不自动把未经确认的视频接入 manifest。
- 不绕过现有的“生成动作前先列清单确认”规则。

## 密钥与安全

使用两个环境变量：

```text
KLING_ACCESS_KEY
KLING_SECRET_KEY
```

本地可以放在 `.env.local`，但该文件必须加入 `.gitignore`。仓库只允许提交 `.env.example`，并且只能包含变量名，不能包含真实值。

CLI 启动时必须检查：

- 缺少 `KLING_ACCESS_KEY` 时直接报错。
- 缺少 `KLING_SECRET_KEY` 时直接报错。
- 日志中只能打印 key 是否存在，不能打印 key 内容。
- 网络请求失败时不能把 Authorization header 打到控制台。

## 官方 API 依赖

实现前必须确认可灵官方 API 文档中的以下信息：

- 图生视频提交 endpoint。
- 任务查询 endpoint。
- 鉴权方式，重点确认是否使用 JWT、Bearer token、签名或其他方式。
- 请求体字段名称，例如模型名、参考图、提示词、负向提示词、时长、比例、模式。
- 图片输入格式，是 `image`、`image_url`、base64，还是 multipart。
- 响应结构中任务 id 和视频下载 url 的字段路径。
- 失败状态和错误码格式。
- 速率限制和并发限制。

如果官方文档要求的字段与本文档不同，以官方文档为准，但本地文件结构、密钥规则、输出路径和确认流程不变。

## 文件结构

建议新增或修改：

```text
scripts/kling/
  client.mjs
  jwt.mjs
  prompt-plan.mjs
  generate-video.mjs

docs/kling-action-generation-plan.json
docs/kling-integration.md
.env.example
.gitignore
```

职责说明：

| 文件 | 职责 |
| --- | --- |
| `scripts/kling/client.mjs` | 封装可灵 API 请求、任务提交、任务轮询、视频下载 |
| `scripts/kling/jwt.mjs` | 如果官方文档要求 JWT，在这里生成 token |
| `scripts/kling/prompt-plan.mjs` | 读取动作生成计划，拼接正向和负向提示词 |
| `scripts/kling/generate-video.mjs` | CLI 入口，支持生成单个 action 或批量生成 |
| `docs/kling-action-generation-plan.json` | 动作生成计划，记录 action、分类、提示词、输出路径 |
| `docs/kling-integration.md` | 中文使用说明，不包含真实密钥 |
| `.env.example` | 只记录变量名 |

## 动作生成计划

第一版动作计划使用 JSON，便于 CLI 读取，也便于人工检查。

示例：

```json
{
  "referenceImage": "assets/origin/鱼仔参考图.png",
  "catProfile": "灰白双色短毛猫，圆脸，琥珀色眼睛，白色胸口和前爪，灰色背部和尾巴，安静可爱",
  "outputRoot": "assets/origin/generated/kling",
  "video": {
    "durationSeconds": 3,
    "fps": 24,
    "aspectRatio": "4:5"
  },
  "actions": [
    {
      "action": "idle_primary",
      "category": "daily",
      "loop": true,
      "prompt": "猫咪正面坐着，保持安静自然的待机姿势，轻微呼吸起伏，偶尔眨眼，耳朵有非常轻微的自然抖动。动作幅度小，开始和结束姿势几乎一致，适合无缝循环。",
      "negativePrompt": "不要改变猫咪品种、毛色、眼睛颜色、脸型和斑纹。不要出现两只猫、多余肢体、畸形爪子、断尾、身体穿模、脸部变形。不要出现人、手、玩具、家具、食盆、文字、水印、logo、边框、UI。不要镜头运动、不要变焦、不要旋转、不要切镜头、不要背景变化。不要裁切耳朵、尾巴、脚掌或身体边缘。背景必须是纯绿色绿幕。",
      "output": "assets/origin/generated/kling/idle_primary.mp4"
    },
    {
      "action": "paw_raise",
      "category": "interactive",
      "loop": false,
      "prompt": "猫咪从正面坐姿开始，缓慢抬起一只前爪，像在向用户打招呼或回应鼠标靠近，停顿一小会儿，然后前爪自然放回地面，结束时回到接近初始坐姿。",
      "negativePrompt": "不要改变猫咪品种、毛色、眼睛颜色、脸型和斑纹。不要出现两只猫、多余肢体、畸形爪子、断尾、身体穿模、脸部变形。不要出现人、手、玩具、家具、食盆、文字、水印、logo、边框、UI。不要镜头运动、不要变焦、不要旋转、不要切镜头、不要背景变化。不要裁切耳朵、尾巴、脚掌或身体边缘。背景必须是纯绿色绿幕。",
      "output": "assets/origin/generated/kling/paw_raise.mp4"
    }
  ]
}
```

## CLI 行为

命令建议：

```bash
npm run kling:generate -- --action idle_primary
npm run kling:generate -- --all
npm run kling:generate -- --dry-run --action paw_raise
```

行为规则：

- `--dry-run` 只打印将提交的 action、分类、输出路径和提示词摘要，不发起网络请求。
- `--action <name>` 只生成单个 action。
- `--all` 批量生成计划里的全部 action。
- 如果输出文件已存在，默认跳过，除非显式传入 `--force`。
- 提交任务后轮询任务状态，直到成功、失败或超时。
- 成功后下载视频到 `assets/origin/generated/kling/<action>.mp4`。
- 失败时写清楚 action、任务 id、错误信息，但不打印密钥。

## 数据流

```text
docs/kling-action-generation-plan.json
  -> scripts/kling/prompt-plan.mjs
  -> scripts/kling/generate-video.mjs
  -> scripts/kling/client.mjs
  -> 可灵图生视频任务
  -> 任务轮询
  -> 下载 mp4
  -> assets/origin/generated/kling/<action>.mp4
  -> 用户检查视频
  -> scripts/build-runtime-animations-from-origin.mjs
  -> assets/runtime/animations/<action>/frames
```

## 错误处理

必须处理：

- 缺少环境变量。
- 参考图不存在。
- 动作计划 JSON 解析失败。
- 指定 action 不存在。
- 输出文件已存在且未传 `--force`。
- API 返回鉴权失败。
- API 返回内容安全或提示词违规。
- 任务轮询超时。
- 任务失败。
- 视频下载失败。
- 下载文件为空或不是 mp4。

## 验证

第一版验证分两层：

### 不联网验证

- `npm run kling:generate -- --dry-run --action idle_primary`
- 验证能读取计划、拼接提示词、检查参考图、显示输出路径。
- 缺少 action 时返回清晰错误。
- 缺少环境变量时 dry-run 不强制失败；真实生成必须失败。

### 联网验证

需要真实可灵密钥和网络：

- `KLING_ACCESS_KEY=... KLING_SECRET_KEY=... npm run kling:generate -- --action idle_primary`
- 生成视频保存到 `assets/origin/generated/kling/idle_primary.mp4`。
- 下载文件存在且大小大于 0。
- 人工检查视频符合：绿幕、无水印、无文字、猫咪身份一致、动作完整。

## Git 与产物

- CLI、文档、动作计划、`.env.example` 可以提交。
- `.env.local` 不能提交。
- 生成的 mp4 是否提交需要单独确认。默认先作为待验收素材，不自动加入 Git。
- 通过人工验收并准备进入运行时后，再按现有流程提交源视频和序列帧。

## 后续扩展

- 批量生成所有 `daily` 动作。
- 批量生成所有 `interactive` 动作。
- 支持更换参考图和猫咪特征。
- 支持从 `docs/cat-video-prompt-guide.md` 自动生成动作计划。
- 支持生成后自动抽首帧预览图，方便用户挑选。
- 支持记录每次生成任务 id、模型、提示词版本和下载路径。
