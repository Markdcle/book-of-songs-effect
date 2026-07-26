# Mandatory Blind Baseline Implementation Plan

> **Superseded on 2026-07-26.** Implementation now follows
> [Balanced Pairwise Comparison and C/D Rating Implementation Plan](2026-07-26-balanced-pairwise-rating-plan.md).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make D a mandatory blind single-image rating for every participant while assigning the primary C-vs-A and C-vs-B comparisons equally.

**Architecture:** Keep the current state machine and add one focused `s-baseline` screen between comparison and reflection. Restrict the opponent configuration to A/B, store two independent D ratings in round state, and submit them with the existing response.

**Tech Stack:** Vanilla HTML, CSS, JavaScript, Python Playwright tests, Service Worker cache.

---

### Task 1: Lock the assignment and baseline behavior with tests

**Files:**
- Create: `tests/test_baseline_design.py`
- Modify: `../tools/e2e_test.py`

- [ ] Add a deterministic Playwright test that replaces `Math.random()` before drawing, exercises both opponent branches, and asserts the main comparison contains C/A or C/B but never D.
- [ ] Assert that completing the main comparison opens `#s-baseline`, whose image source is `D{segment_id}.webp`.
- [ ] Assert that `#btn-baseline-done` is disabled after one rating and enabled after both.
- [ ] Update E2E to complete the D screen and require `baseline_likert_fit` and `baseline_likert_resonance`.
- [ ] Run the tests and confirm they fail because the new screen and fields do not yet exist.

### Task 2: Implement the blind D screen and 50/50 main assignment

**Files:**
- Modify: `js/config.js`
- Modify: `index.html`
- Modify: `css/style.css`
- Modify: `js/i18n.js`
- Modify: `js/app.js`
- Modify: `sw.js`

- [ ] Change `OPPONENTS` to `["ancient", "literal"]` and update its explanatory comment.
- [ ] Add `baselineFit` and `baselineResonance` to round state.
- [ ] Add `s-baseline` with a single D image, the existing two five-point items, and a disabled Continue button.
- [ ] Add English and Chinese baseline labels and renumber the optional reflection step to ⑤.
- [ ] Make Compare completion enter the baseline screen; build both baseline Likert rows and gate Continue on both values.
- [ ] Add the baseline image to the existing zoom targets.
- [ ] Submit `baseline_likert_fit` and `baseline_likert_resonance`.
- [ ] Bump the Service Worker cache from v9 to v10.

### Task 3: Verify the complete flow

**Files:**
- Test: `tests/test_baseline_design.py`
- Test: `tests/test_english_cleanup.py`
- Test: `tests/test_i18n.py`
- Test: `tests/test_draw_layout.py`
- Test: `tests/test_thanks_contact.py`
- Test: `../tools/e2e_test.py`

- [ ] Run the deterministic baseline test and E2E until both pass.
- [ ] Run all existing focused regressions.
- [ ] Check the baseline screen at 390×844 and 375×667 for natural scrolling and readable controls.
- [ ] Run `git diff --check` and inspect the final scoped diff.
