# -*- coding: utf-8 -*-
"""Regression checks for the English/Chinese experiment interface."""

from playwright.sync_api import sync_playwright


BASE = "http://127.0.0.1:8321/"


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent=(
                "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                "AppleWebKit/605.1.15"
            ),
            device_scale_factor=2,
        )
        page = context.new_page()
        page.route("**script.google.com/**", lambda route: route.abort())

        # Every fresh page load starts at a two-language gate.
        page.goto(BASE, wait_until="load")
        assert page.locator("#language-gate").is_visible()
        assert page.locator("#landing-main").is_hidden()
        choices = page.locator(".language-choice")
        assert choices.count() == 2
        assert choices.all_inner_texts() == ["English", "中文"]
        assert page.locator("[data-lang='ko']").count() == 0

        # English keeps the existing English translation alongside the source.
        page.click(".language-choice[data-lang='en']")
        assert page.locator("#landing-main").is_visible()
        assert page.locator("#language-gate").is_hidden()
        assert page.get_attribute("html", "lang") == "en"
        assert "Draw Your Poem" in page.locator("#btn-start").inner_text()

        # Language is a per-page UI choice, not a persisted participant field.
        page.reload(wait_until="load")
        assert page.locator("#language-gate").is_visible()
        assert page.locator("#landing-main").is_hidden()

        # Chinese localises the interface but does not add a modern paraphrase.
        page.click(".language-choice[data-lang='zh']")
        assert page.get_attribute("html", "lang") == "zh-CN"
        assert page.locator("#landing-main .title").inner_text() == "感受诗意"
        assert page.locator("#btn-start").inner_text().strip() == "抽一张诗签"
        page.click("#btn-start")
        page.wait_for_timeout(500)
        assert page.locator("#s-draw .h2").inner_text() == "诗歌选择了你"

        page.click(".card-flip[data-card='0']")
        page.wait_for_selector(".card-flip.picked", timeout=3000)
        assert page.locator("#draw-banner-zh").inner_text()
        assert page.locator("#draw-banner-en").is_hidden()

        page.wait_for_selector("#s-feel.active", timeout=8000)
        assert page.locator("#chips .chip").first.inner_text() == "宁静"
        for index in (0, 3, 7):
            page.locator("#chips .chip").nth(index).click()
        page.click("#btn-feel-next")

        page.wait_for_selector("#s-reveal.active")
        assert page.locator("#verse-ancient").inner_text()
        assert page.locator("#verse-title-en").is_hidden()
        assert page.locator("#verse-translation").is_hidden()

        page.click("#btn-compare-next")
        page.wait_for_selector("#s-compare.active")
        assert page.locator("#s-compare .step-tag").inner_text() == "③ 同一首诗的两种图景"
        page.click("#btn-pick-1")
        page.locator("#likert-fit .likert-dot").nth(3).click()
        page.locator("#likert-resonance .likert-dot").nth(4).click()
        page.click("#btn-compare-done")

        page.wait_for_selector("#s-reflect.active")
        assert page.locator("#s-reflect .step-tag").inner_text() == "④ 最后一个问题（可选）"
        page.fill("#open-text", "想起冬日故乡。")
        page.click("#familiarity-chips .chip[data-val='some']")
        page.click("#btn-submit")

        page.wait_for_selector("#s-thanks.active")
        assert page.locator("#s-thanks .h2").inner_text() == "感谢参与！"
        assert "离线" in page.locator("#thanks-line").inner_text()
        queue = page.evaluate("JSON.parse(localStorage.getItem('ftp_queue_v1'))")
        payload = queue[-1]
        assert payload["keywords"] == ["peaceful", "joyful", "solitary"]
        assert "ui_language" not in payload

        browser.close()
        print("ALL BILINGUAL UI CHECKS PASSED")


if __name__ == "__main__":
    main()
