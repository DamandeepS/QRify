# QRify Privacy Policy

Effective date: November 13, 2026

This policy describes QRify's current Manifest V3 release, version 0.1.9.
Older releases may have different data-handling behavior.

## What QRify processes

QRify converts information into QR codes so users can share it with other
devices. When you open the toolbar popup or select a QRify right-click action,
the extension processes the information needed for that action:

- The current page URL.
- Text you select or a link you choose.
- Text you manually enter or paste into the toolbar popup.

QR generation takes place locally in your browser. QRify does not send this
information to the developer, an external QR-generation service, or an
analytics service.

## Collection, storage, and sharing

The current extension does not:

- Collect browsing history or monitor browsing activity in the background.
- Save QR inputs to disk, extension storage, or Chrome sync storage.
- Sell user information or share it with advertisers or data brokers.
- Use cookies, analytics, advertising, or tracking services.
- Automatically read your clipboard.

QRify uses temporary browser memory and page content to display inputs and QR
codes. Closing the toolbar popup removes its displayed content. Closing an
in-page overlay hides it but does not delete its content from that page.
Reloading or closing the tab removes the overlay from the current page.

Browser error messages may appear in local developer consoles when an action
fails. QRify does not upload these diagnostics.

## In-page overlays and sensitive information

When you use a right-click action, QRify inserts the QR code and its text into
the current webpage. Website scripts may be able to inspect this overlay,
including while it is hidden. Do not use in-page overlays for information you
do not want that website to access.

Anyone who can see or scan a QR code may read its contents. Avoid encoding
passwords, authentication tokens, or other sensitive information unless you
understand and accept that exposure.

## Permissions

- **activeTab:** Gives temporary access to the tab following an explicit user
  action, allowing QRify to obtain the current URL and display an overlay.
- **contextMenus:** Adds right-click actions for selected text, links, and the
  current page URL.
- **scripting:** Runs the bundled QR generator and overlay code in Chrome's
  isolated scripting context after a user invokes a right-click action.

QRify does not download or execute remotely hosted code.

## Other services

Chrome and the Chrome Web Store may process information under
[Google's Privacy Policy](https://policies.google.com/privacy), independently
of QRify. Websites you visit and apps you use to scan QR codes have their own
privacy practices.

If you contact the developer through GitHub, GitHub processes your submission
under its own policies. Repository issues are public; do not include sensitive
QR contents or personal information in them.

## Changes and contact

If QRify's data-handling practices change, this policy will be updated with a
new effective date.

For questions about this policy, contact the developer through the
[QRify issue tracker](https://github.com/DamandeepS/QRify/issues).
