# 📦 打包资源目录

此目录存放应用打包所需的资源文件。

## 必需文件

| 文件 | 用途 | 如何生成 |
|------|------|----------|
| `icon.ico` | Windows 应用图标 | 从鱼仔照片生成 256×256 ico |
| `icon.icns` | macOS 应用图标 | 从鱼仔照片生成 icns |
| `entitlements.mac.plist` | macOS 权限声明 | ✅ 已就位 |

## 从照片生成图标

推荐使用在线工具：

1. **Windows (ico)**: https://www.icoconverter.com/
   - 上传鱼仔头像照片
   - 选择 256×256 + 48×48 + 32×32 + 16×16
   
2. **macOS (icns)**: https://cloudconvert.com/png-to-icns
   - 上传 1024×1024 的鱼仔头像 PNG

> 也可以使用 Photoshop / Figma 手动导出。图标建议使用鱼仔的大头照或萌照。

## 说明

- 目前图标为占位状态，打包前需要补充
- macOS 版本使用 `entitlements.mac.plist` 声明必要权限
- 后续可以添加安装向导图片等资源
