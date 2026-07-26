# -*- coding: utf-8 -*-
"""Behavior checks for balanced C-A/C-B choices and counterbalanced C/D ratings."""

import json

from playwright.sync_api import sync_playwright


BASE = "http://127.0.0.1:8321/"


def image_filename(locator):
    return locator.get_attribute("src").replace("\\", "/").rsplit("/", 1)[-1]


def reach_compare(browser, random_values, language="en"):
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    page.add_init_script(
        f"""
        {{
          const queue = {json.dumps(random_values)}.slice();
          Math.random = () => queue.length ? queue.shift() : 0.1;
        }}
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
    page.click("#btn-compare-next")
    page.wait_for_selector("#s-compare.active")
    return context, page


def choose_and_continue(page, selector):
    page.click(selector)
    assert page.locator(selector).get_attribute("aria-pressed") == "true"
    assert page.locator("#btn-compare-done").is_enabled()
    page.click("#btn-compare-done")


def complete_rating(page, expected_prefix, values=(2, 3, 4)):
    page.wait_for_selector("#s-rating.active")
    assert image_filename(page.locator("#rating-screen-img")).startswith(expected_prefix)
    image_box = page.locator("#rating-screen-img").bounding_box()
    figure_box = page.locator("#rating-screen-img").locator("..").bounding_box()
    assert image_box["width"] <= figure_box["width"] + 1, "rating image is horizontally clipped"
    assert abs(image_box["width"] - figure_box["width"]) <= 3, "rating image does not fill its frame"
    assert page.locator("#btn-rating-done").is_disabled()
    assert page.locator("#rating-likert-visual-coherence").get_attribute("role") == "radiogroup"
    visual_choice = page.locator("#rating-likert-visual-coherence .likert-dot").nth(values[0] - 1)
    visual_choice.click()
    assert visual_choice.get_attribute("aria-checked") == "true"
    page.locator("#rating-likert-affective-fidelity .likert-dot").nth(values[1] - 1).click()
    assert page.locator("#btn-rating-done").is_disabled()
    page.locator("#rating-likert-semantic-fidelity .likert-dot").nth(values[2] - 1).click()
    assert page.locator("#btn-rating-done").is_enabled()
    page.click("#btn-rating-done")


def check_a_then_b_and_c_then_d(browser):
    # Random calls: segment, comparison order, C/A sides, C/B sides, C/D rating order.
    context, page = reach_compare(browser, [0.0, 0.1, 0.1, 0.9, 0.1])

    assert page.locator("#s-compare .step-tag").text_content() == "③ Comparison 1 of 2"
    assert page.locator("#likert-block").count() == 0
    assert page.locator("#btn-pick-1").get_attribute("aria-pressed") == "false"
    assert page.locator("#btn-pick-2").get_attribute("aria-pressed") == "false"
    assert page.locator("#btn-pick-neither").get_attribute("aria-pressed") == "false"
    assert [image_filename(page.locator("#cmp-img-1")), image_filename(page.locator("#cmp-img-2"))] == [
        "C1.webp",
        "A1.webp",
    ]

    choose_and_continue(page, "#btn-pick-1")
    assert page.locator("#s-compare .step-tag").text_content() == "③ Comparison 2 of 2"
    assert [image_filename(page.locator("#cmp-img-1")), image_filename(page.locator("#cmp-img-2"))] == [
        "B1.webp",
        "C1.webp",
    ]

    choose_and_continue(page, "#btn-pick-neither")
    complete_rating(page, "C1", (4, 5, 3))
    complete_rating(page, "D1", (2, 3, 4))
    page.wait_for_selector("#s-reflect.active")
    context.close()


def check_b_then_a_and_d_then_c(browser):
    context, page = reach_compare(browser, [0.0, 0.9, 0.9, 0.1, 0.9], language="zh")

    assert page.locator("#s-compare .step-tag").text_content() == "③ 第 1 轮，共 2 轮"
    assert [image_filename(page.locator("#cmp-img-1")), image_filename(page.locator("#cmp-img-2"))] == [
        "B1.webp",
        "C1.webp",
    ]

    choose_and_continue(page, "#btn-pick-neither")
    assert page.locator("#s-compare .step-tag").text_content() == "③ 第 2 轮，共 2 轮"
    assert [image_filename(page.locator("#cmp-img-1")), image_filename(page.locator("#cmp-img-2"))] == [
        "C1.webp",
        "A1.webp",
    ]

    choose_and_continue(page, "#btn-pick-2")
    complete_rating(page, "D1")
    complete_rating(page, "C1")
    page.wait_for_selector("#s-reflect.active")
    context.close()



def second_pair_after_first_choice(browser, selector):
    context, page = reach_compare(browser, [0.0, 0.1, 0.1, 0.9, 0.1])
    choose_and_continue(page, selector)
    pair = (
        image_filename(page.locator("#cmp-img-1")),
        image_filename(page.locator("#cmp-img-2")),
    )
    context.close()
    return pair


def check_second_trial_is_response_independent(browser):
    selected_first = second_pair_after_first_choice(browser, "#btn-pick-1")
    selected_tie = second_pair_after_first_choice(browser, "#btn-pick-neither")
    assert selected_first == selected_tie == ("B1.webp", "C1.webp")

def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        check_a_then_b_and_c_then_d(browser)
        check_b_then_a_and_d_then_c(browser)
        check_second_trial_is_response_independent(browser)
        browser.close()
    print("ALL BALANCED PAIRWISE AND C/D RATING CHECKS PASSED")


if __name__ == "__main__":
    main()
