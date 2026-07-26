# -*- coding: utf-8 -*-
"""Regression checks for the English/Chinese experiment interface."""

from playwright.sync_api import sync_playwright


BASE = "http://127.0.0.1:8321/"


def answer_rating(page):
    src = page.locator("#rating-screen-img").get_attribute("src").replace("\\", "/")
    values = (4, 5, 3) if "/c/C" in src else (2, 3, 4)
    page.locator("#rating-likert-visual-coherence .likert-dot").nth(values[0] - 1).click()
    page.locator("#rating-likert-affective-fidelity .likert-dot").nth(values[1] - 1).click()
    assert page.locator("#btn-rating-done").is_disabled()
    page.locator("#rating-likert-semantic-fidelity .likert-dot").nth(values[2] - 1).click()
    page.click("#btn-rating-done")


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

        page.goto(BASE, wait_until="load")
        assert page.locator("#language-gate").is_visible()
        assert page.locator("#landing-main").is_hidden()
        assert page.locator(".language-choice").all_inner_texts() == ["English", "中文"]
        assert page.locator("[data-lang='ko']").count() == 0

        page.click(".language-choice[data-lang='en']")
        assert page.get_attribute("html", "lang") == "en"
        assert "Draw Your Poem" in page.locator("#btn-start").inner_text()
        page.reload(wait_until="load")
        assert page.locator("#language-gate").is_visible()

        page.click(".language-choice[data-lang='zh']")
        assert page.get_attribute("html", "lang") == "zh-CN"
        assert page.locator("#landing-main .title").inner_text() == "感受诗意"
        assert page.locator("#btn-start").inner_text().strip() == "抽一张诗签"
        page.click("#btn-start")
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
        assert page.locator("#compare-progress").text_content() == "③ 第 1 轮，共 2 轮"
        assert page.locator("#btn-pick-neither").inner_text() == "两者无明显差异"
        assert page.locator("#cmp-img-1").get_attribute("alt") == "对比图像 A"
        assert page.locator("#cmp-img-2").get_attribute("alt") == "对比图像 B"
        page.click("#btn-pick-1")
        page.click("#btn-compare-done")
        assert page.locator("#compare-progress").text_content() == "③ 第 2 轮，共 2 轮"
        page.click("#btn-pick-neither")
        page.click("#btn-compare-done")

        page.wait_for_selector("#s-rating.active")
        assert page.locator("#rating-progress").text_content() == "④ 评价第 1 幅图像，共 2 幅"
        assert page.locator("#rating-title").inner_text() == "请评价第 1 幅图像，共 2 幅。"
        assert page.locator("#s-rating .likert-q").all_inner_texts() == [
            "整幅图像在视觉上有多连贯？",
            "这幅图像在多大程度上保留了诗歌的情感氛围？",
            "这幅图像在多大程度上准确呈现了诗中的关键意象与事件？",
        ]
        answer_rating(page)
        page.wait_for_selector("#s-rating.active")
        assert page.locator("#rating-progress").text_content() == "④ 评价第 2 幅图像，共 2 幅"
        answer_rating(page)

        page.wait_for_selector("#s-reflect.active")
        assert page.locator("#s-reflect .step-tag").text_content() == "⑤ 最后补充（可选）"
        page.fill("#open-text", "想起冬日故乡。")
        page.click("#familiarity-chips .chip[data-val='some']")
        page.click("#btn-submit")

        page.wait_for_selector("#s-thanks.active")
        assert page.locator("#s-thanks .h2").inner_text() == "感谢参与！"
        assert "离线" in page.locator("#thanks-line").inner_text()
        payload = page.evaluate("JSON.parse(localStorage.getItem('ftp_queue_v1')).at(-1)")
        assert payload["keywords"] == ["peaceful", "joyful", "solitary"]
        assert {payload["comparison_1_pair"], payload["comparison_2_pair"]} == {
            "narrative_vs_ancient",
            "narrative_vs_literal",
        }
        assert set(payload["rating_order"].split(">")) == {"narrative", "baseline"}
        assert payload["likert_visual_coherence"] == 4
        assert payload["likert_affective_fidelity"] == 5
        assert payload["likert_semantic_fidelity"] == 3
        assert payload["baseline_likert_visual_coherence"] == 2
        assert payload["baseline_likert_affective_fidelity"] == 3
        assert payload["baseline_likert_semantic_fidelity"] == 4
        for obsolete in (
            "opponent_group", "shown_first", "compare_choice", "likert_target_group",
            "likert_fit", "likert_resonance", "ui_language", "page_lang", "user_agent",
        ):
            assert obsolete not in payload

        browser.close()
        print("ALL BILINGUAL UI CHECKS PASSED")


if __name__ == "__main__":
    main()
