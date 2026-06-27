# macOS 签名与公证状态报告

更新日期：2026-06-27

记录 macOS 签名、公证和签名后安全复核的当前事实。用户已确认项目只在本人电脑本机运行，因此正式签名、公证和签名后安全复核不再作为项目完成阻塞。

## 当前包

- 产品名：鱼仔桌面宠物
- app 路径：release/mac-arm64/鱼仔桌面宠物.app
- 本地验证命令：npm run validate:release

## 签名与公证配置

- 签名 identity：null
- 是否显式未签名：是
- 是否配置正式签名身份：否
- 是否发现公证配置：否

## blocker 状态

- macos_sign_notarize：canceled
- signed_user_safety_recheck：canceled

## 关闭前必须完成

- 本机自用继续使用 npm run validate:release 生成本地验证包
- 若未来改为对外分发，再重新启用 Developer ID 签名、公证和普通用户安全提示复核

## 当前边界

- 本报告只读取本地配置和预期 release app 路径。
- 本报告不执行签名、不调用 notarytool、不上传 Apple 公证。
- `macos_sign_notarize` 和 `signed_user_safety_recheck` 已按用户本机自用口径取消。
- 当前若 `identity=null`，表示本地验证包显式跳过签名。
