# FRONTEND — Surat Terakhir

> Spesifikasi UI/UX untuk 4 halaman: Welcome, Moderator, Player, Display.
> Mobile-first. **Modern Purple Mobile** (adaptasi dari `image_4e3d3c.jpg` referensi). Vanilla HTML + Tailwind CDN + Alpine.js.

---

## 1. DESIGN SYSTEM

> **Source of truth:** `image_4e3d3c.jpg` — referensi visual user (purple mobile app dengan pattern kartu "Welcome to / Rewards / Referrals" bertumpuk isometric).
>
> Adaptasi: palette vibrant purple `#8A2BE2` sebagai primary, card putih dengan rounded-3xl, header card bertumpuk, action card dengan icon chip ungu.

### 1.1 Color Tokens

```css
:root {
  /* Brand (purple) */
  --brand-50:  #F5F0FF;  /* soft tint */
  --brand-100: #EDE0FF;  /* hover bg */
  --brand-200: #D9C2FF;  /* decorative */
  --brand-300: #BE9BFF;  /* mid */
  --brand-400: #9F6BFF;  /* bright accent */
  --brand-500: #8A2BE2;  /* PRIMARY */
  --brand-600: #7823CC;  /* hover */
  --brand-700: #621CAA;  /* gradient end */
  --brand-800: #4E1688;
  --brand-900: #3B1066;

  /* Neutral (gray) */
  --bg-page:    #F9FAFB;  /* gray-50, app background */
  --bg-card:    #FFFFFF;  /* card surface */
  --bg-muted:   #F3F4F6;  /* nested element */
  --border:     #E5E7EB;  /* structural */
  --text-primary:   #111827;  /* gray-900 */
  --text-secondary: #6B7280;  /* gray-500 */
  --text-muted:     #9CA3AF;  /* gray-400 */

  /* Status */
  --color-agen:    #EF4444;  /* red-500 */
  --color-aman:    #10B981;  /* green-500 */
  --color-warning: #F59E0B;  /* amber-500 */

  /* Shadows (subtle, modern SaaS) */
  --shadow-card:     0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-cardHover:0 8px 24px rgba(138,43,226,0.10), 0 2px 6px rgba(0,0,0,0.06);
  --shadow-screen:   0 20px 40px -10px rgba(138,43,226,0.25), 0 8px 16px -4px rgba(0,0,0,0.08);

  /* Radius (rounded-2xl/3xl dominance) */
  --r-md: 12px;  --r-lg: 16px;  --r-xl: 20px;  --r-2xl: 22px;  --r-3xl: 28px;  --r-full: 9999px;

  /* Motion */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 150ms;  --dur-normal: 300ms;  --dur-slow: 600ms;
}
```

### 1.2 Typography

- **Display/Headlines:** `Plus Jakarta Sans` weight 700-800, tight tracking
- **Body:** `Plus Jakarta Sans` weight 400-600
- **Mono:** `font-mono` (system mono) untuk kode/timer
- **Eyebrow labels:** uppercase, 9-10px, tracking 0.2em, font-weight 700

Font load via Google Fonts CDN.

### 1.3 Breakpoints

| Name | Min-width | Target |
|---|---|---|
| `mobile-sm` | 0 | iPhone SE, Android kecil |
| `mobile` | 375 | standar HP |
| `mobile-lg` | 414 | iPhone Plus, HP besar |
| `tablet` | 768 | iPad mini |
| `desktop` | 1024 | laptop |
| `desktop-lg` | 1280 | monitor besar |

**Primary target: 360-414px (HP).** Semua layout harus graceful di ukuran ini.

### 1.4 Animation Principles

- **Spring physics:** semua transisi pakai `--ease-spring`
- **Stagger:** list items mount dengan delay 60-100ms each
- **GPU only:** animate `transform` dan `opacity`. **JANGAN** `top/left/width/height`
- **Reduced motion:** respect `prefers-reduced-motion`
- **Float effect:** ilustrasi hero `float` 4s ease-in-out infinite

---

## 1.5 SIGNATURE PATTERNS (dari image_4e3d3c.jpg)

### A. Section Header Card (Rewards/Referrals style)

```html
<div class="sec-header">
  <div>
    <p class="text-[9px] font-bold tracking-[0.2em] uppercase opacity-80">Label Kecil</p>
    <p class="font-extrabold text-sm mt-0.5">Judul Utama</p>
  </div>
  <div class="sec-x">×</div>
</div>
<div class="sec-body">...</div>
```

- Background: `linear-gradient(135deg, #8A2BE2, #621CAA)`
- Top corners rounded 22px, bottom flat (terhubung ke body)
- Icon X pojok kanan atas (white/18% opacity)
- Label kecil uppercase di atas judul

