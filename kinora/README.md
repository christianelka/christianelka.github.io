# KINORA — Full-Screen Hero Landing Page

A production-quality recreation of the GreenGuard hero reference, rebranded
as **KINORA**: a full-screen immersive hero with the supplied waving-characters
video as the background, centered headline, feature icons, and a black pill CTA —
plus the full one-page landing sections (About, Solutions, Community, Contact)
so the navigation scrolls to real content.

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
  Navbar.tsx                # leaf logo, center links, Get Started pill (sticky, solid on scroll)
  HeroContent.tsx           # icon row, headline, subheading, CTA
  FeatureIcons.tsx          # Users, Heart, ShieldCheck, Sparkles, Globe
  HeroCTA.tsx               # pill button with circular arrow (dark / light variants)
  SectionHeader.tsx         # shared eyebrow + title + description
  AboutSection.tsx          # story + three values
  SolutionsSection.tsx      # three solution cards
  CommunitySection.tsx      # dark green band + join CTA
  ContactSection.tsx        # contact info + demo form with success state
  Footer.tsx                # slim dark footer
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

