# Kling Video Generation Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local CLI that submits cat reference image-to-video jobs to Kling AI and downloads generated MP4 files for later desktop-pet asset processing.

**Architecture:** Keep Kling integration outside Electron runtime. The CLI reads `docs/kling-action-generation-plan.json`, loads secrets from environment or `.env.local`, signs API requests with a short-lived JWT, submits tasks, polls status, and downloads videos into `assets/origin/generated/kling`.

**Tech Stack:** Node.js ESM scripts, built-in `crypto`, built-in `fetch`, JSON action plan, existing npm scripts.

---

### Task 1: Configuration And Secrets

**Files:**
- Modify: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1:** Add `.env.local` and generated MP4 ignores.
- [ ] **Step 2:** Add `.env.example` with variable names only.
- [ ] **Step 3:** Verify `git status --short` does not include secret files.

### Task 2: Action Plan

**Files:**
- Create: `docs/kling-action-generation-plan.json`

- [ ] **Step 1:** Create a JSON action plan for the current fish-cat reference image.
- [ ] **Step 2:** Include daily, interactive, and transition actions.
- [ ] **Step 3:** Ensure every action has `action`, `category`, `loop`, `prompt`, `negativePrompt`, and `output`.

### Task 3: Kling CLI Modules

**Files:**
- Create: `scripts/kling/env.mjs`
- Create: `scripts/kling/jwt.mjs`
- Create: `scripts/kling/prompt-plan.mjs`
- Create: `scripts/kling/client.mjs`
- Create: `scripts/kling/generate-video.mjs`
- Modify: `package.json`

- [ ] **Step 1:** Implement `.env.local` loading without printing secrets.
- [ ] **Step 2:** Implement HS256 JWT signing.
- [ ] **Step 3:** Implement action-plan loading and validation.
- [ ] **Step 4:** Implement dry-run output.
- [ ] **Step 5:** Implement real task submission, polling, and video download.
- [ ] **Step 6:** Add `npm run kling:generate`.

### Task 4: Documentation

**Files:**
- Create: `docs/kling-integration.md`
- Modify: `docs/cat-video-prompt-guide.md`

- [ ] **Step 1:** Document environment variables and dry-run usage.
- [ ] **Step 2:** Document generated video review flow.
- [ ] **Step 3:** Link the Kling integration from the prompt guide.

### Task 5: Verification

**Commands:**
- `npm run kling:generate -- --dry-run --action idle_primary`
- `npm run kling:generate -- --dry-run --all`
- `npm run typecheck`
- `git status --short`

- [ ] **Step 1:** Dry-run a single action.
- [ ] **Step 2:** Dry-run all actions.
- [ ] **Step 3:** Run TypeScript check.
- [ ] **Step 4:** Confirm no real secret is staged.
