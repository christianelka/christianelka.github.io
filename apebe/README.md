# Hotel Lock System & Keycard — B2B Catalog Website

A static B2B catalog website for hotel lock systems (multi-brand) and RFID keycard supplies, targeting the Indonesian hotel industry. Built on the Techor HTML5 template from ThemeForest and deployed serverlessly on GitHub Pages or Cloudflare Pages with zero hosting cost.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Template | Techor (ThemeForest) — HTML5, CSS3, Bootstrap 5 |
| Styling | SCSS (compiled to CSS), Font Awesome 6 Pro |
| Fonts | Inter (body), Outfit (headings) via Google Fonts |
| JS Libraries | jQuery, Bootstrap Bundle, Slick, Swiper, WOW.js, GSAP, Isotope, Magnific Popup |
| Form Handling | WhatsApp API (primary), Web3Forms (fallback) |
| Hosting | GitHub Pages / Cloudflare Pages (static, zero server cost) |

---

## Local Development

```bash
cd hotel-system
npx serve .
# Open http://localhost:3000
```

No build step is required. All assets are pre-compiled. Edit HTML files directly and refresh the browser, or use VS Code Live Server for auto-reload on save.

---

## Documentation Index

| Document | Description | Status |
|---|---|---|
| `brief.md` | Project brief: business model, audience, sitemap, timeline | ✅ Ada |
| `docs/design.md` | Reverse-engineered design tokens from template SCSS | ❌ Belum dibuat |
| `docs/task.md` | Work Breakdown Structure checklist | ❌ Belum dibuat |
| `docs/content.md` | Product data and B2B copywriting | ❌ Belum dibuat |
| `docs/integrations.md` | Serverless form routing and tracking code | ❌ Belum dibuat |
| `docs/seo.md` | SEO keyword mapping and meta tags | ❌ Belum dibuat |
| `docs/deploy.md` | Deployment runbook for GitHub Pages and Cloudflare Pages | ❌ Belum dibuat |

---

## Directory Structure

```
hotel-system/
├── index.html              # Homepage
├── about.html              # Software & Integrations
├── service.html            # Hotel Lock Systems catalog
├── service-details.html    # Lock product detail
├── project.html            # Keycard Solutions
├── project-details.html    # Keycard detail
├── contact.html            # RFQ / Contact
├── faq.html                # FAQ
├── 404.html                # Error page
├── robots.txt              # Search engine crawl rules
├── sitemap.xml             # XML sitemap for Search Console
├── brief.md                # Project brief (ID)
├── assets/
│   ├── css/                # Compiled CSS
│   ├── scss/               # Source SCSS
│   ├── js/                 # JavaScript
│   ├── img/                # Images
│   ├── fonts/              # Font Awesome woff2
│   └── pdf/                # Product datasheets
└── README.md               # This file
```

> **Catatan:** file `CNAME` (custom domain GitHub Pages) dan folder `docs/`
> belum ada di repo — tambahkan saat domain produksi sudah diputuskan.

---

## License

The Techor ThemeForest template and its bundled assets (CSS framework, JS plugins, icon fonts) are subject to the ThemeForest Regular License. That license permits use on one end product (this site) but does not transfer ownership of the template to this project.

Custom code, content copy, product photography, and B2B-specific modifications made to this project are proprietary and owned by the business operating this site. Do not redistribute the modified template or use it as a base for other commercial projects without purchasing a separate ThemeForest license.
