# -*- coding: utf-8 -*-
"""The post-submission contact card uses the supplied, decodable WeChat QR."""

from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright
import zxingcpp


ROOT = Path(__file__).resolve().parents[1]
QR_PATH = ROOT / "assets" / "wechat-qr.png"
BASE = "http://127.0.0.1:8321/"


def check_qr_asset():
    assert QR_PATH.exists(), "missing extracted WeChat QR asset"
    with Image.open(QR_PATH) as image:
        assert image.format == "PNG"
        assert image.size == (729, 729)
        decoded = zxingcpp.read_barcode(image)
    assert decoded is not None, "extracted WeChat QR must decode"
    assert decoded.format == zxingcpp.BarcodeFormat.QRCode
    assert decoded.text, "decoded WeChat QR payload must not be empty"


def show_thanks(page):
    page.evaluate(
        """() => {
            document.querySelectorAll(".screen").forEach((screen) => {
                screen.classList.remove("active");
            });
            document.querySelector("#s-thanks").classList.add("active");
        }"""
    )


def check_contact_card():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={"width": 390, "height": 844})

        page.goto(BASE, wait_until="load")
        page.click(".language-choice[data-lang='en']")
        show_thanks(page)
        card = page.locator("#s-thanks .contact-card")
        assert card.count() == 1
        assert page.locator("#s-landing .contact-card").count() == 0
        assert card.locator(".contact-title").inner_text() == "Contact the research team"
        assert card.locator(".contact-instruction").inner_text() == (
            "Long-press the QR code to recognize it in WeChat."
        )
        image = card.locator(".contact-qr")
        assert image.get_attribute("src") == "assets/wechat-qr.png"
        assert image.get_attribute("alt") == "WeChat contact QR code"
        email = card.locator(".contact-email")
        assert email.get_attribute("href") == "mailto:vvv@stu.njau.edu.cn"
        assert email.locator(".contact-email-label").count() == 1
        assert email.locator(".contact-email-label").inner_text() == "✉ Email"
        assert (
            email.locator(".contact-email-address").inner_text()
            == "vvv@stu.njau.edu.cn"
        )
        assert page.locator(".contact-card + #btn-again").count() == 1

        page.reload(wait_until="load")
        page.click(".language-choice[data-lang='zh']")
        show_thanks(page)
        card = page.locator("#s-thanks .contact-card")
        assert card.locator(".contact-title").inner_text() == "联系研究团队"
        assert card.locator(".contact-instruction").inner_text() == (
            "长按二维码，在微信中识别并添加好友。"
        )
        assert card.locator(".contact-qr").get_attribute("alt") == "微信联系二维码"
        assert card.locator(".contact-email-label").inner_text() == "✉ 邮箱"

        browser.close()



def main():
    check_qr_asset()
    check_contact_card()
    print("ALL THANKS CONTACT CHECKS PASSED")


if __name__ == "__main__":
    main()
