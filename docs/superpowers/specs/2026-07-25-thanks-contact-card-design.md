# Thanks-page contact card design

## Goal

Add a restrained research-contact card to the completed-test screen so interested
conference participants can contact the researcher without distracting them before
their response has been submitted.

## Placement and flow

The contact card appears only on `#s-thanks`, after the submission confirmation and
participant number, and before the existing “Draw Again” action.

The landing page remains focused on language choice, study context, and starting the
test. It does not contain a contact link or QR code.

## Content

The card contains:

- A localized heading: “Contact the research team” / “联系研究团队”.
- The WeChat QR code extracted from the user-provided image
  `5bac9804bbb09aa17c0825bd5a724d9b.jpg`.
- A localized same-device instruction:
  “Long-press the QR code to recognize it in WeChat.” /
  “长按二维码，在微信中识别并添加好友。”
- A visible, clickable email link: `vvv@stu.njau.edu.cn`.

No profile photo, location, screenshot chrome, or surrounding WeChat export text is
carried into the website asset.

## QR asset requirements

The QR code must be cropped deterministically from the supplied image and must not be
generated, redrawn, recolored, filtered, or recompressed in a way that changes its
modules. The extracted asset keeps a clean white quiet zone around all four edges.
It is saved as a lossless PNG under `assets/`.

The final asset must be checked with a QR decoder after extraction. It must also be
visually checked at the actual mobile display size.

## Visual treatment

The contact area uses the existing palette, type, spacing, and rounded-card language.
It is visually secondary to the thank-you message. The QR code is large enough to
recognize or long-press but does not dominate the screen.

The completed-test screen remains naturally scrollable on short phones rather than
shrinking the QR code or overlapping the “Draw Again” button.

## Localization and accessibility

All interface copy uses the existing `js/i18n.js` dictionary. English mode contains
only English contact instructions; Chinese mode contains only Chinese contact
instructions. The email address is identical in both modes and uses a `mailto:` link.

The QR image has a localized accessible label. It is not the only carrier of the
contact purpose: the visible heading and instruction explain what it does.

## Verification

- Add a regression test for card placement, localized strings, image reference,
  email link, and absence from the landing page.
- Decode the cropped PNG successfully.
- Run the existing bilingual, layout, and end-to-end tests.
- Check the thank-you screen at 390×844 and 375×667 in both languages.
- Bump the Service Worker cache version so deployed clients receive the new markup,
  styles, localization, and asset.
