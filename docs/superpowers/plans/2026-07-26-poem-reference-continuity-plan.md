# Persistent Poem Reference Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Keep the selected poem available during both comparison and rating judgments without changing blinding or research data.

**Architecture:** Add two instances of one shared poem-reference component pattern to the existing comparison and rating screens. A small renderer in `js/app.js` populates both from the selected segment, applies language visibility, and maintains UI-only expanded state independently for Stages ③ and ④.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Python Playwright, Service Worker.

---

### Task 1: Lock the reference behavior with a failing browser test

**Files:**
- Create: `website/tests/test_poem_reference.py`

- [x] **Step 1: Add deterministic English and Chinese flow helpers**

Use Playwright to select a fixed segment, reach Stage ③, complete both comparisons, and reach Stage ④ without contacting Apps Script.

- [x] **Step 2: Assert exact reference visibility and state**

Require `compare-poem-reference` and `rating-poem-reference`, their source text, language-dependent translation visibility, `aria-expanded`, state persistence across the two trials in each stage, and independent default expansion when Stage ④ begins.

- [x] **Step 3: Assert the interaction remains UI-only**

Statically reject payload keys containing `reference_expanded`, `poem_reference`, or `reference_open` in `js/app.js`, `js/store.js`, and `apps-script/Code.gs`.

- [x] **Step 4: Run the new test and verify RED**

Run:

```powershell
python website\tests\test_poem_reference.py
```

Expected: failure because the two reference-card elements do not exist.

### Task 2: Add the shared bilingual component

**Files:**
- Modify: `website/index.html`
- Modify: `website/css/style.css`
- Modify: `website/js/i18n.js`

- [x] **Step 1: Add one reference-card instance to each judgment screen**

Use identical class structure with distinct `compare-*` and `rating-*` IDs. Each header is a real button with `aria-expanded="true"` and an associated body.

- [x] **Step 2: Add compact mobile styling**

Use the existing surface, paper, gold, serif, and Kaiti variables. Expanded cards remain in normal flow; collapsed cards become compact and sticky where supported. All content must fit within the screen width.

- [x] **Step 3: Add exact bilingual control text**

English:

```text
Poem reference
Hide
Show
```

Chinese:

```text
原诗参照
收起
展开
```

No new poem translation strings are introduced.

### Task 3: Populate and preserve the reference state

**Files:**
- Modify: `website/js/app.js`

- [x] **Step 1: Add UI-only state to `newRound()`**

Initialize comparison and rating expansion flags to `true`; keep them outside the submission payload.

- [x] **Step 2: Add a shared `renderPoemReference(prefix, expanded)` helper**

Populate the selected segment’s existing title, source passage, and translation. Follow the current language rule used on Stage ②.

- [x] **Step 3: Bind both toggle buttons**

Update the correct stage-local flag, body `hidden` state, collapsed class, button `aria-expanded`, and Show/Hide label.

- [x] **Step 4: Render on stage entry without resetting within-stage state**

Call the renderer from `enterCompare()` and `enterRating()`. A fresh call to `newRound()` resets both flags.

- [x] **Step 5: Run the focused test and verify GREEN**

Run:

```powershell
python website\tests\test_poem_reference.py
```

Expected: `ALL POEM REFERENCE CHECKS PASSED`.

### Task 4: Integrate regression and cache migration

**Files:**
- Modify: `tools/e2e_test.py`
- Modify: `website/sw.js`
- Modify: `website/docs/superpowers/specs/2026-07-26-balanced-pairwise-rating-design.md`

- [x] **Step 1: Extend E2E**

Verify the reference card on both stages while completing the existing isolated full flow.

- [x] **Step 2: Bump Service Worker**

Change `book-of-songs-v13` to `book-of-songs-v14`.

- [x] **Step 3: Link the active experiment design**

Add the poem-reference continuity specification as an addendum to the balanced comparison design.

- [x] **Step 4: Run full verification**

Run all `website/tests/test_*.py`, the complete `tools/e2e_test.py`, JavaScript syntax checks, and `git diff --check`. Repeat mobile QA at 390×844 and 375×667.

Expected: every test passes, E2E prints `ALL E2E CHECKS PASSED`, and neither viewport has horizontal overflow.

