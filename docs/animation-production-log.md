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

## 2026-06-13 Phase 1 Setup

Date: 2026-06-13
Source: `assets/origin`
Target action: `idle_primary`, `idle_secondary`, `tail_wag`, `walk`
Reference segment: Full source videos will be reviewed during extraction.
Frame count: Manifest starts disabled with `frameCount: 0`; each action is enabled only after clean rebuilt frames exist.
FPS: Initial target is 30 fps.
Loop mode: `idle_primary`, `idle_secondary`, and `walk` loop. `tail_wag` plays as a short idle variation.
Watermark handling: Source videos are references only. Runtime frames must be rebuilt cleanly and contain no watermark pixels.
Rebuild method: Clean transparent sequence frame reconstruction from source-video motion and `鱼仔参考图.png` identity.
Runtime output: `assets/runtime/animations/<action>/frames/frame_000001.png`.
Validation commands: `npm run validate:runtime-animations`, `npm run typecheck`, `npm run build`.
Desktop validation: Required after runtime frames are generated.
Known issues: Runtime actions are disabled until rebuilt frame folders exist.
Decision: Proceed with manifest-driven Phase 1 implementation before generating final frames.

## 2026-06-13 Desktop Smoke Test

Date: 2026-06-13
Source: `assets/runtime/animations/manifest.json`
Target action: Phase 1 manifest loader fallback
Reference segment: No rebuilt runtime frames exist yet.
Frame count: Enabled runtime actions remain at `frameCount: 0`.
FPS: Manifest target remains 30 fps for future rebuilt actions.
Loop mode: Placeholder fallback renders while Phase 1 runtime actions are disabled.
Watermark handling: No source-video pixels are rendered in this smoke test.
Rebuild method: Not started; this test validates the manifest-driven runtime shell.
Runtime output: Electron transparent desktop window captured to `/private/tmp/yuzai-window-phase1.png`.
Validation commands: `npm run validate:runtime-animations`, `npm run typecheck`, `npm run build`, `YUZAI_CAPTURE_PATH=/private/tmp/yuzai-window-phase1.png npm run dev`.
Desktop validation: Electron launched, captured a non-empty 560x560 RGBA window, and did not request old generated GIF output. The visible pet is the placeholder fallback until rebuilt Phase 1 frames exist.
Known issues: Electron prints the existing development CSP warning. This is unrelated to the animation manifest workflow and should be handled in a separate security/config pass.
Decision: Desktop smoke test passed for the manifest-driven loader and placeholder fallback stage.

## 2026-06-14 Legacy Asset Cleanup

Date: 2026-06-14
Source: legacy generated animation directories from `npm run list:animation-cleanup`
Target action: cleanup for Phase 1 source-video workflow
Reference segment: Not applicable.
Frame count: Removed untracked legacy frame directories; no runtime manifest frames were removed.
FPS: Not applicable.
Loop mode: Not applicable.
Watermark handling: Removed old generated/reference outputs from the legacy workflow. Preserved all original source videos and the identity image in `assets/origin`.
Rebuild method: Not applicable; this was cleanup only.
Runtime output: Preserved `assets/runtime/animations/.gitkeep` and `assets/runtime/animations/manifest.json`.
Validation commands: `npm run list:animation-cleanup`, `npm run validate:runtime-animations`, `npm run typecheck`, `npm run build`.
Desktop validation: Not repeated after cleanup because no runtime-enabled frames were removed and the manifest remains disabled with placeholder fallback.
Known issues: Cleanup candidates were untracked directories, so the file deletion itself produces no git diff. This log entry records the approved cleanup.
Decision: Approved cleanup completed. `npm run list:animation-cleanup` now reports an empty `candidates` list.
