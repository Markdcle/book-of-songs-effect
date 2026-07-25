# Thanks-page Contact Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bilingual research-contact card to the post-submission thank-you screen using the exact WeChat QR code from the supplied image and the email `vvv@stu.njau.edu.cn`.

**Architecture:** Keep the feature inside the existing static page and i18n dictionary. Extract the QR code once into a lossless project asset, add one semantic contact-card block to `#s-thanks`, and extend the current static-string pass only enough to localize the image alternative text.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Python 3, Pillow, zxing-cpp, Playwright.

---

### Task 1: Add the QR asset regression check

**Files:**
- Create: `tests/test_thanks_contact.py`
- Create later: `assets/wechat-qr.png`

- [ ] **Step 1: Install the local QR decoder used only by the test**

Run:

```powershell
python -m pip install zxing-cpp
```

Expected: installation completes and `python -c "import zxingcpp"` exits with code 0.

- [ ] **Step 2: Write the failing asset test**

Create `tests/test_thanks_contact.py` with:

```python
# -*- coding: utf-8 -*-
"""The post-submission contact card uses the supplied, decodable WeChat QR."""

from pathlib import Path

from PIL import Image
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


def main():
    check_qr_asset()
    print("ALL THANKS CONTACT CHECKS PASSED")


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Run the test to verify RED**

Run:

```powershell
python tests\test_thanks_contact.py
```

Expected: FAIL with `missing extracted WeChat QR asset`.

- [ ] **Step 4: Extract the supplied QR deterministically**

Use Pillow to crop pixel box `(92, 358, 821, 1087)` from:

```text
D:\weixinjilu\xwechat_files\wxid_w3yfgijqyzy321_14f7\temp\RWTemp\2026-07\9e20f478899dc29eb19741386f9343c8\5bac9804bbb09aa17c0825bd5a724d9b.jpg
```

Save the crop without resizing or filtering:

```powershell
python -c "from PIL import Image; src=Image.open(r'D:\weixinjilu\xwechat_files\wxid_w3yfgijqyzy321_14f7\temp\RWTemp\2026-07\9e20f478899dc29eb19741386f9343c8\5bac9804bbb09aa17c0825bd5a724d9b.jpg').convert('RGB'); src.crop((92,358,821,1087)).save(r'assets\wechat-qr.png', format='PNG', optimize=True)"
```

- [ ] **Step 5: Run the asset test to verify GREEN**

Run:

```powershell
python tests\test_thanks_contact.py
```

Expected: `ALL THANKS CONTACT CHECKS PASSED`.

### Task 2: Add failing bilingual contact-card checks

**Files:**
- Modify: `tests/test_thanks_contact.py`

- [ ] **Step 1: Extend the test with real-browser assertions**

Add:

```python
from playwright.sync_api import sync_playwright


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
        assert email.inner_text() == "vvv@stu.njau.edu.cn"
        assert email.get_attribute("href") == "mailto:vvv@stu.njau.edu.cn"
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

        browser.close()
```

Call `check_contact_card()` after `check_qr_asset()` in `main()`.

- [ ] **Step 2: Run the test to verify RED**

Run:

```powershell
python tests\test_thanks_contact.py
```

Expected: FAIL because `#s-thanks .contact-card` does not exist.

### Task 3: Implement the contact card and localization

**Files:**
- Modify: `index.html`
- Modify: `js/i18n.js`
- Modify: `css/style.css`

- [ ] **Step 1: Add localized strings**

Add these keys under both `thanks` dictionaries in `js/i18n.js`:

```javascript
contactTitle: "Contact the research team",
contactInstruction: "Long-press the QR code to recognize it in WeChat.",
qrAlt: "WeChat contact QR code",
```

```javascript
contactTitle: "联系研究团队",
contactInstruction: "长按二维码，在微信中识别并添加好友。",
qrAlt: "微信联系二维码",
```

