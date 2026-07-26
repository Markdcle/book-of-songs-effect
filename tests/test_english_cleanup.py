# -*- coding: utf-8 -*-
"""English mode keeps Chinese source material, not bilingual UI chrome."""

from playwright.sync_api import sync_playwright


BASE = "http://127.0.0.1:8321/"


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.goto(BASE, wait_until="load")
        page.click(".language-choice[data-lang='en']")

        assert page.locator("#landing-main .title-zh").is_hidden()
        assert page.locator("#btn-start").inner_text().strip() == "Draw Your Poem"
        assert page.locator("#landing-main .rn-title").inner_text() == "ACADEMIC RESEARCH STUDY"
        assert page.locator("#landing-main .btn-zh:visible").count() == 0
        assert page.title() == "Feel the Poetry — DH2026"

        wording = page.evaluate(
            """({
                title: I18N.t("compare.title"),
                noPreference: I18N.t("compare.neither"),
                ratingTitle: I18N.t("rating.title", {current: 1, total: 2}),
                ratingHint: I18N.t("rating.hint"),
                visualCoherence: I18N.t("compare.visualCoherence"),
                affectiveFidelity: I18N.t("compare.affectiveFidelity"),
                semanticFidelity: I18N.t("compare.semanticFidelity"),
                stats: I18N.t("thanks.stats", { n: 12 })
            })"""
        )
        assert wording == {
            "title": "Which image better captures the poem’s poetic mood and imagery?",
            "noPreference": "No clear preference",
            "ratingTitle": "Please rate image 1 of 2.",
            "ratingHint": "Please consider this image on its own.",
            "visualCoherence": "How visually coherent is this image as a whole?",
            "affectiveFidelity": "How well does this image preserve the poem’s emotional atmosphere?",
            "semanticFidelity": (
                "How accurately does this image depict the poem’s key imagery "
                "and events?"
            ),
            "stats": "You are participant #12.",
        }
        assert page.locator("#s-compare .likert").count() == 0
        assert page.locator("#s-rating .likert").count() == 3
        assert page.locator("#s-baseline").count() == 0

        browser.close()
        print("ALL ENGLISH CLEANUP CHECKS PASSED")


if __name__ == "__main__":
    main()
