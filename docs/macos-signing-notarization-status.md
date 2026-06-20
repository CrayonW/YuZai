# macOS 签名与公证状态报告

更新日期：2026-06-20

记录 macOS 签名、公证和签名后安全复核的当前事实。本文档不执行签名、不上传公证、不关闭 release blocker。

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

- macos_sign_notarize：open
- signed_user_safety_recheck：open

## 关闭前必须完成

- 配置正式 Developer ID Application 签名身份
- 移除本地验证包的 identity=null 或按正式发布配置签名
- 完成 macOS notarization
- 验证 Gatekeeper 首次打开体验
- 在签名/公证包上复核普通用户安装安全提示
- 重新运行 npm run validate:release

## 当前边界

- 本报告只读取本地配置和预期 release app 路径。
- 本报告不执行签名、不调用 notarytool、不上传 Apple 公证。
- 本报告不关闭 `macos_sign_notarize` 或 `signed_user_safety_recheck`。
- 当前若 `identity=null`，表示本地验证包显式跳过签名。
