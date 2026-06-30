# PySide6 Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old Electron/Pixi/video-generation project with a clean Python + PySide6 fish-cat desktop pet that runs on macOS and Windows.

**Architecture:** Build a small native Qt desktop pet runtime from scratch. Keep original fish-cat source material under `assets/origin/`, create a new `yuzai_pet/` Python package, and use PNG frame actions configured by `assets/yuzai/pet.json`.

**Tech Stack:** Python 3.12, PySide6, pytest, PyInstaller.

---

## File Structure

- `requirements.txt`: runtime and development dependencies.
- `pyproject.toml`: pytest config and package metadata.
- `README.md`: Chinese project instructions for the new PySide6 route.
- `yuzai_pet/__init__.py`: package version.
- `yuzai_pet/__main__.py`: `python -m yuzai_pet` entry.
- `yuzai_pet/app.py`: QApplication creation and app bootstrap.
- `yuzai_pet/config.py`: asset paths, app config, persisted user settings.
- `yuzai_pet/animation.py`: PNG frame action loader and animation state machine.
- `yuzai_pet/behavior.py`: idle/hover/drag behavior transitions.
- `yuzai_pet/pet_window.py`: transparent always-on-top Qt pet window.
- `yuzai_pet/platform_window.py`: platform-specific window flags and config directory helpers.
- `assets/yuzai/pet.json`: fish-cat action config.
- `assets/yuzai/actions/idle/frame_000.png`: first initial runtime frame copied from the reference image.
- `assets/yuzai/actions/hover/frame_000.png`: initial hover runtime frame.
- `assets/yuzai/actions/drag/frame_000.png`: initial drag runtime frame.
- `tests/test_config.py`: config loading tests.
- `tests/test_animation.py`: animation player tests.
- `tests/test_behavior.py`: behavior transition tests.
- `packaging/pyinstaller/yuzai.spec`: PyInstaller packaging entry.
- `docs/cleanup/pyside6-rewrite-cleanup-list.md`: explicit deletion and retention list.

## Task 1: Record Cleanup List

**Files:**
- Create: `docs/cleanup/pyside6-rewrite-cleanup-list.md`

- [ ] **Step 1: Write the cleanup list**

Create `docs/cleanup/pyside6-rewrite-cleanup-list.md`:

```markdown
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
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/cleanup/pyside6-rewrite-cleanup-list.md
git commit -m "docs: list pyside6 rewrite cleanup scope"
```

Expected: commit succeeds and only the cleanup document is included.

## Task 2: Remove Old Mainline Files

**Files:**
- Delete: `electron/`
- Delete: `src/`
- Delete: `esbuild.config.mjs`
- Delete: `tsconfig.json`
- Delete: `package.json`
- Delete: `package-lock.json`
- Delete: `node_modules/`
- Delete: `scripts/`
- Delete: `assets/runtime/`
- Delete: `assets/sprites/`
- Delete: `assets/config/`
- Delete: `docs/cat-behavior-schedule.json`
- Delete: `docs/superpowers/specs/2026-06-30-pixi-layered-pet-design.md`
- Delete: `docs/superpowers/plans/2026-06-30-pixi-layered-pet.md`

- [ ] **Step 1: Confirm preserved origin assets**

Run:

```bash
find assets/origin -maxdepth 1 -type f | sort
```

Expected output includes all seven origin files listed in Task 1.

- [ ] **Step 2: Delete old files**

Run:

```bash
git rm -r electron src scripts assets/runtime assets/sprites assets/config
git rm esbuild.config.mjs tsconfig.json package.json package-lock.json docs/cat-behavior-schedule.json docs/superpowers/specs/2026-06-30-pixi-layered-pet-design.md docs/superpowers/plans/2026-06-30-pixi-layered-pet.md
rm -rf node_modules
```

Expected: tracked old files are staged for deletion. `node_modules/` is removed from disk if present.

- [ ] **Step 3: Verify origin assets still exist**

Run:

