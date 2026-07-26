# -*- coding: utf-8 -*-
"""Behavior checks for the shared poem reference in judgment stages."""

import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE = "http://127.0.0.1:8321/"
ROOT = Path(__file__).resolve().parents[2]


def reach_compare(browser, language):
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    page.add_init_script(
        """
        {
          const queue = [0.0, 0.1, 0.1, 0.9, 0.1];
          Math.random = () => queue.length ? queue.shift() : 0.1;
        }
        """
    )
    page.route("**script.google.com/**", lambda route: route.abort())
    page.goto(BASE, wait_until="load")
    page.click(f".language-choice[data-lang='{language}']")
    page.click("#btn-start")
    page.click(".card-flip[data-card='0']")
    page.wait_for_selector("#s-feel.active", timeout=8000)
    for index in range(3):
        page.locator("#chips .chip").nth(index).click()
    page.click("#btn-feel-next")
    page.wait_for_selector("#s-reveal.active")
    expected = page.evaluate(
        """({
          ancient: SEGMENTS[0].ancient,
          translation: SEGMENTS[0].translation,
          titleZh: SEGMENTS[0].title_zh
        })"""
    )
    page.click("#btn-compare-next")
    page.wait_for_selector("#s-compare.active")
    return context, page, expected


def check_mobile_overflow(browser, width, height):
    context = browser.new_context(viewport={"width": width, "height": height})
    page = context.new_page()
    page.route("**script.google.com/**", lambda route: route.abort())
    page.goto(BASE, wait_until="load")
    page.click(".language-choice[data-lang='en']")
    page.evaluate(
        """() => {
          let max = 0;
          for (let i = 1; i < SEGMENTS.length; i++) {
            if (SEGMENTS[i].translation.length > SEGMENTS[max].translation.length) max = i;
          }
          const queue = [(max + 0.1) / SEGMENTS.length, 0.1, 0.1, 0.9, 0.1];
          Math.random = () => queue.length ? queue.shift() : 0.1;
        }"""
    )
    page.click("#btn-start")
    page.click(".card-flip[data-card='0']")
    page.wait_for_selector("#s-feel.active", timeout=8000)
    for index in range(3):
        page.locator("#chips .chip").nth(index).click()
    page.click("#btn-feel-next")
    page.click("#btn-compare-next")
    page.wait_for_selector("#s-compare.active")

    for selector in ("html", "#s-compare", "#compare-poem-reference"):
        assert page.locator(selector).evaluate(
            "node => node.scrollWidth <= node.clientWidth"
        )

    page.click("#btn-pick-1")
    page.click("#btn-compare-done")
    page.click("#btn-pick-neither")
    page.click("#btn-compare-done")
    page.wait_for_selector("#s-rating.active")
    for selector in ("html", "#s-rating", "#rating-poem-reference"):
        assert page.locator(selector).evaluate(
            "node => node.scrollWidth <= node.clientWidth"
        )
    context.close()


def answer_rating(page):
    for row in (
        "#rating-likert-visual-coherence",
        "#rating-likert-affective-fidelity",
        "#rating-likert-semantic-fidelity",
    ):
        page.locator(f"{row} .likert-dot").nth(2).click()
    page.click("#btn-rating-done")


def check_english_state_persistence(browser):
    context, page, expected = reach_compare(browser, "en")

    assert page.locator("#compare-poem-reference").count() == 1
    assert page.locator("#compare-poem-toggle").get_attribute("aria-expanded") == "true"
    assert page.locator("#compare-poem-body").is_visible()
    assert page.locator("#compare-poem-ancient").inner_text() == expected["ancient"]
    assert page.locator("#compare-poem-translation").text_content() == expected["translation"]
    assert page.locator("#compare-poem-translation").is_visible()
    assert page.locator("#compare-poem-title-zh").inner_text() == expected["titleZh"]
    assert page.locator("#compare-poem-reference").evaluate(
        "node => node.scrollWidth <= node.clientWidth"
    )

    page.click("#compare-poem-toggle")
    assert page.locator("#compare-poem-toggle").get_attribute("aria-expanded") == "false"
    assert page.locator("#compare-poem-body").is_hidden()
    page.click("#btn-pick-1")
    page.click("#btn-compare-done")
    assert page.locator("#compare-progress").text_content() == "③ Comparison 2 of 2"
    assert page.locator("#compare-poem-body").is_hidden()

    page.click("#btn-pick-neither")
    page.click("#btn-compare-done")
    page.wait_for_selector("#s-rating.active")
    assert page.locator("#rating-poem-reference").count() == 1
    assert page.locator("#rating-poem-toggle").get_attribute("aria-expanded") == "true"
    assert page.locator("#rating-poem-body").is_visible()
    assert page.locator("#rating-poem-ancient").inner_text() == expected["ancient"]
    assert page.locator("#rating-poem-translation").text_content() == expected["translation"]

    page.click("#rating-poem-toggle")
    assert page.locator("#rating-poem-body").is_hidden()
    answer_rating(page)
    page.wait_for_selector("#s-rating.active")
    assert page.locator("#rating-progress").text_content() == "④ Rate image 2 of 2"
    assert page.locator("#rating-poem-toggle").get_attribute("aria-expanded") == "false"
    assert page.locator("#rating-poem-body").is_hidden()
    context.close()


def check_chinese_content(browser):
    context, page, expected = reach_compare(browser, "zh")
    assert page.locator("#compare-poem-label").inner_text() == "原诗参照"
    assert page.locator("#compare-poem-toggle-text").inner_text() == "收起"
    assert page.locator("#compare-poem-title-zh").inner_text() == expected["titleZh"]
    assert page.locator("#compare-poem-ancient").inner_text() == expected["ancient"]
    assert page.locator("#compare-poem-title-en").is_hidden()
    assert page.locator("#compare-poem-translation").is_hidden()
    context.close()


def check_reference_state_not_submitted():
    app_source = (ROOT / "website" / "js" / "app.js").read_text(encoding="utf-8")
    new_round = app_source[
        app_source.index("function newRound()"):
        app_source.index("// ---------- screen switching")
    ]
    assert "referenceExpanded: { compare: true, rating: true }" in new_round

    submit_start = app_source.index("const result = await window.Store.submit({")
    submit_end = app_source.index("\n    });", submit_start)
    submit_fields = app_source[submit_start:submit_end]
    assert "referenceExpanded" not in submit_fields

    sources = "\n".join(
        [
            app_source,
            (ROOT / "website" / "js" / "store.js").read_text(encoding="utf-8"),
            (ROOT / "apps-script" / "Code.gs").read_text(encoding="utf-8"),
        ]
    )
    for field in ("reference_expanded", "poem_reference", "reference_open"):
        assert not re.search(rf"\b{field}\s*:", sources)


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        check_english_state_persistence(browser)
        check_chinese_content(browser)
        check_mobile_overflow(browser, 390, 844)
        check_mobile_overflow(browser, 375, 667)
        browser.close()
    check_reference_state_not_submitted()
    print("ALL POEM REFERENCE CHECKS PASSED")


if __name__ == "__main__":
    main()
