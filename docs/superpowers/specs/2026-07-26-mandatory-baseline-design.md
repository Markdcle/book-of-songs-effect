# Mandatory Blind Baseline Design

> **Superseded on 2026-07-26.** The current experiment design is
> [Balanced Pairwise Comparison and C/D Rating Design](2026-07-26-balanced-pairwise-rating-design.md).

## Goal

Every participant completes one main pairwise comparison and one separate baseline rating:

1. Main comparison: Group C versus Group A or Group B, assigned with equal probability.
2. Baseline rating: the matching Group D image for the same poem segment, shown to everyone.

## Participant flow

The main comparison remains blind. Image A/Image B order is randomised independently of the A/B opponent assignment. After the participant chooses an image (or neither) and completes the existing two ratings, the interface advances to a new single-image screen.

The new screen says only that there is “one more image” of the same poem. It does not reveal the terms A, B, C, D, baseline, control, candidate, or treatment. The matching D image is shown alone and uses the same two current five-point rating items. Both ratings are required before continuing to the optional reflection screen.

The order is deliberately:

1. C versus A/B.
2. D alone.

This prevents the visibly analytic D image from anchoring the participant before the primary comparison.

## Assignment and data

- `OPPONENTS` contains only `ancient` and `literal`.
- Each is selected with `Math.random()` from a two-element array, producing a 50/50 assignment in expectation.
- Existing fields retain their meaning:
  - `opponent_group`: `ancient` or `literal`
  - `shown_first`: the group displayed as Image A
  - `compare_choice`
  - `likert_fit`
  - `likert_resonance`
- New fields record the mandatory D rating:
  - `baseline_likert_fit`
  - `baseline_likert_resonance`

No redundant constant `baseline_group` field is added.

## Interface

English:

- Step: `④ One more image`
- Title: `Please rate this image of the same poem.`
- Button: `Continue`

Chinese:

- Step: `④ 再看一幅图像`
- Title: `请评价这幅对同一首诗的图像呈现。`
- Button: `继续`

The existing reflection step changes from ④ to ⑤ in both languages. The baseline image supports the existing tap-to-zoom interaction.

## Verification

- A deterministic browser test forces both random branches and confirms that the main pair is C/A or C/B, never C/D.
- The test confirms that the D image uses the same segment number as the main comparison.
- The baseline Continue button remains disabled until both ratings are selected.
- The E2E submission contains the two new baseline fields and excludes D from `opponent_group`.
- Existing bilingual, draw-layout, contact-card, and end-to-end tests remain green.