```bash
test -f assets/origin/鱼仔参考图.png
test -f assets/origin/鱼仔待机动作1.mp4
```

Expected: both commands exit with status 0.

- [ ] **Step 4: Commit**

Run:

```bash
git status --short
git commit -m "chore: remove abandoned electron animation pipeline"
```

Expected: commit succeeds and origin assets are not deleted.

## Task 3: Add Python Project Skeleton

**Files:**
- Create: `requirements.txt`
- Create: `pyproject.toml`
- Create: `yuzai_pet/__init__.py`
- Create: `yuzai_pet/__main__.py`
- Create: `yuzai_pet/app.py`

- [ ] **Step 1: Create dependency files**

Create `requirements.txt`:

```text
PySide6>=6.6.0
pyinstaller>=6.5.0
pytest>=8.0.0
```

Create `pyproject.toml`:

```toml
[project]
name = "yuzai-desktop-pet"
version = "0.1.0"
description = "鱼仔桌面宠物 PySide6 版本"
requires-python = ">=3.12"

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["."]
```

- [ ] **Step 2: Create package entry files**

Create `yuzai_pet/__init__.py`:

```python
__version__ = "0.1.0"
```

Create `yuzai_pet/__main__.py`:

```python
from yuzai_pet.app import main

if __name__ == "__main__":
    raise SystemExit(main())
```

Create `yuzai_pet/app.py`:

```python
import sys

from PySide6.QtWidgets import QApplication


def main(argv: list[str] | None = None) -> int:
    app = QApplication(sys.argv if argv is None else argv)
    app.setApplicationName("鱼仔桌面宠物")
    return app.exec()
```

- [ ] **Step 3: Verify import**

Run:

```bash
python -m py_compile yuzai_pet/__init__.py yuzai_pet/__main__.py yuzai_pet/app.py
```

Expected: no output and exit status 0.

- [ ] **Step 4: Commit**

Run:

```bash
git add requirements.txt pyproject.toml yuzai_pet
git commit -m "feat: add pyside6 app skeleton"
```

Expected: commit succeeds.

## Task 4: Add Config Loader

**Files:**
- Create: `yuzai_pet/config.py`
- Create: `tests/test_config.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_config.py`:

```python
import json
from pathlib import Path

from yuzai_pet.config import ActionConfig, PetConfig, load_pet_config


def test_load_pet_config(tmp_path: Path) -> None:
    config_path = tmp_path / "pet.json"
    config_path.write_text(
        json.dumps(
            {
                "window": {"width": 320, "height": 240, "scale": 1.0},
                "behavior": {"hoverDistance": 80},
                "actions": {
                    "idle": {"path": "actions/idle", "fps": 8, "loop": True},
                    "hover": {"path": "actions/hover", "fps": 10, "loop": False},
                },
            }
        ),
        encoding="utf-8",
    )

    config = load_pet_config(config_path)

    assert isinstance(config, PetConfig)
    assert config.window_width == 320
    assert config.window_height == 240
    assert config.hover_distance == 80
    assert config.actions["idle"] == ActionConfig(path="actions/idle", fps=8, loop=True)
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pytest tests/test_config.py -q
```

Expected: FAIL because `yuzai_pet.config` does not exist.

- [ ] **Step 3: Implement config loader**

Create `yuzai_pet/config.py`:

```python
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class ActionConfig:
    path: str
    fps: int
    loop: bool


@dataclass(frozen=True)
class PetConfig:
    window_width: int
    window_height: int
    scale: float
    hover_distance: int
    actions: dict[str, ActionConfig]


def load_pet_config(path: Path) -> PetConfig:
    raw = json.loads(path.read_text(encoding="utf-8"))
    window = raw["window"]
    behavior = raw["behavior"]
    actions = {
        name: ActionConfig(
            path=str(action["path"]),
            fps=int(action["fps"]),
            loop=bool(action["loop"]),
        )
        for name, action in raw["actions"].items()
    }
    return PetConfig(
        window_width=int(window["width"]),
        window_height=int(window["height"]),
        scale=float(window["scale"]),
        hover_distance=int(behavior["hoverDistance"]),
        actions=actions,
    )
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pytest tests/test_config.py -q
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add yuzai_pet/config.py tests/test_config.py
git commit -m "feat: add pet config loader"
```

