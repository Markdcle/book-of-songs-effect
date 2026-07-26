# Two Core Outcomes + One Visual-Control Implementation Plan

> **Superseded on 2026-07-26.** Implementation now follows
> [Balanced Pairwise Comparison and C/D Rating Implementation Plan](2026-07-26-balanced-pairwise-rating-plan.md).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two ambiguous ratings with two theory-aligned outcomes plus one visual-quality control, then persist all six C/D scores without treating the design as three-dimensional.

**Architecture:** Reuse the existing Likert builder and comparison/baseline screens. Change only the question blocks, round-state fields, completion gates, payload schema, Apps Script column mapping, bilingual strings, and tests.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Google Apps Script, Python Playwright tests, Service Worker.

---

### Task 1: Write failing behavior and schema tests

**Files:**
- Modify: `tests/test_english_cleanup.py`
- Modify: `tests/test_i18n.py`
- Modify: `tests/test_baseline_design.py`
- Create: `tests/test_submission_schema.py`
- Modify: `../tools/e2e_test.py`

- [ ] Require three exact English and Chinese questions on both rating screens.
- [ ] Require all three answers before each Continue button is enabled.
- [ ] Require six new payload fields and reject all four legacy payload fields.
- [ ] Require the Apps Script backend to declare and append all six new columns.
- [ ] Run focused tests and confirm failure on the missing third question and fields.

### Task 2: Implement the two primary outcomes plus one control

**Files:**
- Modify: `index.html`
- Modify: `js/i18n.js`
- Modify: `js/app.js`
- Modify: `../apps-script/Code.gs`
- Modify: `sw.js`

- [ ] Replace each two-question block with visual coherence (control), affective fidelity (primary), and semantic fidelity (primary).
- [ ] Replace main and baseline round-state values and require all three values.
- [ ] Submit the six new snake-case fields and remove the four legacy fields from web payloads.
- [ ] Extend the Apps Script header and append mapping while retaining blank historical columns.
- [ ] Bump the Service Worker cache from v10 to v11.

### Task 3: Verify

- [ ] Run the new schema test, bilingual test, baseline test, all focused regressions, and isolated E2E.
- [ ] Run JavaScript syntax checks and `git diff --check`.
- [ ] Confirm the E2E blocks the production endpoint and queues only local test data.
