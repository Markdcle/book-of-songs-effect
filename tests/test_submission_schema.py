# -*- coding: utf-8 -*-
"""Static checks for the balanced pairwise and counterbalanced rating schema."""

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
APP = (ROOT / "website" / "js" / "app.js").read_text(encoding="utf-8")
STORE = (ROOT / "website" / "js" / "store.js").read_text(encoding="utf-8")
BACKEND = (ROOT / "apps-script" / "Code.gs").read_text(encoding="utf-8")

PAIRWISE_FIELDS = (
    "comparison_order",
    "comparison_1_pair",
    "comparison_1_left_group",
    "comparison_1_right_group",
    "comparison_1_choice",
    "comparison_2_pair",
    "comparison_2_left_group",
    "comparison_2_right_group",
    "comparison_2_choice",
    "rating_order",
)

RATING_FIELDS = (
    "likert_visual_coherence",
    "likert_affective_fidelity",
    "likert_semantic_fidelity",
    "baseline_likert_visual_coherence",
    "baseline_likert_affective_fidelity",
    "baseline_likert_semantic_fidelity",
)

for field in PAIRWISE_FIELDS + RATING_FIELDS:
    assert len(re.findall(rf"\b{field}\s*:", APP)) == 1, (
        f"web payload must submit {field} exactly once"
    )
    assert BACKEND.count(f'"{field}"') == 1, (
        f"sheet header must contain {field} exactly once"
    )
    assert BACKEND.count(f"d.{field}") == 1, (
        f"sheet append mapping must contain {field} exactly once"
    )

for obsolete_field in (
    "opponent_group",
    "shown_first",
    "compare_choice",
    "likert_target_group",
    "likert_fit",
    "likert_resonance",
):
    assert not re.search(rf"\b{obsolete_field}\s*:", APP), (
        f"new web payload still submits obsolete field {obsolete_field}"
    )

assert "user_agent:" not in STORE
assert "page_lang:" not in STORE

assert "const rowByName = {" in BACKEND
assert "const header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];" in BACKEND
assert "sh.appendRow(header.map(name => rowByName[name]" in BACKEND
assert "const uuidColumn = header.indexOf('uuid') + 1;" in BACKEND
assert "sh.appendRow([" not in BACKEND, "backend must not append response values by fixed position"
assert "replace(/^narrative_vs_/, \"\")" in BACKEND

print("ALL BALANCED SUBMISSION SCHEMA CHECKS PASSED")
