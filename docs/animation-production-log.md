# Animation Production Log

Use this file to record each animation production pass. Every source video added to `assets/origin` should get one entry before its frames are accepted into runtime.

## Current Source Inventory

| Source file | Intended action | Status | Notes |
| --- | --- | --- | --- |
| `assets/origin/鱼仔待机动作1.mp4` | `idle_primary` | queued | Use as default idle reference. Rebuild clean frames; do not reuse watermark pixels. |
| `assets/origin/鱼仔待机动作2.mp4` | `idle_secondary` | queued | Use as alternate idle loop. |
| `assets/origin/鱼仔晃动尾巴视频.mp4` | `tail_wag` | queued | Use as autonomous idle variation. |
| `assets/origin/鱼仔走路视频.mp4` | `walk` | queued | Generate approved `walk`; derive `walk_left` by mirroring after approval. |
| `assets/origin/鱼仔参考图.png` | identity reference | queued | Use to keep YuZai identity consistent during clean frame reconstruction. |

## Entry Template

```text
Date:
Source:
Target action:
Reference segment:
Frame count:
FPS:
Loop mode:
Watermark handling:
Rebuild method:
Runtime output:
Validation commands:
Desktop validation:
Known issues:
Decision:
```

## Acceptance Rules

- The original source video remains in `assets/origin`.
- Runtime frames are clean rebuilt transparent frames, not direct source-video pixels.
- Watermark pixels must not appear in runtime output.
- Each accepted action has an entry in the runtime manifest.
- Each accepted action is checked in the Electron desktop window.
- Any rejected artifact must stay out of runtime paths.
