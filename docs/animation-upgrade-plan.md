# Animation Upgrade Execution Plan

This plan replaces the old generated-action workflow with a source-video-driven sequence-frame workflow.

## Direction

YuZai should play transparent sequence frames controlled by the runtime state machine. Source videos under `assets/origin` are references for action rhythm and pose only. Runtime animation frames must be rebuilt as clean transparent assets with no watermark pixels.

The first implementation phase only covers actions that already have source videos. Do not fill missing states with old generated GIFs, old generated photos, or previous derived placeholder sprites.

## Phase 1 Scope

| Source file | Runtime action | Behavior |
| --- | --- | --- |
| `assets/origin/鱼仔待机动作1.mp4` | `idle_primary` | Default idle and fallback center. |
| `assets/origin/鱼仔待机动作2.mp4` | `idle_secondary` | Alternate idle loop. |
| `assets/origin/鱼仔晃动尾巴视频.mp4` | `tail_wag` | Idle variation. |
| `assets/origin/鱼仔走路视频.mp4` | `walk` | Movement loop. |

`walk_left` should be generated from the approved `walk` frames by horizontal mirroring.

Unsupported interactions and missing states should temporarily fall back to approved Phase 1 actions, usually `idle_primary`. Full 13-state polish waits until the matching reference videos exist.

## Required Documentation During Work

Keep `docs/animation-production-log.md` updated for every source video and every accepted runtime action. Each entry must record:

- source file
- target action
- reference segment
- frame count and fps
- loop mode
- watermark handling
- rebuild method
- runtime output
- validation commands
- Electron desktop validation result
- known issues and final decision

## Cleanup Queue

Before deleting anything, confirm the replacement path is documented and the file is not part of `assets/origin`.

Cleanup candidates:

- old generated action GIFs
- old generated photos and AI image outputs
- old generated preview contact sheets
- old temporary extracted frames
- old derived sprite folders from the previous placeholder pass
- old HyperFrames generated-action output
- stale docs that describe the old generated-GIF workflow as the current path

Keep:

- `assets/origin`
- `assets/origin/鱼仔参考图.png`
- source code
- validation scripts worth adapting
- documentation describing current decisions

Preview cleanup candidates with:

```bash
npm run list:animation-cleanup
```

This command is dry-run only. Actual deletion requires a separate reviewed cleanup step.

## Runtime Asset Contract

The implementation should move toward a manifest-driven animation loader. The manifest should define each enabled action:

```json
{
  "name": "idle_primary",
  "source": "assets/origin/鱼仔待机动作1.mp4",
  "frameRoot": "assets/runtime/animations/idle_primary",
  "frameCount": 60,
  "fps": 30,
  "loop": true,
  "interruptible": true,
  "fallback": "idle_primary"
}
```

Exact `frameCount`, `fps`, and runtime output paths can be finalized during implementation after checking the source videos. The key requirement is that these values come from manifest data instead of being scattered through hardcoded loader constants.

## Playback Logic

- `idle_primary` loops by default.
- Idle variation can occasionally play `idle_secondary` or `tail_wag`, then return to `idle_primary`.
- Movement plays `walk` or generated `walk_left`.
- Missing click, hover, drag, sleep, wake, and expression states use Phase 1 fallback behavior until their source videos are added.
- Each future action added to `assets/origin` follows the same production log and manifest process.

## Validation

Automated checks should verify:

Run:

```bash
npm run validate:runtime-animations
npm run typecheck
npm run build
```

- enabled manifest actions exist
- frame files exist and match the manifest frame count
- runtime frames have visible pixels and alpha transparency
- no enabled runtime action points at old generated GIF output
- `walk_left` mirrors approved `walk`

Desktop checks should verify:

- YuZai appears in the Electron transparent always-on-top window
- no watermark is visible
- no blank frame or flicker appears during loops
- loop boundaries are smooth
- scale and position do not pop between related actions
- walking speed matches the visible gait

## Later 13-State Completion

When all 13 state reference videos exist in `assets/origin`, run a unified polish pass:

1. Normalize scale, framing, identity, lighting, and transparency.
2. Tune fps and loop timing across all states.
3. Replace fallback mappings with real state actions.
4. Re-check transition timing and interrupt priority.
5. Validate in the Electron desktop window.

Do this as a later phase, not as part of the first four-video source pass.
