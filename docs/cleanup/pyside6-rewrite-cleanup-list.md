# PySide6 重写清理清单

## 必须保留

- `assets/origin/鱼仔参考图.png`
- `assets/origin/鱼仔前肢抬起视频.mp4`
- `assets/origin/鱼仔左右转头看动作.mp4`
- `assets/origin/鱼仔待机动作1.mp4`
- `assets/origin/鱼仔待机动作2.mp4`
- `assets/origin/鱼仔晃动尾巴视频.mp4`
- `assets/origin/鱼仔走路视频.mp4`
- `.gitignore`
- `build/icon.png`
- `build/icon.ico`
- `docs/superpowers/specs/2026-06-30-pyside6-rewrite-design.md`
- `docs/superpowers/plans/2026-06-30-pyside6-rewrite.md`

## 第一批删除：旧 Electron/Node 主线

- `electron/`
- `src/`
- `esbuild.config.mjs`
- `tsconfig.json`
- `package.json`
- `package-lock.json`
- `node_modules/`

## 第二批删除：旧视频、Pixi、Kling、runtime-intake 脚本

- `scripts/`
- `docs/cat-behavior-schedule.json`
- `docs/superpowers/specs/2026-06-30-pixi-layered-pet-design.md`
- `docs/superpowers/plans/2026-06-30-pixi-layered-pet.md`

## 第三批删除：旧运行时产物

- `assets/runtime/`
- `assets/sprites/`
- `assets/config/`

## 新增主线

- `requirements.txt`
- `pyproject.toml`
- `yuzai_pet/`
- `assets/yuzai/`
- `tests/`
- `packaging/pyinstaller/`
