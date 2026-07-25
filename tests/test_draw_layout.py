# -*- coding: utf-8 -*-
"""Regression checks for the mobile draw-screen viewport layout."""

from playwright.sync_api import sync_playwright


BASE = "http://127.0.0.1:8321/"


def assert_draw_layout(page, picked=False):
    viewport_height = page.evaluate(
        "window.visualViewport ? window.visualViewport.height : window.innerHeight"
    )
    synced_value = page.evaluate(
        "getComputedStyle(document.documentElement)"
        ".getPropertyValue('--viewport-height').trim()"
    )
    assert synced_value.endswith("px"), (
        f"real viewport height was not synchronised: {synced_value!r}"
    )
    synced_height = float(synced_value[:-2])
    assert abs(synced_height - viewport_height) <= 1, (
        f"viewport mismatch: css={synced_height}, visible={viewport_height}"
    )

    screen = page.locator("#s-draw").bounding_box()
    head = page.locator("#s-draw .draw-head").bounding_box()
    bottom = page.locator(
        "#draw-banner" if picked else "#s-draw .card-row"
    ).bounding_box()

    assert screen["height"] >= viewport_height - 1, (
        f"draw screen collapsed: {screen['height']} < {viewport_height}"
    )
    scroll_height = page.evaluate("document.scrollingElement.scrollHeight")
    assert scroll_height <= viewport_height + 1, (
        f"draw screen unexpectedly scrolls: {scroll_height} > {viewport_height}"
    )
    composition_center = (head["y"] + bottom["y"] + bottom["height"]) / 2
    assert abs(composition_center - viewport_height / 2) <= viewport_height * 0.14, (
        f"draw composition is not vertically centred: "
        f"center={composition_center}, viewport={viewport_height}"
    )


def run_case(browser, width, height):
    context = browser.new_context(
        viewport={"width": width, "height": height},
        user_agent=(
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
            "AppleWebKit/605.1.15"
        ),
        device_scale_factor=2,
    )
    page = context.new_page()
    page.goto(BASE, wait_until="load")
    page.click("#btn-start")
    page.wait_for_timeout(500)
    assert_draw_layout(page)

    page.click(".card-flip[data-card='0']")
    page.wait_for_selector(".card-flip.picked", timeout=3000)
    page.wait_for_timeout(700)
    assert_draw_layout(page, picked=True)
    context.close()


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        run_case(browser, 390, 844)
        run_case(browser, 375, 667)
        browser.close()
    print("ALL DRAW LAYOUT CHECKS PASSED")

if __name__ == "__main__":
    main()
