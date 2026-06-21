# Image Assets — 10 Template Undangan

Source: `invitation/undangan_*.html` (10 files)
Storage: `invitation/assets/img/` (local, 21 files, ~3.8 MB total)
Strategy: 1 representative size per unique photo ID → served via local path

## Final Asset Manifest (21 files)

| Contextual Name | Photo ID | Size (bytes) | Used In |
|-----------------|----------|-------------:|---------|
| `couple-hero.jpg` | 1519741497674-611481863552 | 83,573 | vvip, ethereal, intimate, digital_vvip (bg), tropical (bg) |
| `groom-portrait.jpg` | 1516589178581-6cd7833ae3b2 | 218,117 | digital_vvip |
| `bride-portrait.jpg` | 1529626455594-4ff0802cfb7e | 272,857 | digital_vvip |
| `groom-portrait-2.jpg` | 1507003211169-0a1dd7228f2d | 193,246 | editorial, jawa_adat, tropical |
| `bride-portrait-2.jpg` | 1494790108377-be9c29b29330 | 143,701 | editorial, jawa_adat, memphis_pop |
| `groom-portrait-3.jpg` | 1500648767791-00dcc994a43e | 362,191 | memphis_pop |
| `bride-portrait-3.jpg` | 1515934751635-c81c6bc9a2d8 | 120,345 | tropical |
| `prewedding-cover.jpg` | 1606800052052-a08af7148866 | 110,367 | chinese_christian, marigold, jawa_adat (bg), memphis_pop |
| `gallery-moment-1.jpg` | 1511285560929-80b456fea0bc | 161,916 | chinese_christian, ethereal, intimate, digital_vvip, marigold, jawa_adat, memphis_pop, tropical |
| `gallery-moment-2.jpg` | 1465495976277-4387d4b0b4c6 | 106,368 | ethereal, intimate, digital_vvip, marigold, jawa_adat, memphis_pop |
| `gallery-moment-3.jpg` | 1529636798458-92182e662485 | 105,900 | ethereal, intimate, digital_vvip, editorial |
| `gallery-moment-4.jpg` | 1474552226712-ac0f0961a954 | 92,460 | ethereal, intimate, digital_vvip |
| `gallery-moment-5.jpg` | 1510076857177-7470076d4098 | 186,422 | ethereal, digital_vvip, tropical |
| `gallery-moment-6.jpg` | 1522673607200-164d1b6ce486 | 261,437 | chinese_christian, tropical |
| `gallery-moment-7.jpg` | 1464366400600-7168b8af9bc3 | 179,628 | chinese_christian |
| `gallery-moment-8.jpg` | 1511795409834-ef04bbd61622 | 146,003 | tropical |
| `ceremony-scene.jpg` | 1519225421980-715cb0215aed | 136,486 | editorial |
| `dinner-scene.jpg` | 1530103862676-de8c9debad1d | 90,753 | editorial |
| `proposal-scene.jpg` | 1520854221256-17451cc331bf | 81,045 | editorial, jawa_adat |
| `together-moment.jpg` | 1583939003579-730e3918a45a | 515,168 | editorial, memphis_pop |
| `rings-detail.jpg` | 1606216794074-735e91aa2c92 | 340,747 | editorial, marigold, jawa_adat |

**Total: 21 files / 3,908,759 bytes (~3.8 MB)**

## Naming Convention
- `{role}-{variant}.jpg` — portrait (groom, bride)
- `{context}-{index}.jpg` — gallery moments
- `{scene}.jpg` — single-scene photos (ceremony, dinner, proposal)
- `{object}.jpg` — detail shots (rings, together)

## Rejected URLs (non-photo, kept as-is in HTML)
- `https://api.qrserver.com/v1/create-qr-code/...` (4×) — dynamic QR codes
- `https://www.soundhelix.com/examples/mp3/...` (3×) — background audio
- `https://www.transparenttextures.com/patterns/carbon-fibre.png` (1×) — CSS texture

## Broken Photo ID Replaced
- `1542038596-f99df89961f6` (tropical hero bg, Unsplash 404) → swapped to local `couple-hero.jpg`