### B. Action Card (Rewards grid item)

```html
<button class="action-card">
  <div class="icon-chip"><svg>...</svg></div>
  <div class="flex-1">
    <div class="label">Judul</div>
    <div class="desc">Subtitle</div>
  </div>
</button>
```

- Background: `#F9FAFB` (gray-50)
- Border: `1px solid #F3F4F6`
- Border-radius: 16px
- Icon chip: 32x32, `bg-brand-50`, `text-brand-500`, rounded 10px
- Hover: `bg-brand-50`, `border-brand-100`, icon chip invert (purple bg, white icon)

### C. Iso-Tilted Preview Stack (Welcome page only)

- 3 kartu di-tilt -8°/0°/+8° dengan z-index bertingkat
- Perspektif 1200px pada parent
- Soft purple drop shadow

---

## 2. Halaman: WELCOME (`/`)

### 2.1 Layout

```
┌────────────────────────────────────┐
│  Background: animated gradient     │
│  (emerald → indigo → black)        │
│                                    │
│         🔐 (icon, 64px)            │
│                                    │
│      Surat Terakhir                │
│   (h1, Geist 800, 32px)           │
│                                    │
│   Game deteksi kitab Alkitab       │
│   (p, Geist 400, 14px)            │
│                                    │
│  ┌──────────────────────────┐    │
│  │  [password input]         │    │
│  │  (input, 18px, glass)     │    │
│  └──────────────────────────┘    │
│                                    │
│  ┌──────────────────────────┐    │
│  │  MASUK  →                 │    │
│  │  (button, gradient, glow) │    │
│  └──────────────────────────┘    │
│                                    │
│   v1.0.0  ·  dibuat dengan ❤️      │
└────────────────────────────────────┘
```

### 2.2 Komponen

- **Background:** `<div class="bg-animated">` dengan gradient + noise overlay
- **Logo icon:** emoji 🔐 + animated pulse glow
- **Title:** `<h1>Surat Terakhir</h1>` dengan gradient text effect
- **Tagline:** `<p>Game deteksi kitab Alkitab</p>` (Instrument Serif italic)
- **Form:** `<form>` dengan input password + submit button
- **Error state:** inline message di bawah input (red glow)
- **Loading state:** button disabled + spinner

### 2.3 Behavior

- **Submit:** POST `/api/auth` → set cookie → redirect ke `/moderator` atau `/player` (sesuai role)
- **Error 401:** shake animation pada input, tampilkan pesan "Password salah"
- **Rate limit 5x:** tampilkan "Terlalu banyak percobaan. Coba lagi dalam 5 menit."
- **Empty submit:** prevent default, focus ke input
- **Caps lock detection:** warning icon di pojok input

### 2.4 States

| State | Visual |
|---|---|
| `idle` | Input normal, button enabled |
| `focus` | Input glow emerald, button brighter |
| `submitting` | Button disabled, spinner |
| `error` | Input border red, shake, error message |
| `rate-limited` | Form disabled, countdown timer |

---

## 3. Halaman: MODERATOR (`/moderator`)

### 3.1 Layout (Single-Page App)

```
┌──────────────────────────────────────────────┐
│ Header: Logo · Room Code (copy) · Status     │
├──────────────────────────────────────────────┤
│                                              │
│  Tabs: [Setup] [Lobby] [Game] [Log] [AI]     │
│                                              │
│  Tab content (one of):                       │
│                                              │
│  [SETUP]                                     │
│   - Pilih tier (radio: Pemula/Menengah/Mahir)│
│   - Pilih total ronde (1-10, default 5)      │
│   - Tombol "Generate Kode Room"              │
│                                              │
│  [LOBBY]                                     │
│   - Live player list (avatar + nama + status)│
│   - Empty state: "Belum ada pemain"          │
│   - Tombol "Mulai Ronde 1" (disabled < 3 player)│
│                                              │
│  [GAME]                                      │
│   - Ronde indicator (1/5, 2/5, dst)           │
│   - Timer (countdown per fase)               │
│   - Pertanyaan moderator (panel)             │
│   - Tombol kontrol:                           │
│     · Mulai Fase Baca                        │
│     · Mulai Diskusi                          │
│     · Mulai Voting                           │
│     · Buka Amplop                            │
│     · Lanjut Ronde                           │
│   - Skor live (pembawa vs agen)              │
│   - Log ronde (accordion)                    │
│                                              │
│  [LOG]                                       │
│   - Timeline event (join, vote, reveal)      │
│   - Filter by type                            │
│                                              │
│  [AI]                                        │
│   - Status: key aktif, request tersisa       │
│   - Tombol "Generate Fragmen"                 │
│   - Form: kitab, tema, jumlah                 │
│   - History generate                          │
│                                              │
└──────────────────────────────────────────────┘
```

