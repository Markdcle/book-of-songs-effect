# Two Core Outcomes with One Visual-Quality Control

> **Superseded on 2026-07-26.** The current experiment design is
> [Balanced Pairwise Comparison and C/D Rating Design](2026-07-26-balanced-pairwise-rating-design.md).

## Decision

Use three independent five-point ratings, while retaining a two-dimensional semantic–affective theory:

1. Affective fidelity to the poem — primary theoretical outcome.
2. Semantic fidelity to the poem — primary theoretical outcome.
3. Visual coherence — secondary image-quality control.

Question count does not determine theoretical dimensionality. The semantic–affective theory remains two-dimensional; visual coherence is not a third theoretical axis. The three scores remain separate and must not be averaged into a single “overall quality” score.

## Rationale

The current “merge scene and feeling” question combines visual construction and affective expression in one response. The current “cross-cultural resonance” question measures the participant’s personal reaction, which is affected by cultural background and poetry familiarity and is therefore not a clean measure of generated-image quality.

The manuscript already uses three forward-evaluation dimensions, but its terms are refined here:

- “Visual completeness” becomes **visual coherence**, a clearer image-quality control.
- “Emotional clarity” becomes **affective fidelity**, because a clear emotion can still be the wrong emotion.
- “Entity accuracy” becomes **semantic fidelity**, because poem-to-image alignment includes actions, relations, and imagery as well as entities.

This also matches the manuscript’s later semantic–affective trade-off model while retaining a separate visual-quality control.

## Participant-facing items

English:

1. `How visually coherent is this image as a whole?`
2. `How well does this image preserve the poem’s emotional atmosphere?`
3. `How accurately does this image depict the poem’s key imagery and events?`

Chinese:

1. `整幅图像在视觉上有多连贯？`
2. `这幅图像在多大程度上保留了诗歌的情感氛围？`
3. `这幅图像在多大程度上准确呈现了诗中的关键意象与事件？`

Each item uses construct-specific anchors. The same three questions are used for the candidate C image and the mandatory D image. C is shown again as an explicit rating target, independent of the preceding pairwise choice, so ratings are not conditioned on which image the participant preferred.

## Data fields

Main comparison:

- `likert_target_group` (fixed canonical value: `narrative`, i.e. Group C)
- `likert_visual_coherence`
- `likert_affective_fidelity`
- `likert_semantic_fidelity`

Mandatory D rating:

- `baseline_likert_visual_coherence`
- `baseline_likert_affective_fidelity`
- `baseline_likert_semantic_fidelity`

New web submissions omit `likert_fit`, `likert_resonance`, `baseline_likert_fit`, and `baseline_likert_resonance`. The Apps Script sheet keeps its two historical main-rating columns for compatibility but writes them blank for new rows, then records all six new fields in dedicated columns.

## Scope

This change does not alter C-vs-A/B assignment, D presentation order, pairwise choice, the optional reflection, or the poem/image assets.
