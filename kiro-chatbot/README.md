# Kiro Chat

Chatbot agent dengan UI ChatGPT-style yang berjalan sepenuhnya di browser. Cuma HTML + CSS + JavaScript murni, tanpa build step. Otaknya pakai **9router** lokal untuk akses model-model AI (Kiro AI, Claude, Gemini, dll) lewat satu endpoint OpenAI-compatible.

## Fitur

- UI minimalis modern dengan dark/light mode
- Streaming response token-by-token
- Markdown + syntax highlighting di code block
- Multi-conversation dengan riwayat tersimpan di browser
- Settings panel: ganti endpoint, API key, model, system prompt, temperature
- Stop generation di tengah jalan
- Mobile responsive
- 100% static — siap dideploy ke GitHub Pages

## Prasyarat

1. **Node.js** terinstall di komputer Anda (untuk menjalankan 9router)
2. **Akun Kiro IDE** (opsional, untuk akses gratis Claude via Kiro provider)
3. Browser modern (Chrome, Edge, Firefox, Safari)

## Setup 9router (lokal)

9router adalah AI gateway yang berjalan di `localhost:20128` dan menyediakan endpoint OpenAI-compatible.

### Install dan jalankan

```bash
npm install -g 9router
9router
```

Dashboard akan otomatis terbuka di browser.

### Connect provider

Di dashboard 9router:

1. Buka tab **Providers**
2. Pilih **Kiro AI** (free, unlimited Claude) → klik **Connect** → ikuti OAuth
3. Buka tab **API Keys** → buat key baru → **copy**

Provider lain yang bisa Anda connect (opsional):
- **OpenCode Free** — tidak perlu auth
- **Anthropic / OpenAI / Gemini** — pakai API key sendiri

## Setup chatbot

1. **Clone / download** folder ini
2. **JANGAN buka `index.html` langsung dengan double-click** — browser akan blokir request ke 9router karena protocol `file://` (`Failed to fetch` error). Jalankan via HTTP server lokal:

   **Opsi A — `npx serve` (paling cepat):**
   ```bash
   cd kiro-chatbot
   npx -y serve . -l 5500
   ```
   Buka `http://localhost:5500`

   **Opsi B — Python:**
   ```bash
   cd kiro-chatbot
   python -m http.server 5500
   ```

   **Opsi C — VS Code Live Server extension** (recommended untuk development): install extension "Live Server", klik kanan `index.html` → Open with Live Server.
3. Klik tombol **Pengaturan** di sidebar bawah kiri
4. Isi:
   - **Endpoint**: `http://localhost:20128/v1`
   - **API Key**: paste dari dashboard 9router
   - **Model**: `kr/claude-opus-4.7` (atau model lain yang Anda connect)
   - **System Prompt**: bebas, contoh `Anda adalah Kiro, asisten coding ringkas dan akurat.`
5. Klik **Tes koneksi** untuk verifikasi
6. **Simpan** — selesai

Indikator status di kanan atas akan hijau kalau 9router terjangkau.

## Deploy ke GitHub Pages

```bash
cd kiro-chatbot
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

Lalu di GitHub: **Settings → Pages → Source: main / root** → save.

URL Anda: `https://USERNAME.github.io/REPO/`

### Catatan penting tentang github.io + localhost

- Browser **mengizinkan** request HTTPS → `http://localhost` (dianggap secure context). Jadi chatbot di github.io bisa memanggil 9router lokal.
- Tapi ini cuma jalan **untuk Anda dan orang yang juga punya 9router lokal**. Pengunjung tanpa 9router akan dapat status merah.
- Bagikan link ke teman? Mereka harus install 9router sendiri, atau Anda expose 9router via Cloudflare Tunnel (ada di dashboard 9router → Tunnel).

### Ekspos 9router untuk teman (opsional)

Di dashboard 9router → fitur **Cloudflare Tunnel**: dapat URL publik seperti `https://xyz.trycloudflare.com`. Lalu di chatbot ganti endpoint ke URL itu.

**Risiko:** siapa pun yang punya URL + API key bisa pakai akun Kiro Anda. Pakai hanya untuk demo terbatas ke orang yang Anda percaya.

## Struktur file

```
kiro-chatbot/
├── index.html      # Markup + CDN dependencies
├── style.css       # Tema dark/light, layout, animasi
├── script.js       # State, fetch streaming, markdown, settings
└── README.md
```

Tidak ada build step, tidak ada bundler, tidak ada package.json. CDN yang dipakai:
- `marked` — markdown parser
- `dompurify` — sanitasi HTML output (XSS protection)
- `highlight.js` — syntax highlighting

## Troubleshooting

| Masalah | Solusi |
|---|---|
| `Failed to fetch` saat tes koneksi | Anda buka `index.html` via `file://` (double-click). Browser blokir fetch dari `file://`. Jalankan via HTTP server lokal (lihat **Setup chatbot** di atas). |
| Status merah "9router tidak terjangkau" | Pastikan `9router` aktif di terminal. Cek `http://localhost:20128/dashboard`. |
| Error `401 Unauthorized` | API key salah atau belum diisi di Settings. |
| Error `model not found` | Model yang Anda set belum di-connect di 9router. Cek di dashboard → Providers. |
| Stream berhenti tiba-tiba | Quota provider habis, atau koneksi internet putus. Coba model lain. |
| Pesan hilang setelah reload | Pesan disimpan di `localStorage` browser. Jangan clear site data. |

## Keamanan

- API key tersimpan di `localStorage` browser Anda saja, **tidak pernah** dikirim ke server lain selain endpoint yang Anda set.
- Output AI di-sanitasi DOMPurify sebelum dirender — aman dari XSS via markdown.
- Untuk publik luas, jangan pakai mode tunnel tanpa proteksi tambahan (basic auth, rate limit, dll).

## Lisensi

MIT — bebas pakai, modifikasi, dan distribusi.