### 3.2 Komponen Detail

**Player Card:**
```
┌────────────────────┐
│ 🟢  ANAK A         │  ← dot koneksi + nama
│     ketua tim      │  ← role/team (optional)
│     sejak 14:30     │  ← joined time
└────────────────────┘
```

**Timer Display:**
```
┌────────────────────┐
│  ⏱  02:47          │  ← big mono font
│  Fase Diskusi      │  ← phase label
│  ──────────        │  ← progress bar
└────────────────────┘
```

**Question Panel (Tiers):**
- Tier 1: 8 pertanyaan perasaan
- Tier 2: 8 pertanyaan keyword
- Tier 3: 10 pertanyaan teologis
- Toggle visibility per pertanyaan (clue gate)

**Score Display:**
```
Pembawa      Agen
  45  vs  30
  ▓▓▓▓▓▓░░  ▓▓▓▓░░░
```

**Mystery Control:**
- Tiap pemain → 3 amplop warna
- Klik "Buka Amplop" untuk 1 pemain → pilih amplop → reveal
- Visual: amplop flip animation 600ms

### 3.3 Behavior

- **Realtime update:** Socket.io events update UI tanpa refresh
- **Optimistic UI:** klik tombol → update lokal dulu, sync dari server
- **Offline detection:** banner warning kalau koneksi putus, reconnect otomatis
- **Confirm dangerous action:** "Akhiri Sesi" butuh double confirm
- **Keyboard shortcuts:** `Space` = next phase, `Esc` = cancel modal, `?` = help

---

## 4. Halaman: PLAYER (`/player`)

### 4.1 Layout (Mobile-First)

```
┌──────────────────┐
│  ← Back    🟢   │  ← status indicator
│                  │
│  Selamat datang, │
│  ANAK A          │
│                  │
│  ┌────────────┐  │
│  │  FRAGMEN    │  │  ← glass card, big text
│  │  KAMU:      │  │
│  │             │  │
│  │  "TUHAN     │  │
│  │  adalah     │  │
│  │  gembalaku" │  │
│  │             │  │
│  │  Mazmur 23  │  │  ← kitab label (small, muted)
│  └────────────┘  │
│                  │
│  Amplop Misteri: │
│  🟥 🟨 🟩        │  ← 3 amplop, tap untuk info
│                  │
│  ──────────      │
│  FASE: Diskusi   │  ← phase indicator
│  ⏱ 02:47         │
│                  │
│  [Tombol Vote]   │  ← enabled saat voting
│                  │
│  [Help Button]   │  ← bottom right floating
│                  │
└──────────────────┘
```

### 4.2 Komponen Detail

**Fragmen Card:**
- Background: glass dengan border emerald subtle
- Text: 24px (HP) / 28px (tablet), wrap natural
- Reveal animation: scale 0.95 → 1.0, fade in
- Tap untuk fullscreen view

**Mystery Envelope:**
- Closed state: 3 icon amplop, warna sesuai (merah/kuning/hijau)
- Tap closed → tooltip "Klik untuk lihat efek (saat dibuka moderator)"
- Opened state: sudah terbuka, warna lebih faded, dengan label "TERBUKA: Merah"
- Locked: tidak bisa tap (sampai moderator buka)

**Phase Indicator:**
- 4 status: Lobby / Baca / Diskusi / Voting / Reveal
- Progress dots: ●○○○
- Aktif phase: animated pulse

**Timer Display (kecil):**
- Mono font, 18px
- Warning color saat < 30 detik

**Vote Modal:**
```
┌──────────────────┐
│  Vote Pemain      │
│  "Yang paling     │
│   beda?"         │
│                  │
│  ○ ANAK A        │
│  ○ ANAK B        │
│  ○ ANAK C        │
│  ○ ANAK D        │
│  ○ ANAK E        │
│                  │
│  [KONFIRMASI]    │
└──────────────────┘
```

**Reveal Card (setelah vote):**
```
┌──────────────────┐
│  🔓 Amplop      │
│     Merah        │
│                  │
│  "FRAGMENMU     │
│   DARI KITAB    │
│   KIDUNG        │
│   AGUNG"        │
│                  │
│  Semua tahu     │
│  kamu Agen!     │
└──────────────────┘
```

### 4.3 Behavior

- **Auto-reconnect:** kalau socket disconnect, otomatis reconnect, state di-restore dari server
- **Vibration feedback:** HP vibrate saat event penting (fragmen masuk, vote diproses, reveal)
- **Pull-to-refresh:** di-disable (game state)
- **Back button:** warning "Yakin keluar? Sesi akan terputus."
- **App background:** socket tetap jalan, saat kembali sync state

---

