window.PANDUAN = {
  brand: 'VITTORIO WEDDING ORGANIZER',
  edition: 'Edition I &middot; 2026',
  whatsapp: '6281351880960',
  contactName: 'Admin VITTORIO',
  intro: 'Panduan singkat untuk calon client dan operator yang akan menggunakan salah satu template undangan di bawah.',

  // Section list — drives the TOC and the rendering order
  sections: [
    { id: 'quickstart', icon: 'fa-rocket', label: 'Cara Order',     color: '#C5A880' },
    { id: 'prep',       icon: 'fa-clipboard-list', label: 'Yang Perlu Disiapkan', color: '#4D96FF' },
    { id: 'test',       icon: 'fa-vial', label: 'Cara Test Website',  color: '#6BCB77' },
    { id: 'features',   icon: 'fa-list-check', label: 'Fitur Universal',  color: '#FF3D7F' },
    { id: 'security',   icon: 'fa-shield-halved', label: 'Keamanan Anti-Bypass', color: '#4CAF50' },
    { id: 'templates',  icon: 'fa-palette', label: 'Semua Template',  color: '#FFD93D' }
  ],

  tipsTitle: 'Yang Perlu Disiapkan Sebelum Order',
  tips: [
    { icon: 'fa-user', text: 'Nama lengkap pengantin pria & wanita' },
    { icon: 'fa-calendar-check', text: 'Tanggal dan jam akad + resepsi' },
    { icon: 'fa-map-marker-alt', text: 'Alamat venue (untuk tautan Google Maps)' },
    { icon: 'fa-credit-card', text: 'Rekening bank / e-wallet untuk amplop digital' },
    { icon: 'fa-camera', text: '6-8 foto prewedding (minimal 4)' },
    { icon: 'fa-music', text: 'Pilihan 2-3 musik latar (atau pilih default kami)' },
    { icon: 'fa-quote-right', text: 'Ucapan terima kasih / quote pilihan' },
    { icon: 'fa-users', text: 'Daftar tamu + link unik per tamu' }
  ],

  howToOrder: [
    { icon: 'fa-keyboard', text: 'Ketik nama tamu di kolom atas (mis. "Andi Saputra")' },
    { icon: 'fa-link', text: 'Semua link kartu di bawah otomatis terisi dengan ?to=Nama' },
    { icon: 'fa-whatsapp', text: 'Klik "Order" → buka WhatsApp admin dengan pesan otomatis' },
    { icon: 'fa-eye', text: 'Atau klik "Buka" untuk preview template sebagai tamu' }
  ],

  testModes: [
    { badge: '?', badgeColor: '#FFC107', label: 'Preview / Tester', url: '?preview=1', desc: 'Masuk sebagai "Tamu Tester", banner kuning muncul. Data RSVP tidak dihitung.' },
    { badge: 'A', badgeColor: '#FFC107', label: 'Custom Name', url: '?preview=Andi+Saputra', desc: 'Preview sebagai "Andi Saputra" — cocok untuk demo ke calon client.' },
    { badge: 'D', badgeColor: '#FFC107', label: 'Developer', url: '?dev=1', desc: 'Sama dengan preview, masuk sebagai "Developer". Untuk admin yang testing.' },
    { badge: '✓', badgeColor: '#4CAF50', label: 'Real Guest', url: '?token=g1h2i3j4k5l6m7n8', desc: 'Pakai token asli dari guest-list.js. Simulasi tamu resmi "Galih Pratama".' },
    { badge: '✗', badgeColor: '#F44336', label: 'No Token', url: '?production=true (no token)', desc: 'Saat production=true di guest-list.js DAN tanpa token, akan menampilkan gate "Akses Ditolak". Default prototype tetap terbuka.' }
  ],

  features: [
    { icon: 'fa-hourglass-half', title: 'Countdown Otomatis', desc: 'Hitung mundur hari-jam-menit-detik menuju tanggal pernikahan.' },
    { icon: 'fa-images', title: 'Galeri + Lightbox', desc: 'Klik foto untuk lightbox. ← → navigasi, Esc tutup.' },
    { icon: 'fa-pen-to-square', title: 'RSVP Form', desc: 'Nama + hadir + jumlah (maks 2) + pesan. Submit → QR otomatis.' },
    { icon: 'fa-microphone', title: 'Voice Note (2 Menit)', desc: 'Klik mic → merekam. Auto-stop di 2 menit. Browser minta izin.' },
    { icon: 'fa-qrcode', title: 'QR E-Ticket', desc: 'Muncul setelah RSVP. Download PNG. QR berisi token tamu.' },
    { icon: 'fa-gift', title: 'Amplop Digital', desc: 'Klik kartu bank → nomor disalin ke clipboard.' },
    { icon: 'fa-music', title: 'Musik Latar', desc: 'Tombol play/pause pojok kanan bawah. Auto-play saat cover dibuka.' },
    { icon: 'fa-link', title: 'Personal URL', desc: 'Setiap tamu: ?token=XXX + ?to=Nama. Nama tampil di cover & tiket.' },
    { icon: 'fa-ticket', title: 'My-Ticket State', desc: 'Setelah submit, RSVP berganti jadi tiket (anti multi-submit).' },
    { icon: 'fa-mobile-screen', title: 'Mobile-First', desc: 'Tested 320-480px. Tombol cukup besar untuk jempol.' },
    { icon: 'fa-universal-access', title: 'Aksesibilitas', desc: 'aria-label, kontras cukup, reduced-motion, keyboard nav.' },
    { icon: 'fa-bolt', title: 'Prototype Tanpa Build Step', desc: 'Static HTML/CSS/JS. Buka langsung dari file system, upload ke hosting mana saja. Hosting statis (GitHub Pages, Netlify, Vercel) sudah cukup — tidak perlu setup Node.js, PHP, atau database. Versi CMS nanti akan butuh server + DB.' }
  ],

  security: [
    { icon: 'fa-key', label: 'Token 16-char hex', desc: 'Setiap link mengandung token acak. Prototype: divalidasi via guest-list.js. CMS: validasi server-side via API.' },
    { icon: 'fa-shield-halved', label: 'QR berisi token, bukan nama', desc: 'Tamu tidak bisa print QR sendiri dengan nama random — operator venue scan dan cross-check ke registry.' },
    { icon: 'fa-fingerprint', label: 'Registry name = source of truth', desc: 'Bahkan ?to=... ditambahkan attacker, nama di-cover/tiket selalu dari registry. ?to= di-ignore.' },
    { icon: 'fa-database', label: 'Prototype: localStorage only', desc: 'RSVP + voice flag disimpan di localStorage device. Tidak ada server di prototype. CMS nanti: sinkron ke server.' },
    { icon: 'fa-shield-virus', label: 'XSS protection', desc: 'Semua RSVP message lewat escapeHtml sebelum render. URL params tidak di-eval.' },
    { icon: 'fa-user-shield', label: 'Form blocker di capture phase', desc: 'Bypass attempts tertangkap sebelum form submit (event capture phase).' }
  ],

  templates: {
    'classic-white.html': {
      name: 'Classic White', tag: 'Default',
      palette: ['#FAF9F6', '#1A1A2E', '#C5A880'],
      forWho: 'Pasangan muda urban, kesan elegan & modern.',
      typography: 'Cinzel + Cormorant Garamond + Great Vibes',
      highlights: [
        'Asymmetric editorial couple layout',
        'Voice note + QR e-ticket + RSVP lengkap',
        'QR generator via qrcode-generator'
      ]
    },
    'undangan_tropical.html': {
      name: 'Tropical Modern', tag: 'Tropical',
      palette: ['#FBF8F0', '#2D5F3F', '#7A8F85'],
      forWho: 'Wedding garden / villa Bali / outdoor.',
      typography: 'Playfair + Cormorant + Inter',
      highlights: [
        'Struktur simetris yang rapi',
        'Botanical SVG decorations',
        'Download html2canvas (snapshot full)'
      ]
    },
    'undangan_chinese_christian.html': {
      name: 'Chinese Christian', tag: 'Heritage',
      palette: ['#FCFAF6', '#5C1A2E', '#B8923A'],
      forWho: 'Pernikahan blended Tionghoa-Kristen.',
      typography: 'Cinzel + Cormorant + Raleway',
      highlights: [
        '4-slide cover carousel',
        'Double Happiness 囍 motif',
        'Tea Pai + Pemberkatan + Resepsi'
      ]
    },
    'undangan_editorial.html': {
      name: 'Editorial Art', tag: 'Editorial',
      palette: ['#FAF7F0', '#1A1A1A', '#8B5A3C'],
      forWho: 'Pasangan yang suka magazine / jurnalisme / desain.',
      typography: 'Fraunces + Inter + JetBrains Mono',
      highlights: [
        '"Volume One" issue markers',
        'Masthead-style countdown',
        'Story narrative (3 milestones)'
      ]
    },
    'undangan_ethereal.html': {
      name: 'Ethereal Glass', tag: 'Soft',
      palette: ['#FBF7EE', '#B8923A', '#E8C4B0'],
      forWho: 'Villa Bali, garden estate, sunset ceremony.',
      typography: 'Fraunces (italic) + Inter',
      highlights: [
        'M3 glassmorphism',
        'WebGL shader background',
        'Monogram cover gate'
      ]
    },
    'undangan_intimate.html': {
      name: 'Intimate Silhouette', tag: 'Quiet',
      palette: ['#FAFAF7', '#4A5D3A', '#0A0A0A'],
      forWho: 'Wedding kecil (< 50 tamu), villa intimate dinner.',
      typography: 'Fraunces (italic) + Inter + JetBrains Mono',
      highlights: [
        'Single-column mobile layout',
        'Paper-grain SVG texture',
        'Dress code swatches'
      ]
    },
    'undangan_digital_vvip.html': {
      name: 'VVIP Smart Digital', tag: 'Premium',
      palette: ['#0A0A0A', '#C9A84C', '#FAFAF6'],
      forWho: 'Klien premium / VVIP / artis / eksekutif.',
      typography: 'Cormorant Garamond + Cinzel + Inter',
      highlights: [
        'SVG film grain + gold-dust particles',
        'VVIP boarding-pass ticket',
        'Simulated voice log recordings'
      ]
    },
    'undangan_marigold.html': {
      name: 'Marigold Mandala', tag: 'Heritage',
      palette: ['#7B2D26', '#E5B25D', '#F4ECD8'],
      forWho: 'Pernikahan adat Jawa / Jawa-Modern.',
      typography: 'Tangerine + Marcellus + Raleway',
      highlights: [
        'CSS kawung dotted borders',
        'Wayang-gunungan & lotus monograms',
        'Bilingual Javanese honorifics'
      ]
    },
    'undangan_memphis_pop.html': {
      name: 'Memphis Pop', tag: 'Gen-Z',
      palette: ['#FF3D7F', '#FFD93D', '#6BCB77'],
      forWho: 'Pasangan muda fun, anti-mainstream.',
      typography: 'Archivo Black + Bungee + Caveat',
      highlights: [
        'Brutalist offset shadows',
        'Marquee text ribbons',
        'Confetti burst on submit'
      ]
    }
  }
};
