# Balanced Pairwise Comparison and C/D Rating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Give every participant balanced C–A and C–B preference trials, followed by blinded, counterbalanced C/D single-image ratings.

**Architecture:** Precompute two fixed comparison trials and a two-image rating order in `newRound()`. Reuse one comparison screen for both choices and one generic rating screen for both C and D, then submit raw assignments and responses through the existing offline queue and Apps Script backend.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Google Apps Script, Python Playwright, Service Worker.

---

### Task 1: Add failing balanced-design and schema tests

**Files:**
- Create: `website/tests/test_pairwise_rating_design.py`
- Modify: `website/tests/test_submission_schema.py`
- Modify: `website/tests/test_i18n.py`
- Modify: `website/tests/test_english_cleanup.py`
- Modify: `tools/e2e_test.py`
- Remove: `website/tests/test_baseline_design.py`

- [x] **Step 1: Create deterministic browser checks**

Test that every run contains one C–A and one C–B comparison, comparison order and left/right order can be forced independently, selecting the first trial does not change the second pair, `tie` is supported, and the comparison page has no Likert controls.

- [x] **Step 2: Add C/D rating-order checks**

Force `narrative>baseline` and `baseline>narrative`; require three answers before advancing from each image and verify that both images use the selected poem segment.

- [x] **Step 3: Add payload/backend schema checks**

Require the ten comparison/rating-order fields and six rating fields in both `js/app.js` and `apps-script/Code.gs`. Assert that the web payload does not submit `opponent_group`, `shown_first`, `compare_choice`, or `likert_target_group`.

- [x] **Step 4: Run the focused tests and verify failure**

Run:

```powershell
python -B website\tests\test_pairwise_rating_design.py
python -B website\tests\test_submission_schema.py
```

Expected: failures because the second pairwise trial, generic rating screen, and new fields do not yet exist.

### Task 2: Replace the comparison and rating markup

**Files:**
- Modify: `website/index.html`
- Modify: `website/js/i18n.js`

- [x] **Step 1: Remove the comparison-page Likert block**

Keep the two figures and three preference choices. Move `btn-compare-done` directly after the choice controls and use it only to advance between comparison trials or enter ratings.

- [x] **Step 2: Convert the baseline page into a generic rating page**

Rename the section and element IDs from baseline-specific names to:

```text
s-rating
rating-progress
rating-title
rating-screen-img
rating-likert-visual-coherence
rating-likert-affective-fidelity
rating-likert-semantic-fidelity
btn-rating-done
```

- [x] **Step 3: Add exact bilingual copy**

English:

```text
③ Comparison {current} of {total}
No clear preference
Next comparison
Continue to ratings
④ Rate image {current} of {total}
Please consider this image on its own.
Next image
Continue
```

Chinese:

```text
③ 第 {current} 轮，共 {total} 轮
两者无明显差异
下一轮比较
继续评价图像
④ 评价第 {current} 幅图像，共 {total} 幅
请只依据当前图像作答。
下一幅图像
继续
```

- [x] **Step 4: Run English and bilingual tests**

Run:

```powershell
python -B website\tests\test_english_cleanup.py
python -B website\tests\test_i18n.py
```

Expected: comparison/rating text and control counts pass.

### Task 3: Implement fixed randomised trials and generic ratings

**Files:**
- Modify: `website/js/app.js`

- [x] **Step 1: Precompute assignments in `newRound()`**

Create:

```js
const opponents = Math.random() < 0.5
  ? ["ancient", "literal"]
  : ["literal", "ancient"];
const comparisons = opponents.map(opponent => ({
  opponent,
  order: Math.random() < 0.5
    ? ["narrative", opponent]
    : [opponent, "narrative"],
  choice: null
}));
const ratingOrder = Math.random() < 0.5
  ? ["narrative", "baseline"]
  : ["baseline", "narrative"];
```

Store `comparisonIndex`, `comparisons`, `ratingIndex`, `ratingOrder`, and separate C/D rating objects in round state.

- [x] **Step 2: Render both comparisons without response-dependent assignment**

`enterCompare()` reads `round.comparisons[round.comparisonIndex]`. `pick()` stores a displayed group or `tie`, highlights the selected control, and enables Continue. Continue increments the index or enters the rating stage.

- [x] **Step 3: Render C and D through one rating function**

`enterRating()` selects the current kind from `round.ratingOrder`, loads the matching image, resets the three Likert rows, and writes scores into that kind's rating object. Continue advances to the second image or reflection.

- [x] **Step 4: Update zoom targets and preloading**

Keep zoom for both comparison images, the initial C image, and the generic rating image. Continue preloading A, B, C, and D for the selected poem.

- [x] **Step 5: Run the deterministic design test**

Run:

```powershell
python -B website\tests\test_pairwise_rating_design.py
```

Expected: `ALL BALANCED PAIRWISE AND C/D RATING CHECKS PASSED`.

### Task 4: Persist the raw design

**Files:**
- Modify: `website/js/app.js`
- Modify: `apps-script/Code.gs`
- Modify: `website/tests/test_submission_schema.py`

- [x] **Step 1: Build the new payload**

Submit both comparison records, `comparison_order`, `rating_order`, existing C fields, and existing D fields. Do not submit obsolete single-comparison fields.

- [x] **Step 2: Migrate the Apps Script header and row mapping**

Add the ten new fields before the historical single-comparison columns. Retain obsolete columns for historical data and write them blank for new rows.

- [x] **Step 3: Preserve aggregate stats compatibility**

Keep `total`; aggregate new `comparison_1_choice` and `comparison_2_choice` values instead of relying only on the obsolete `compare_choice` column.

- [x] **Step 4: Run schema and syntax checks**

Run:

```powershell
python -B website\tests\test_submission_schema.py
node --check website\js\app.js
node -e "const fs=require('fs');new Function(fs.readFileSync('apps-script/Code.gs','utf8'))"
```

Expected: all schema fields are mapped exactly once and both scripts parse.

### Task 5: Complete bilingual E2E and cache migration

**Files:**
- Modify: `tools/e2e_test.py`
- Modify: `website/sw.js`
- Modify: `website/docs/superpowers/specs/2026-07-26-mandatory-baseline-design.md`
- Modify: `website/docs/superpowers/specs/2026-07-26-three-axis-rating-design.md`

- [x] **Step 1: Update the isolated E2E**

Complete both pairwise trials, rate both generic single-image trials, submit, and verify the new raw fields. Continue aborting all `script.google.com` requests.

- [x] **Step 2: Bump the cache**

Change:

```js
const CACHE = "book-of-songs-v13";
```

- [x] **Step 3: Mark prior design notes as superseded**

Link both older design notes to `2026-07-26-balanced-pairwise-rating-design.md` so they do not contradict the active design.

- [x] **Step 4: Run the complete regression**

Run:

```powershell
python -B website\tests\test_submission_schema.py
python -B website\tests\test_english_cleanup.py
python -B website\tests\test_i18n.py
python -B website\tests\test_pairwise_rating_design.py
python -B website\tests\test_draw_layout.py
python -B website\tests\test_thanks_contact.py
cd tools
python -B e2e_test.py
```

Expected: all focused checks pass and E2E prints `ALL E2E CHECKS PASSED`.

- [x] **Step 5: Perform final integrity checks**

Run:

```powershell
node --check website\js\app.js
node --check website\js\i18n.js
node --check website\js\store.js
git -C website diff --check
```

Expected: no syntax errors or whitespace errors.

