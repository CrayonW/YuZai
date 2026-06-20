# 鱼仔桌宠试用标签记录

日期：2026-06-20

用途：记录当前第一版试用包的 Git 标签、回滚 commit 和验证证据。本文档用于把 `docs/release-playbook.md` 中的“版本标签与回滚 commit”从规范落到实际可复查记录。

## 标签信息

- 标签名：`yuzai-v0.1.0-test.1`
- 标签类型：annotated tag
- 标签说明：`YuZai desktop pet test build 1`
- 回滚 commit：`f3e8da05269f4e95195bc6ca39b12a8bf825372e`
- commit 摘要：`docs: add trial uninstall and version guidance`
- 远端标签引用：`refs/tags/yuzai-v0.1.0-test.1`

## 验证证据

创建标签前已执行：

```bash
npm run validate:release
```

验证结果：

- `validate:all` 通过。
- `validate:package` 通过。
- `release/mac-arm64/鱼仔桌面宠物.app` 生成成功。
- `app.asar` 和 `icon.icns` 存在。
- `git ls-remote --tags origin yuzai-v0.1.0-test.1` 返回 `refs/tags/yuzai-v0.1.0-test.1`。

## 回滚方式

如测试包需要回滚，优先使用该标签或 commit 在新工作区重建：

```bash
git fetch --tags
git switch --detach yuzai-v0.1.0-test.1
npm run validate:release
```

不要在当前开发工作区执行破坏性 reset。需要继续开发时，回到 `main` 或新建分支。

## 当前边界

- 本记录只确认试用标签和回滚锚点。
- 不调用可灵生成视频。
- 不新增或覆盖 `assets/runtime/animations/*/frames`。
- 不修改 `assets/runtime/animations/manifest.json`。
