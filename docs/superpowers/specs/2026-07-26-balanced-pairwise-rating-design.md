# Balanced Pairwise Comparison and C/D Rating Design

## Decision

Replace the current single randomly assigned C-versus-A/B comparison with two fixed pairwise trials completed by every participant:

1. Group C versus Group A.
2. Group C versus Group B.

The trial order is randomised 50/50, and the left/right position is randomised independently within each trial. The second trial never depends on the first trial's result.

The pairwise stage contains no Likert questions. After both pairwise choices, participants rate the matching Group C and Group D images as single images. C/D rating order is randomised 50/50 and recorded.

## Rationale

The study's primary comparison question is whether candidate Group C is preferred to each existing visualisation strategy A and B. A fixed two-trial star design gives every participant both relevant comparisons while avoiding the path-dependent missingness, unequal exposure, duplicate rematches, and unstable per-participant ranking produced by a winner-advances tournament.

The design does not attempt to produce a complete individual ranking of A, B, and C. An A-versus-B trial is unnecessary for the primary hypothesis. Group-level analysis should estimate C-versus-A and C-versus-B preference probabilities from the raw pairwise outcomes, accounting for repeated observations by participant and poem segment.

## Participant Flow

1. Choose interface language and consent.
2. Draw a poem.
3. View Group C before seeing the poem and select 3–5 affective keywords.
4. Reveal the poem.
5. Complete two pairwise trials:
   - C versus A.
   - C versus B.
6. Complete two blinded single-image rating trials:
   - C with three five-point ratings.
   - D with the same three ratings.
7. Complete optional reflection and poetry familiarity.
8. Submit and view the contact card.

## Pairwise Interface

The comparison screen is reused for both trials. It displays:

- `Comparison 1 of 2` / `第 1 轮，共 2 轮`
- two images labelled only Image A and Image B;
- `Image A captures it better`;
- `Image B captures it better`;
- `No clear preference` / `两者无明显差异`;
- a Continue button.

The previous wording `Neither quite works` is removed because it mixes absolute poor quality with a tie. The canonical tie value is `tie`.

A participant may change the selected choice before pressing Continue. No Likert block appears on this screen.

## Rating Interface

After both comparisons, one generic rating screen is used twice. It never reveals A/B/C/D, candidate, treatment, or baseline labels.

The screen displays:

- `Rate image 1 of 2` / `评价第 1 幅图像，共 2 幅`;
- one image;
- visual coherence, affective fidelity, and semantic fidelity;
- Continue, disabled until all three ratings are selected.

The three values remain separate. Affective fidelity and semantic fidelity are the two primary theory-aligned outcomes; visual coherence remains a secondary quality-control outcome.

Rating order is randomised:

- `narrative>baseline`, or
- `baseline>narrative`.

## Randomisation

Each round precomputes all assignments before participant interaction:

- poem segment;
- pairwise trial order: A then B, or B then A;
- left/right order for C–A;
- left/right order for C–B;
- C/D single-image rating order.

No later assignment is conditional on an earlier response.

## Submission Schema

New pairwise fields:

- `comparison_order`
- `comparison_1_pair`
- `comparison_1_left_group`
- `comparison_1_right_group`
- `comparison_1_choice`
- `comparison_2_pair`
- `comparison_2_left_group`
- `comparison_2_right_group`
- `comparison_2_choice`
- `rating_order`

Canonical group values remain:

- `narrative` = C
- `ancient` = A
- `literal` = B
- `baseline` = D

Canonical choices are a displayed group value or `tie`.

Existing C rating fields remain:

- `likert_visual_coherence`
- `likert_affective_fidelity`
- `likert_semantic_fidelity`

Existing D rating fields remain:

- `baseline_likert_visual_coherence`
- `baseline_likert_affective_fidelity`
- `baseline_likert_semantic_fidelity`

The web payload stops submitting the obsolete single-trial fields:

- `opponent_group`
- `shown_first`
- `compare_choice`
- `likert_target_group`

The Apps Script retains obsolete columns for historical rows but writes them blank for new submissions.

## Analysis Boundary

The website and Apps Script store raw assignments and responses only. They do not calculate or store an A/B/C rank.

Recommended analysis:

- estimate C-versus-A and C-versus-B preference probabilities separately;
- retain ties as ties rather than silently converting them to losses;
- model participant and poem-segment clustering;
- analyse semantic and affective fidelity as separate primary outcomes;
- analyse visual coherence separately as a quality-control outcome;
- include rating order as a prespecified order-effect check.

## Verification

- Deterministic tests force both pairwise orders and all left/right branches.
- Every run contains exactly one C–A trial and one C–B trial.
- The second trial is unchanged by the first choice.
- Likert controls do not exist on the pairwise screen.
- C and D are both rated, in either forced rating order.
- All ten design fields and six rating fields reach the offline payload and Apps Script mapping.
- Browser tests block the production Apps Script endpoint.
- English and Chinese text, mobile scrolling, image zoom, Service Worker caching, optional reflection, and contact card remain functional.