Expected: commit succeeds.

## Task 5: Add Animation State Machine

**Files:**
- Create: `yuzai_pet/animation.py`
- Create: `tests/test_animation.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_animation.py`:

```python
from pathlib import Path

from yuzai_pet.animation import AnimationPlayer
from yuzai_pet.config import ActionConfig


def write_frame(path: Path) -> None:
    path.write_bytes(b"fake-png")


def test_animation_player_loops_frames(tmp_path: Path) -> None:
    action_dir = tmp_path / "idle"
    action_dir.mkdir()
    write_frame(action_dir / "frame_000.png")
    write_frame(action_dir / "frame_001.png")

    player = AnimationPlayer(
        asset_root=tmp_path,
        actions={"idle": ActionConfig(path="idle", fps=10, loop=True)},
        default_action="idle",
    )

    assert player.current_frame_path().name == "frame_000.png"
    player.advance()
    assert player.current_frame_path().name == "frame_001.png"
    player.advance()
    assert player.current_frame_path().name == "frame_000.png"


def test_animation_player_holds_last_frame_when_not_looping(tmp_path: Path) -> None:
    action_dir = tmp_path / "hover"
    action_dir.mkdir()
    write_frame(action_dir / "frame_000.png")
    write_frame(action_dir / "frame_001.png")

    player = AnimationPlayer(
        asset_root=tmp_path,
        actions={"hover": ActionConfig(path="hover", fps=10, loop=False)},
        default_action="hover",
    )

    player.advance()
    player.advance()
    assert player.current_frame_path().name == "frame_001.png"
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pytest tests/test_animation.py -q
```

Expected: FAIL because `yuzai_pet.animation` does not exist.

- [ ] **Step 3: Implement animation player**

Create `yuzai_pet/animation.py`:

```python
from __future__ import annotations

from pathlib import Path

from yuzai_pet.config import ActionConfig


class AnimationPlayer:
    def __init__(
        self,
        asset_root: Path,
        actions: dict[str, ActionConfig],
        default_action: str,
    ) -> None:
        self.asset_root = asset_root
        self.actions = actions
        self.current_action = default_action
        self.frame_index = 0
        self._frames: dict[str, list[Path]] = {}
        for name, action in actions.items():
            frames = sorted((asset_root / action.path).glob("*.png"))
            if not frames:
                raise ValueError(f"action {name} has no png frames")
            self._frames[name] = frames

    def play(self, action_name: str) -> None:
        if action_name == self.current_action:
            return
        if action_name not in self.actions:
            raise KeyError(action_name)
        self.current_action = action_name
        self.frame_index = 0

    def current_frame_path(self) -> Path:
        return self._frames[self.current_action][self.frame_index]

    def advance(self) -> None:
        frames = self._frames[self.current_action]
        next_index = self.frame_index + 1
        if next_index < len(frames):
            self.frame_index = next_index
            return
        if self.actions[self.current_action].loop:
            self.frame_index = 0
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pytest tests/test_animation.py -q
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add yuzai_pet/animation.py tests/test_animation.py
git commit -m "feat: add frame animation player"
```

Expected: commit succeeds.

## Task 6: Add Behavior Controller

**Files:**
- Create: `yuzai_pet/behavior.py`
- Create: `tests/test_behavior.py`

- [ ] **Step 1: Write failing tests**

Create `tests/test_behavior.py`:

```python
from yuzai_pet.behavior import BehaviorController


def test_behavior_switches_between_idle_hover_and_drag() -> None:
    behavior = BehaviorController(idle_action="idle", hover_action="hover", drag_action="drag")

    assert behavior.current_action == "idle"
    behavior.set_mouse_near(True)
    assert behavior.current_action == "hover"
    behavior.set_dragging(True)
    assert behavior.current_action == "drag"
    behavior.set_mouse_near(False)
    assert behavior.current_action == "drag"
    behavior.set_dragging(False)
    assert behavior.current_action == "idle"
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pytest tests/test_behavior.py -q
```

