# KINORA — Full-Screen Hero Landing Page

A production-quality recreation of the GreenGuard hero reference, rebranded
as **KINORA**: a full-screen immersive hero with the supplied waving-characters
video as the background, centered headline, feature icons, and a black pill CTA.

## Tech stack

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4
- `lucide-react` for interface icons
- Fonts via `next/font/google`: Plus Jakarta Sans (headings) + Inter (body)

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build
npm start        # http://localhost:3000
```

## Structure

```
app/
  layout.tsx          # fonts (next/font/google), metadata
  page.tsx            # hero composition only
  globals.css         # tokens, base styles, entrance animations
  icon.svg            # KINORA leaf favicon
components/
  HeroVideoBackground.tsx   # autoplay/muted/loop video + green overlay + fallback
  Navbar.tsx                # leaf logo, center links, Get Started pill
  HeroContent.tsx           # icon row, headline, subheading, CTA
  FeatureIcons.tsx          # Users, Heart, ShieldCheck, Sparkles, Globe
  HeroCTA.tsx               # black pill button with circular arrow
```

## Notes

- The hero is a single section only — no extra sections, footer, or grids.
- The background video streams from Cloudinary (URL in
  `components/HeroVideoBackground.tsx`). If it fails to load, the hero falls
  back to the solid `#397C50` green background.
- Entrance animations respect `prefers-reduced-motion`.
- Verified: production build passes, video autoplays and loops, no console
  errors, no horizontal overflow at 1440px, 1280px, and 390px widths.
```

