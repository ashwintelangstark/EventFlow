# EventFlow — IDEA → AI → IMPACT

A scroll-driven, single-page event website for **IDEA → AI → IMPACT**, a half-day deep-tech innovation lab hosted at **AU-QUASAR, Alliance University, Bangalore**, by DataDice Technologies & AU-QUASAR.

> Bring a problem. Find a team. Build a solution.

## 📅 Event at a Glance

| | |
|---|---|
| **When** | Saturday, 24 October 2026 |
| **Time** | 10:00 AM – 1:00 PM (IST) |
| **Where** | AU-QUASAR, Alliance University, Bangalore |
| **Who** | Students, founders, startups, developers, researchers & tech enthusiasts |

### What you'll explore
1. Generative AI & AI Agents
2. Computer Vision
3. Quantum Computing
4. Robotics & Automation

## ✨ Features

- **Zero dependencies** — a single self-contained `index.html` (HTML + inline CSS + vanilla JS); no build step.
- **Dark, modern design** — OKLCH colour tokens, glowing gradients, and Space Grotesk / DM Sans typography from Google Fonts.
- **Scroll experience** — top-of-page progress bar, animated marquee, and section reveals as you scroll.
- **Actionable CTAs** — one-click *Add to Google Calendar* and a Google Maps link to the venue.
- **SEO & social ready** — descriptive title, meta description, and Open Graph / Twitter card tags.
- **Responsive** — layouts adapt from mobile to wide desktop screens.

## 📁 Project Structure

```
.
├── index.html              # The complete landing page (markup, styles, scripts)
├── images/
│   ├── datadice-mark.jpg     # DataDice logo mark
│   ├── dataslice-mark.jpg    # Header/footer brand mark
│   ├── deeptech-collage.jpg  # Hero collage
│   ├── registration-qr.jpg   # Registration QR code
│   └── venue-marks.jpg       # Venue / supporter logos
└── README.md
```

## 🚀 Getting Started

No installation required.

**Option 1 — open directly**

Double-click `index.html`, or open it in any modern browser.

**Option 2 — serve locally (recommended)**

```bash
git clone https://github.com/ashwintelangstark/EventFlow.git
cd EventFlow
python3 -m http.server 8080
```

Then visit <http://localhost:8080>.

## 🌐 Deployment

Because the site is fully static, it can be hosted anywhere:

- **GitHub Pages** — *Settings → Pages → Deploy from branch → `main` / root*.
- **Netlify / Vercel / Firebase Hosting** — point the publish directory at the repository root.

## ✏️ Customisation

All content and styling live in `index.html`:

- **Colours & fonts** — edit the CSS custom properties in the `:root` block at the top of the `<style>` tag.
- **Event details** — update the date, time, and venue text in the *Event details* section, along with the Google Calendar and Google Maps URLs.
- **Images** — replace files in `images/` while keeping the same filenames (or update the `src` attributes).

## 🤝 Credits

Organised by **DataDice Technologies** in collaboration with **AU-QUASAR, Alliance University**.