Expected: FAIL because `yuzai_pet.behavior` does not exist.

- [ ] **Step 3: Implement behavior controller**

Create `yuzai_pet/behavior.py`:

```python
from __future__ import annotations


class BehaviorController:
    def __init__(self, idle_action: str, hover_action: str, drag_action: str) -> None:
        self.idle_action = idle_action
        self.hover_action = hover_action
        self.drag_action = drag_action
        self.mouse_near = False
        self.dragging = False

    @property
    def current_action(self) -> str:
        if self.dragging:
            return self.drag_action
        if self.mouse_near:
            return self.hover_action
        return self.idle_action

    def set_mouse_near(self, value: bool) -> None:
        self.mouse_near = value

    def set_dragging(self, value: bool) -> None:
        self.dragging = value
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pytest tests/test_behavior.py -q
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add yuzai_pet/behavior.py tests/test_behavior.py
git commit -m "feat: add pet behavior controller"
```

Expected: commit succeeds.

## Task 7: Add Minimal Fish-Cat Runtime Assets

**Files:**
- Create: `assets/yuzai/pet.json`
- Create: `assets/yuzai/actions/idle/frame_000.png`
- Create: `assets/yuzai/actions/hover/frame_000.png`
- Create: `assets/yuzai/actions/drag/frame_000.png`

- [ ] **Step 1: Create runtime action config**

Create `assets/yuzai/pet.json`:

```json
{
  "window": {
    "width": 360,
    "height": 360,
    "scale": 1.0
  },
  "behavior": {
    "hoverDistance": 90
  },
  "actions": {
    "idle": {
      "path": "actions/idle",
      "fps": 8,
      "loop": true
    },
    "hover": {
      "path": "actions/hover",
      "fps": 8,
      "loop": true
    },
    "drag": {
      "path": "actions/drag",
      "fps": 8,
      "loop": true
    }
  }
}
```

- [ ] **Step 2: Create first runtime frames from reference image**

Run:

```bash
mkdir -p assets/yuzai/actions/idle assets/yuzai/actions/hover assets/yuzai/actions/drag
cp assets/origin/鱼仔参考图.png assets/yuzai/actions/idle/frame_000.png
cp assets/origin/鱼仔参考图.png assets/yuzai/actions/hover/frame_000.png
cp assets/origin/鱼仔参考图.png assets/yuzai/actions/drag/frame_000.png
```

Expected: three action directories each contain one PNG frame. These are initial runtime frames for bootstrapping the PySide6 window, not the final cutout model.

- [ ] **Step 3: Verify config loads**

Run:

```bash
python - <<'PY'
from pathlib import Path
from yuzai_pet.config import load_pet_config
config = load_pet_config(Path("assets/yuzai/pet.json"))
assert set(config.actions) == {"idle", "hover", "drag"}
print("ok")
PY
```

Expected output: `ok`.

- [ ] **Step 4: Commit**

Run:

```bash
git add assets/yuzai
git commit -m "feat: add initial yuzai runtime assets"
```

Expected: commit succeeds.

## Task 8: Add Transparent Pet Window

**Files:**
- Create: `yuzai_pet/pet_window.py`
- Create: `yuzai_pet/platform_window.py`
- Modify: `yuzai_pet/app.py`

- [ ] **Step 1: Add platform helpers**

Create `yuzai_pet/platform_window.py`:

```python
from __future__ import annotations

from PySide6.QtCore import Qt


def pet_window_flags(always_on_top: bool = True) -> Qt.WindowType:
    flags = Qt.WindowType.FramelessWindowHint | Qt.WindowType.Tool
    if always_on_top:
        flags |= Qt.WindowType.WindowStaysOnTopHint
    return flags
```

- [ ] **Step 2: Add pet window**

