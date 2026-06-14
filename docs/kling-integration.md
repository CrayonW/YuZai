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
KLING_API_BASE_URL=https://api.klingai.com
KLING_IMAGE_TO_VIDEO_SUBMIT_PATH=/v1/videos/image2video
KLING_IMAGE_TO_VIDEO_QUERY_PATH=/v1/videos/image2video/{task_id}
KLING_MODEL_NAME=kling-v1
KLING_MODE=std
KLING_DURATION=5
KLING_CFG_SCALE=0.5
```

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
