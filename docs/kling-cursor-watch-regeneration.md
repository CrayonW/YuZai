# cursor_watch 重生成候选清单

日期：2026-06-16
目标：重生成鼠标靠近交互动作候选，修复原 `cursor_watch` 抽样帧中出现额外实体物体的问题。

## 当前问题

原素材：`assets/origin/generated/kling/cursor_watch.mp4`

问题证据：`assets/reviews/kling-generated/cursor_watch.png`

第三个抽样帧出现了额外实体物体，外形像小鼠/道具，不符合桌宠“鼠标靠近时小猫关注屏幕指针”的设定。该素材暂不建议直接接入 runtime。

## 本次候选生成清单

- 候选 action：`cursor_watch_clean_candidate`
- 分类：interactive
- 目标用途：替代或重生成 `cursor_watch`
- 输出路径：`assets/origin/generated/kling/cursor_watch_clean_candidate.mp4`
- 是否覆盖旧文件：否
- 是否接入 runtime：否
- 是否抽帧：否
- 是否去水印：否，本次只生成候选并审查

## 严格提示词要求

必须保留：

- 同一只鱼仔参考猫。
- 纯绿色绿幕背景。
- 正面坐姿开始，眼神、耳朵和头部轻微跟随无形光标。
- 结束回到或接近正面坐姿，方便后续切回日常序列帧。

必须排除：

- 不要出现任何动物。
- 不要出现玩具、实体鼠标、鼠标线、道具、家具、人手、食盆。
- 不要出现文字、水印、logo、边框、UI。
- 不要出现两只猫、多余肢体、断尾、畸形爪子或身体穿模。
- 不要让猫跳起、奔跑或做夸张动作。

## 生成后验收

1. 生成候选视频，不覆盖旧 `cursor_watch.mp4`。
2. 抽取候选预览图。
3. 人工检查是否仍出现实体物体、水印、文字、logo、猫咪变形或绿幕异常。
4. 通过后再决定是否把候选作为正式 `cursor_watch` 替换对象，并在替换前再次列接入清单。

## v1 初筛结果

候选视频：`assets/origin/generated/kling/cursor_watch_clean_candidate.mp4`
抽样图：`assets/reviews/kling-generated/cursor_watch_clean_candidate.png`

结果：v1 没有再出现实体小鼠/道具，但画面中出现白色星光/闪光点。该特效属于非猫元素，后续抠绿和透明序列帧播放时会造成画面脏点，因此不建议直接替换正式 `cursor_watch`。

## v2 追加清单

- 候选 action：`cursor_watch_clean_candidate_v2`
- 输出路径：`assets/origin/generated/kling/cursor_watch_clean_candidate_v2.mp4`
- 追加限制：不要出现星光、闪光、光点、粒子、魔法特效、标记点、箭头、光标图形或任何提示性视觉元素。

## v2 初筛结果

候选视频：`assets/origin/generated/kling/cursor_watch_clean_candidate_v2.mp4`
抽样图：`assets/reviews/kling-generated/cursor_watch_clean_candidate_v2.png`

结果：v2 没有出现实体小鼠/道具，但第三个抽样帧仍有很小的亮点。该亮点可能来自模型对“光标”的视觉化理解，后续透明序列帧中可能变成脏点。

## v3 追加清单

- 候选 action：`cursor_watch_clean_candidate_v3`
- 输出路径：`assets/origin/generated/kling/cursor_watch_clean_candidate_v3.mp4`
- 追加策略：不再使用“光标”表述，改为“猫咪听到或注意到画面一侧空气中的轻微动静”。画面中不能出现任何目标点、亮点或提示物。

## v3 初筛结果

候选视频：`assets/origin/generated/kling/cursor_watch_clean_candidate_v3.mp4`
抽样图：`assets/reviews/kling-generated/cursor_watch_clean_candidate_v3.png`
时间轴抽样：`assets/reviews/kling-generated/cursor_watch_clean_candidate_v3_sweep.png`

结果：v3 抽样图和更密的时间轴抽样图均未发现实体小鼠、道具、光点、星光、文字、水印或 logo。猫咪保持坐姿，只通过眼神和头部轻微朝一侧关注，适合作为 `cursor_watch` 的优先替换候选。

决定：暂不覆盖正式 `assets/origin/generated/kling/cursor_watch.mp4`，也不接入 runtime。下一步需要逐视频播放 v3，确认全程没有脏点、变形和绿幕异常；通过后再列正式替换与抽帧接入清单。