Create `yuzai_pet/pet_window.py`:

```python
from __future__ import annotations

from pathlib import Path

from PySide6.QtCore import QPoint, QTimer, Qt
from PySide6.QtGui import QAction, QMouseEvent, QPixmap
from PySide6.QtWidgets import QLabel, QMenu, QWidget

from yuzai_pet.animation import AnimationPlayer
from yuzai_pet.behavior import BehaviorController
from yuzai_pet.config import PetConfig
from yuzai_pet.platform_window import pet_window_flags


class PetWindow(QWidget):
    def __init__(self, config: PetConfig, asset_root: Path) -> None:
        super().__init__()
        self.config = config
        self.asset_root = asset_root
        self.animation = AnimationPlayer(asset_root, config.actions, "idle")
        self.behavior = BehaviorController("idle", "hover", "drag")
        self.drag_offset: QPoint | None = None

        self.setWindowTitle("鱼仔")
        self.setWindowFlags(pet_window_flags(always_on_top=True))
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self.setFixedSize(config.window_width, config.window_height)

        self.label = QLabel(self)
        self.label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.label.setGeometry(0, 0, config.window_width, config.window_height)

        self.timer = QTimer(self)
        self.timer.timeout.connect(self._tick)
        self.timer.start(1000 // max(config.actions["idle"].fps, 1))
        self._render_current_frame()

    def _tick(self) -> None:
        self.animation.play(self.behavior.current_action)
        self.animation.advance()
        self._render_current_frame()

    def _render_current_frame(self) -> None:
        pixmap = QPixmap(str(self.animation.current_frame_path()))
        scaled = pixmap.scaled(
            self.size(),
            Qt.AspectRatioMode.KeepAspectRatio,
            Qt.TransformationMode.SmoothTransformation,
        )
        self.label.setPixmap(scaled)

    def mousePressEvent(self, event: QMouseEvent) -> None:
        if event.button() == Qt.MouseButton.LeftButton:
            self.behavior.set_dragging(True)
            self.drag_offset = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            event.accept()
            return
        if event.button() == Qt.MouseButton.RightButton:
            self._show_context_menu(event.globalPosition().toPoint())
            event.accept()
            return
        super().mousePressEvent(event)

    def mouseMoveEvent(self, event: QMouseEvent) -> None:
        if self.drag_offset is not None:
            self.move(event.globalPosition().toPoint() - self.drag_offset)
            event.accept()
            return
        super().mouseMoveEvent(event)

    def mouseReleaseEvent(self, event: QMouseEvent) -> None:
        if event.button() == Qt.MouseButton.LeftButton:
            self.behavior.set_dragging(False)
            self.drag_offset = None
            event.accept()
            return
        super().mouseReleaseEvent(event)

    def enterEvent(self, event) -> None:
        self.behavior.set_mouse_near(True)
        super().enterEvent(event)

    def leaveEvent(self, event) -> None:
        self.behavior.set_mouse_near(False)
        super().leaveEvent(event)

    def _show_context_menu(self, global_pos: QPoint) -> None:
        menu = QMenu(self)
        reset_action = QAction("重置位置", self)
        reset_action.triggered.connect(lambda: self.move(100, 100))
        quit_action = QAction("退出", self)
        quit_action.triggered.connect(self.close)
        menu.addAction(reset_action)
        menu.addSeparator()
        menu.addAction(quit_action)
        menu.exec(global_pos)
```

- [ ] **Step 3: Wire app startup**

Replace `yuzai_pet/app.py` with:

```python
from __future__ import annotations

import sys
from pathlib import Path

from PySide6.QtWidgets import QApplication

from yuzai_pet.config import load_pet_config
from yuzai_pet.pet_window import PetWindow


def main(argv: list[str] | None = None) -> int:
    app = QApplication(sys.argv if argv is None else argv)
    app.setApplicationName("鱼仔桌面宠物")
    app.setQuitOnLastWindowClosed(True)

    project_root = Path(__file__).resolve().parent.parent
    asset_root = project_root / "assets" / "yuzai"
    config = load_pet_config(asset_root / "pet.json")
    window = PetWindow(config=config, asset_root=asset_root)
    window.move(100, 100)
    window.show()

    return app.exec()
```

