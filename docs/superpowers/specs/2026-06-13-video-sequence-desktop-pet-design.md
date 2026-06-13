# Video-Sourced Sequence Animation Design

## Goal

YuZai should become a desktop-visible pet whose animation is driven by clean, controllable transparent sequence frames. The current phase only covers the actions that already have source videos in `assets/origin`. Missing actions should not be filled with old generated GIFs, old photos, or temporary derived sprites.

The production rule is: original videos are references for timing, pose, rhythm, and personality. They are not runtime assets.

## Confirmed Decisions

- Runtime animation uses sequence frames, not direct video playback.
- Source videos with watermarks are used only as references. Final runtime frames must be rebuilt cleanly and contain no watermark pixels.
- `assets/origin` is the only source-material entry point for this phase.
- Phase 1 covers only the four current videos:
  - `鱼仔待机动作1.mp4`
  - `鱼仔待机动作2.mp4`
  - `鱼仔晃动尾巴视频.mp4`
  - `鱼仔走路视频.mp4`
- Additional state videos can be added later to `assets/origin` and processed through the same pipeline.
- Full 13-state polish happens after all 13 reference actions exist.
- Desktop validation must happen in the Electron transparent always-on-top window, not only through contact sheets or browser previews.

## Phase 1 Action Mapping

| Source material | Runtime action | Purpose |
| --- | --- | --- |
| `鱼仔待机动作1.mp4` | `idle_primary` | Default idle loop and fallback center. |
| `鱼仔待机动作2.mp4` | `idle_secondary` | Alternate idle loop for variety. |
| `鱼仔晃动尾巴视频.mp4` | `tail_wag` | Autonomous idle variation. |
| `鱼仔走路视频.mp4` | `walk` | Movement loop. `walk_left` can be derived by mirroring after `walk` is approved. |

The existing 13-state runtime can temporarily map unsupported states back to `idle_primary` or another approved Phase 1 action. This avoids using old generated placeholder material to fake unsupported behaviors.

## Asset Pipeline

1. Inventory files under `assets/origin`.
2. Extract reference sheets and timing notes from each source video.
3. Mark usable motion segments: start pose, loop start, loop end, recovery, and any unstable frames.
4. Rebuild clean transparent sequence frames from the reference motion and the locked YuZai identity.
5. Export approved runtime frames into a new runtime asset location.
6. Generate an animation manifest with per-action metadata:
   - source filename
   - frame count
   - fps
   - loop mode
   - interrupt policy
   - fallback action
   - desktop validation result
7. Run automated validation for frame count, dimensions, alpha, non-empty pixels, mirror consistency, and missing assets.
8. Launch Electron and validate the transparent desktop window visually.

## Runtime Playback Logic

`idle_primary` is the return center. When no interaction or movement is active, YuZai loops `idle_primary`. Idle variation can choose `idle_secondary` or `tail_wag`, then return to `idle_primary`.

Movement uses `walk` for one direction and `walk_left` for the mirrored direction. Movement speed should be tuned against the visual paw cadence so the pet does not appear to slide.

Unsupported interactions in Phase 1 should fall back to available approved actions. For example, click, hover, and drag can briefly keep or restart `idle_primary` until their source videos are added later.

## Interaction Logic For Later States

The final 13-state target remains useful, but it is deferred. Each future source video should map to a named state, define whether it loops, and define how it returns to `idle_primary`.

The later complete set should include the project states already known by the app: `idle`, `walk`, `walk_left`, `sleep`, `sleepy`, `sleeping`, `waking`, `surprised`, `shy`, `dragging`, `waving`, `teaser`, plus any compatibility alias that remains necessary.

## Cleanup Policy

Clean up old generated assets only after the new documentation and manifest define the replacement path. Cleanup candidates include:

- old generated GIFs
- old generated preview contact sheets
- old generated photos and AI image outputs
- old temporary extracted frames
- old derived sprite folders that are not produced by the new source-video pipeline
- HyperFrames output for the previous generated-action experiment

Keep:

- `assets/origin`
- project code
- validation scripts that can be adapted
- empty placeholder directories only when they are needed by git or tooling

## Validation Requirements

Automated checks should confirm:

- every enabled Phase 1 action has a manifest entry
- every enabled action has the expected number of frames
- every runtime frame has transparent background and visible pet pixels
- no runtime asset path points to old generated GIF output
- `walk_left` is generated from approved `walk`

Desktop visual checks should confirm:

- no watermark remains
- no flicker or blank frame appears
- no scale popping occurs between loops
- no dirty edge artifacts remain after transparency processing
- walking movement speed matches the visual gait
- the pet is visibly rendered in the Electron desktop window

## Open Implementation Notes

The current code and documentation disagree about the runtime asset format: some docs describe 16 PNG frames under `assets/sprites`, while current loading code points at `assets/generated/cat-actions` with high-frame-count HyperFrames output. Implementation should resolve this before generating new assets.

The recommended implementation direction is a manifest-driven loader so frame count, fps, loop behavior, and fallback behavior come from data rather than hardcoded values.