- [ ] **Step 2: Localize image alternative text**

In the existing `applyStaticStrings()` function, add:

```javascript
document.querySelectorAll("[data-i18n-alt]").forEach(function (element) {
  element.setAttribute("alt", t(element.getAttribute("data-i18n-alt")));
});
```

- [ ] **Step 3: Add the semantic contact card**

Insert immediately before `#btn-again`:

```html
<aside class="contact-card" aria-labelledby="contact-title">
  <h3 class="contact-title" id="contact-title" data-i18n="thanks.contactTitle">Contact the research team</h3>
  <img
    class="contact-qr"
    src="assets/wechat-qr.png"
    alt="WeChat contact QR code"
    data-i18n-alt="thanks.qrAlt"
    width="729"
    height="729"
  >
  <p class="contact-instruction" data-i18n="thanks.contactInstruction">Long-press the QR code to recognize it in WeChat.</p>
  <a class="contact-email" href="mailto:vvv@stu.njau.edu.cn">vvv@stu.njau.edu.cn</a>
</aside>
```

- [ ] **Step 4: Style the card with existing visual language**

Add focused thank-you styles:

```css
.contact-card {
  width: min(100%, 340px); margin: 26px auto 20px; padding: 18px;
  border: 1px solid var(--gold-dim); border-radius: 16px;
  background: rgba(22, 73, 76, .45);
}
.contact-title { color: var(--cream); font: 600 1rem var(--sans); }
.contact-qr {
  display: block; width: min(100%, 210px); height: auto; margin: 14px auto 12px;
  border-radius: 10px;
}
.contact-instruction { color: var(--text-dim); font: .84rem/1.5 var(--sans); }
.contact-email {
  display: inline-block; margin-top: 9px; color: var(--gold);
  font: .9rem var(--sans); overflow-wrap: anywhere;
}
#s-thanks #btn-again { margin-top: 0; }
```

- [ ] **Step 5: Run the focused test to verify GREEN**

Run:

```powershell
python tests\test_thanks_contact.py
```

Expected: `ALL THANKS CONTACT CHECKS PASSED`.

### Task 4: Refresh offline cache and run regressions

**Files:**
- Modify: `sw.js`

- [ ] **Step 1: Update the Service Worker**

Change:

```javascript
const CACHE = "book-of-songs-v7";
```

to:

```javascript
const CACHE = "book-of-songs-v8";
```

Add `"assets/wechat-qr.png"` to `CORE`.

- [ ] **Step 2: Run syntax and static checks**

Run:

```powershell
node --check js\i18n.js
node --check sw.js
git diff --check
```

Expected: all commands exit with code 0 and no errors.

- [ ] **Step 3: Run the focused and existing browser tests**

Start the local server:

```powershell
python -m http.server 8321
```

In another shell, run:

```powershell
python tests\test_thanks_contact.py
python tests\test_english_cleanup.py
python tests\test_i18n.py
python tests\test_draw_layout.py
cd ..\tools
python e2e_test.py
```

Expected:

```text
ALL THANKS CONTACT CHECKS PASSED
ALL ENGLISH CLEANUP CHECKS PASSED
ALL BILINGUAL UI CHECKS PASSED
ALL DRAW LAYOUT CHECKS PASSED
ALL E2E CHECKS PASSED
```

- [ ] **Step 4: Perform mobile visual checks**

Use Playwright at 390×844 and 375×667 in both languages. Verify:

- The contact card appears only after submission.
- The QR remains square, sharp, and fully visible.
- The email is readable and clickable.
- Short screens scroll naturally without overlap.
- English contact UI contains no Chinese text.

- [ ] **Step 5: Review the final diff**

Run:

```powershell
git status --short
git diff --stat
git diff -- index.html css/style.css js/i18n.js sw.js tests/test_thanks_contact.py
```

Expected changed scope: the four existing UI/cache files, one new test, and one new QR asset.
