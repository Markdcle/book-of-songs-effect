# Persistent Poem Reference Design

## Decision

Add the same collapsible poem-reference card to the two judgment stages:

1. Stage ③: both fixed pairwise comparisons.
2. Stage ④: both C/D single-image ratings.

The card is expanded when a new experiment round begins. A participant may collapse it, and that choice persists only within the current stage: across both pairwise trials in Stage ③, or across both single-image ratings in Stage ④. Starting another draw resets both cards to expanded.

## Research rationale

Stages ③ and ④ ask participants to judge correspondence with a poem. Showing the poem only on Stage ② makes subsequent responses partly dependent on short-term memory, creating avoidable measurement error. Keeping an identical reference available at the point of judgment makes the target stimulus constant across conditions.

The reference card must not:

- reveal A/B/C/D, candidate, baseline, model, or generation-method labels;
- change content or placement by image condition;
- record expand/collapse behavior in the payload;
- introduce a modern-Chinese paraphrase.

## Language content

English interface:

- Chinese poem title;
- Chinese source passage;
- existing English title and translation.

Chinese interface:

- Chinese poem title;
- Chinese source passage;
- no English translation;
- no modern-Chinese paraphrase.

The content is taken from the same selected `SEGMENTS` record already used on Stage ②. No new translation data is created.

## Interaction and mobile behavior

Each card consists of:

- a button-like header labelled `Poem reference` / `原诗参照`;
- a Show/Hide state label with an accessible `aria-expanded` value;
- a body containing the language-appropriate title and poem text.

The body is expanded by default. When collapsed, the compact header remains available and may use `position: sticky` so the poem can be reopened while scrolling. Browsers without sticky positioning degrade to a normal in-flow header.

Use a plain button plus the `hidden` attribute instead of `<details>` to keep behavior consistent in older embedded WebViews.

## State and data flow

`newRound()` creates two UI-only flags:

```js
referenceExpanded: {
  compare: true,
  rating: true
}
```

The flags never enter `Store.submit()`. A shared renderer populates both card instances from `round.segment` and the active interface language. Stage entry rerenders the appropriate card without resetting its stage-local flag.

## Verification

Automated checks must prove:

- Stage ③ and Stage ④ both contain the reference card.
- English displays source text and existing translation.
- Chinese displays source text but hides English translation.
- Each stage starts expanded.
- Collapsing in comparison persists into comparison 2.
- Rating begins expanded independently of comparison state.
- Collapsing in rating persists into rating 2.
- A new draw resets both cards to expanded.
- No reference-card interaction field is submitted or added to Apps Script.
- Both mobile target widths have no horizontal overflow.