- [ ] **Step 4: Verify import and tests**

Run:

```bash
python -m py_compile yuzai_pet/platform_window.py yuzai_pet/pet_window.py yuzai_pet/app.py
pytest -q
```

Expected: py_compile succeeds and all tests pass.

- [ ] **Step 5: Manual run**

Run:

```bash
python -m yuzai_pet
```

Expected: a transparent always-on-top fish-cat window appears and can be dragged. Right-click shows reset and exit actions.

- [ ] **Step 6: Commit**

Run:

```bash
git add yuzai_pet/platform_window.py yuzai_pet/pet_window.py yuzai_pet/app.py
git commit -m "feat: add transparent pyside6 pet window"
```

Expected: commit succeeds after manual run is confirmed.

## Task 9: Rewrite README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace README**

Replace `README.md` with:

```markdown
# 鱼仔桌面宠物

鱼仔桌面宠物是一个 Python + PySide6 实现的跨平台桌宠项目，目标是在 macOS 和 Windows 桌面上显示一只可拖拽、始终置顶、能进行基础互动的鱼仔。

## 当前路线

- GUI：PySide6 / Qt6
- 运行：`python -m yuzai_pet`
- 动画：透明 PNG 帧动画
- 打包：PyInstaller

本项目已放弃旧 Electron、PixiJS、视频生成运行时方案。

## 本地运行

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m yuzai_pet
```

Windows PowerShell：

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m yuzai_pet
```

## 项目结构

```text
yuzai_pet/          Python 桌宠运行时
assets/origin/      原始参考素材
assets/yuzai/       运行时鱼仔动作素材
tests/              Python 单元测试
packaging/          打包配置
docs/               中文设计、计划、验收记录
```

## 第一阶段验收

- 桌面能看到透明背景鱼仔。
- 鱼仔始终置顶。
- 鱼仔可拖拽。
- 右键菜单可退出。
- 鼠标靠近有反应。
```

- [ ] **Step 2: Commit**

Run:

```bash
git add README.md
git commit -m "docs: rewrite readme for pyside6 runtime"
```

Expected: commit succeeds.

## Task 10: Add PyInstaller Config

**Files:**
- Create: `packaging/pyinstaller/yuzai.spec`

- [ ] **Step 1: Create spec file**

Create `packaging/pyinstaller/yuzai.spec`:

```python
# -*- mode: python ; coding: utf-8 -*-

from pathlib import Path

ROOT = Path.cwd()

a = Analysis(
    ["-m", "yuzai_pet"],
    pathex=[str(ROOT)],
    binaries=[],
    datas=[
        (str(ROOT / "assets" / "yuzai"), "assets/yuzai"),
        (str(ROOT / "assets" / "origin"), "assets/origin"),
    ],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)
pyz = PYZ(a.pure)
exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="鱼仔桌面宠物",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="鱼仔桌面宠物",
)
```

- [ ] **Step 2: Commit**

Run:

```bash
git add packaging/pyinstaller/yuzai.spec
git commit -m "build: add pyinstaller package spec"
```

Expected: commit succeeds.

## Task 11: Final Validation

**Files:**
- No direct file changes expected.

- [ ] **Step 1: Run unit tests**

Run:

```bash
pytest -q
```

Expected: all tests pass.

- [ ] **Step 2: Run compile check**

Run:

```bash
python -m compileall yuzai_pet
```

Expected: compileall succeeds.

- [ ] **Step 3: Run desktop pet manually**

Run:

```bash
python -m yuzai_pet
```

Expected: fish-cat pet appears on desktop, can be dragged, right-click menu can exit.

- [ ] **Step 4: Push branch**

Run:

```bash
git status --short
git push
```

Expected: working tree is clean and remote branch receives all commits.
