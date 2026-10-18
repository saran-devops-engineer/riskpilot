# RiskPilot

A lightweight, mobile-friendly PWA that calculates stock entry, stop-loss risk, quantity to buy, and 1:2 target prices — keeping planned risk fixed at **₹1,000 per trade**.

## Features

- Two inputs only: **Entry Price** and **Stop-Loss Price**
- Instant recalculation on every keystroke
- Fixed ₹1,000 max risk, automatic quantity sizing, 1:2 risk-to-reward target
- Clear separation of **Risk** and **Reward** values, with quantity and target price highlighted
- Validation: positive numbers required, entry must be > stop-loss, quantity rounded down, warning when the stop is too wide for ₹1,000
- Installable PWA (manifest + service worker) — works fully offline
- No backend, no login, no APIs, no build step

## Calculations

| Metric | Formula |
|---|---|
| Risk per Share | Entry − Stop-Loss |
| Quantity to Buy | floor(₹1,000 ÷ Risk per Share) |
| Target Points | Risk per Share × 2 |
| Target Price | Entry + Target Points |
| Total Planned Risk | Risk per Share × Quantity |
| Potential Profit | (Target Price − Entry) × Quantity |
| Capital Required | Entry Price × Quantity |

Example: Entry ₹100, Stop-Loss ₹80 → Risk ₹20/share, 50 shares, Target ₹140, Planned Risk ₹1,000, Potential Profit ₹2,000.

> Estimates exclude brokerage, taxes, slippage and other trading costs. This is a calculation tool, not a trading recommendation.

## Run Locally

PWA service workers require a secure context — serve over `localhost` (not `file://`):

```bash
npx serve .
# or
python -m http.server 8000
```

Open http://localhost:8000 (or 3000 for `npx serve`). On mobile/Chrome, use **Add to Home Screen** to install.

## Deploy

Any static host works (GitHub Pages, Netlify, Vercel, Cloudflare Pages). No build step — upload the repo contents as-is.

## Files

- `index.html` — app shell
- `styles.css` — mobile-first dark UI
- `app.js` — calculation + validation logic
- `manifest.webmanifest`, `sw.js`, `icons/` — PWA install & offline support
