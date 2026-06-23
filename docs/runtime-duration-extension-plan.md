# runtime 动作时长补长清单

更新日期：2026-06-23

把 runtime_duration_short blocker 拆成可执行的补长动作清单。本文档不批准生成视频、抽帧、去水印或修改 manifest。

## 当前摘要

- runtime 时长不足动作数：0
- daily：0
- interactive：0
- transition：0

## 补长动作清单

| action | 分类 | 当前 | 契约目标 | 缺口 | 预期源视频 | 补长策略 |
| --- | --- | ---: | ---: | ---: | --- | --- |

## 处理规则

- 不得只修改 manifest 帧数来关闭时长缺口。
- 每个补长动作必须先补充更长源视频或分段素材，并完成人工水印检查。
- 进入 runtime 前必须完成去水印、抠绿、抽帧和 manifest 更新。
- 关闭 `runtime_duration_short` 前必须重新运行 `npm run animations:asset-contract -- --write docs/animation-asset-contract.md`、`npm run validate:all`、`npm run validate:release`。
- 涉及桌面观感的补长动作关闭前必须补充桌面多帧截图或录屏证据。

## 推荐执行顺序

1. 先补 `idle_primary`、`idle_secondary`、`tail_wag`，降低最常见待机重复感。
2. 再补 `groom_face_wash`、`loaf_breathing`、`sleeping` 等长时间陪伴动作。
3. 然后补 16 方向 `look_*` 鼠标跟随动作，让鼠标停留时动作长度足够。
4. 最后补短交互动作 `paw_raise`、`walk` 和睡眠链路中仍短的动作。

## 当前边界

- 本清单当前没有剩余补长范围。
- 本清单可作为 `runtime_duration_short` blocker 的关闭证据之一。
- 后续如替换更自然源视频，仍需重新生成处理清单并补桌面验收。
