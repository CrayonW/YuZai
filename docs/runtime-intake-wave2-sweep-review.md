# 第二波/暂缓动作时间轴抽样审查

日期：2026-06-17
范围：第一波暂缓接入的日常、睡眠、拖拽和互动变化候选。
目的：在不修改 runtime、不抽取运行帧、不改 manifest 的前提下，补充更密的时间轴证据，方便后续决定第二波接入顺序。
机器可读执行计划：`docs/runtime-intake-waves.json` 中的 `wave2`、`sleep-routine` 和 `dragging-special`。
执行前用户确认清单：

- `docs/runtime-intake-wave2-execution-checklist.md`
- `docs/runtime-intake-sleep-routine-execution-checklist.md`
- `docs/runtime-intake-dragging-special-execution-checklist.md`

接入前预检报告：

- `docs/runtime-intake-wave2-preflight.md`
- `docs/runtime-intake-sleep-routine-preflight.md`
- `docs/runtime-intake-dragging-special-preflight.md`

## 审查边界

- 本次只审查 `assets/origin/generated/kling/*.mp4` 的时间轴抽样图。
- 本次没有执行去水印、抠绿、序列帧生成或 runtime manifest 接入。
- 本次结论不能替代正式接入前的逐视频播放检查。
- 后续正式处理前仍需要先列清单给用户确认。
- `npm run validate:runtime-intake-waves` 会检查每个候选是否具备来源视频、审查证据、衔接策略、桥接入口和确认状态。

## 抽样证据

| action | 抽样图 | 视觉结论 | 当前建议 |
| --- | --- | --- | --- |
| `groom_face_wash` | `assets/reviews/kling-generated/groom_face_wash_sweep.png` | 未发现文字、水印、logo 或额外物体；洗脸/舔爪动作语义清楚，起止都接近正坐姿。 | 适合作为第二波日常生活动作候选，建议低频插入。 |
| `loaf_breathing` | `assets/reviews/kling-generated/loaf_breathing_sweep.png` | 未发现文字、水印、logo 或额外物体；动作幅度很小，更像正坐轻呼吸而不是完整香箱趴。 | 可作为低疲劳待机补充；如果要表现香箱趴，需后续重新生成更明确的趴姿素材。 |
| `desk_sniff` | `assets/reviews/kling-generated/desk_sniff_sweep.png` | 未发现文字、水印、logo 或额外物体；头部左右观察和嗅闻感明显。 | 适合作为鼠标靠近后的好奇探索或日常探索候选。 |
| `sleepy` | `assets/reviews/kling-generated/sleepy_sweep.png` | 未发现文字、水印、logo 或额外物体；主要是眨眼、低头和变困表情，仍保持正坐姿。 | 适合作为睡眠链入口前的短过渡。 |
| `sleep` | `assets/reviews/kling-generated/sleep_sweep.png` | 未发现文字、水印、logo 或额外物体；从坐姿进入蜷伏睡姿，姿态变化最明显。 | 适合作为入睡过渡动作，接入时需要锁定播放结束再进入睡眠循环。 |
| `sleeping` | `assets/reviews/kling-generated/sleeping_sweep.png` | 未发现文字、水印、logo 或额外物体；抽样中仍接近正坐轻闭眼，睡着语义不如 `sleep` 明确。 | 可作为低能量循环候选；不建议单独当作真正睡眠循环。 |
| `waking` | `assets/reviews/kling-generated/waking_sweep.png` | 未发现文字、水印、logo 或额外物体；有从低能量到正坐、尾巴/朝向变化的过渡感。 | 适合作为睡眠链结束后回到日常动作的过渡。 |
| `shy` | `assets/reviews/kling-generated/shy_sweep.png` | 未发现文字、水印、logo 或额外物体；低头、侧看、回正的反应清楚。 | 适合作为互动结束后的短反应，可放在第二波互动变化。 |
| `dragging` | `assets/reviews/kling-generated/dragging_sweep.png` | 未发现文字、水印、logo 或额外物体；整体动作幅度较小，更像正坐等待。 | 暂时保留为低优先级；真正拖拽需要和窗口移动手感一起专项验收。 |

## 第二波建议分组

### 日常生活动作

- `groom_face_wash`：低频生活化动作，建议接在 `idle_primary` 或 `look_around` 后。
- `desk_sniff`：可以和鼠标靠近相关联，也可以作为日常探索动作。
- `loaf_breathing`：更像静态呼吸，适合补充长待机低疲劳循环。

### 睡眠链路

建议按链路成组设计，避免硬切：

1. `sleepy`：变困提示，短过渡。
2. `sleep`：入睡动作，locked 播放到结束。
3. `sleeping` 或后续更明确睡眠循环：长时间低能量循环。
4. `waking`：醒来过渡，结束后回到 `idle_primary` 或低疲劳 daily。

### 互动变化

- `shy`：适合用于长时间注视、连续点击后的轻反应，播放结束回到日常。
- `dragging`：暂不建议进入第二波通用接入，等拖拽专项时与窗口移动事件一起验证。

## 后续门禁

正式进入第二波 runtime 前必须重新列清单确认，且至少包含：

1. 本波实际接入的 action 名称和来源视频。
2. 每个 action 的分类：`daily`、`interactive`、`transition` 或 `sleep-routine`。
3. 每个 action 的衔接策略：起始动作、结束返回动作、安全帧或锁定播放策略。
4. 去水印/抠绿/裁切处理方式。
5. 桌面验收命令和预期截图或录屏证据。

## 自动验证

```bash
npm run validate:runtime-intake-waves
npm run validate:runtime-intake-checklists-current
npm run validate:runtime-intake-preflights-current
npm run validate:release
```

验证通过只代表接入计划完整，不代表已经批准或完成 runtime 抽帧接入。