## 5. Halaman: DISPLAY (`/display`)

### 5.1 Layout (TV/Proyektor)

```
┌────────────────────────────────────────────┐
│  Header: Room · Ronde · Tier · Status     │
├────────────────────────────────────────────┤
│                                            │
│   ┌──────────┐    ┌──────────┐              │
│   │ PEMBACA  │    │ SKOR     │              │
│   │          │    │ Pembawa  │              │
│   │   [FRAG] │    │  45      │              │
│   │          │    │ Agen     │              │
│   │  ████░   │    │  30      │              │
│   └──────────┘    └──────────┘              │
│                                            │
│   ┌──────────────────────────┐            │
│   │  AMPLOP TERBUKA          │            │
│   │  ANAK C: 🔴 Merah        │            │
│   │  "Kamu Agen!"            │            │
│   └──────────────────────────┘            │
│                                            │
│   Log:                                     │
│   14:30  ANAK A join                       │
│   14:32  Ronde 1 mulai                     │
│   14:35  Diskusi mulai                     │
│   14:39  Vote: 4 suara untuk ANAK C        │
│   14:40  Reveal: ANAK C Agen!              │
│                                            │
└────────────────────────────────────────────┘
```

### 5.2 Behavior

- **Read-only:** no interaction, hanya display
- **Auto-scale:** font size menyesuaikan viewport
- **QR code besar:** di header, untuk scan join
- **No password needed** (display mode public)

---

## 6. SHARED COMPONENTS

### 6.1 Glass Card

```html
<div class="glass-card rounded-2xl p-6">
  <!-- content -->
</div>
```

CSS:
```css
.glass-card {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-2xl);
  box-shadow: var(--shadow-ambient);
}
```

### 6.2 Primary Button (Gradient)

```html
<button class="btn-primary">
  MASUK →
</button>
```

CSS:
```css
.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: #0A0A0C;
  font-weight: 700;
  padding: 16px 32px;
  border-radius: var(--r-full);
  box-shadow: var(--shadow-neon);
  transition: transform var(--dur-fast) var(--ease-spring),
              box-shadow var(--dur-fast) var(--ease-spring);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 0 1px rgba(0, 229, 199, 0.7), 0 0 48px -4px rgba(0, 229, 199, 0.7);
}
.btn-primary:active {
  transform: scale(0.98);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 6.3 Form Input

```html
<input type="password" class="input-glass" />
```

CSS:
```css
.input-glass {
  background: var(--bg-glass);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-lg);
  padding: 14px 18px;
  color: var(--text-primary);
  font-size: 16px; /* prevents iOS zoom */
  width: 100%;
  transition: border-color var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out);
}
.input-glass:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(0, 229, 199, 0.15);
}
```

### 6.4 Animated Background

```css
.bg-animated {
  background: linear-gradient(-45deg, #050507, #0B0B1F, #0A0F1F, #050507);
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
}
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
```

### 6.5 Pulse Glow

```css
.pulse-glow {
  animation: pulseGlow 2.5s ease-in-out infinite;
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 229, 199, 0.3); }
  50%      { box-shadow: 0 0 40px rgba(0, 229, 199, 0.6); }
}
```

---

## 7. ICONOGRAPHY

- Pakai **Phosphor Icons** (light weight) via CDN, atau
- Pakai **Lucide** (medium weight)
- Hindari emoji berlebihan di UI (boleh untuk ilustrasi statis)

Icon set yang dipakai:
- `lock` / `key` (auth)
- `users` (players)
- `clock` (timer)
- `envelope-open` (mystery)
- `check` / `x` (vote)
- `sparkles` (AI)
- `play` / `pause` / `skip-forward` (controls)
- `arrow-left` (back)

---

## 8. PERFORMANCE BUDGET

| Metric | Target | Critical? |
|---|---|---|
| First Contentful Paint (mobile) | < 1.5s | YES |
| Time to Interactive (mobile) | < 3s | YES |
| Total JS bundle (per page) | < 100KB | YES |
| Total CSS (per page) | < 50KB | YES |
| Largest Contentful Paint | < 2.5s | YES |
| Cumulative Layout Shift | < 0.1 | YES |
| Battery drain (10 min session) | < 5% | NO |

---

## 9. ACCESSIBILITY (A11Y)

- **Color contrast:** minimum 4.5:1 untuk body text, 3:1 untuk UI components
- **Touch target:** minimum 44x44px untuk semua tombol
- **Screen reader:** aria-label untuk icon-only buttons
- **Focus visible:** custom focus ring (emerald)
- **Reduced motion:** respect `prefers-reduced-motion: reduce` → disable animations
- **Keyboard nav:** semua interaksi bisa diakses via Tab + Enter

---

*Dibuat otomatis oleh build pipeline.*
