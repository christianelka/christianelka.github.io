# 🎮 Tebak Alkitab Bersama! - Web Application

Aplikasi permainan tebak-tebakan Alkitab berbasis web yang interaktif dan menarik.

## 📁 Struktur File

```
JS/
├── index.html          # File HTML utama dengan UI dan responsivitas
├── game-data.js        # Data permainan (50 item tokoh & kejadian)
├── game-script.js      # Logic dan fungsi permainan
└── README.md           # Dokumentasi ini
```

## 🚀 Cara Menjalankan

### **Metode 1: Langsung Buka File**
1. Buka file `index.html` di browser
2. Aplikasi akan langsung berjalan dengan data yang sudah tersedia

### **Metode 2: Menggunakan Local Server (Opsional)**
```bash
# Menggunakan Python
python -m http.server 8000

# Menggunakan Node.js
npx serve .

# Menggunakan PHP
php -S localhost:8000
```
Kemudian buka `http://localhost:8000`

## 📱 Fitur Responsif

Aplikasi sudah dioptimalkan untuk berbagai ukuran layar:

- **Desktop (1201px+)**: Layout optimal untuk layar besar
- **Tablet (769px-1200px)**: Grid yang menyesuaikan
- **Mobile (≤768px)**: Single column layout
- **Small Mobile (≤480px)**: Font dan padding yang disesuaikan

## 🎯 Fitur Utama

### **1. Pembentukan Tim**
- ✅ Pemilihan ketua tim dengan voting
- ✅ Pendaftaran anggota tim
- ✅ Auto-balancing tim (selisih ≥2 anggota otomatis diseimbangkan)
- ✅ Statistik pembagian tim

### **2. Permainan**
- ✅ Random selection penebak
- ✅ Clue teks, gerakan, dan pembantu
- ✅ Fuzzy matching untuk jawaban (80% similarity)
- ✅ Sistem scoring berdasarkan sisa clue
- ✅ Ronde management

### **3. UI/UX Modern**
- ✅ Loading screen dengan animasi
- ✅ Sound effects (Web Audio API)
- ✅ Animasi sukses/error
- ✅ SweetAlert2 untuk notifikasi
- ✅ Progress bar dan visual feedback
- ✅ Responsive design

### **4. Data Management**
- ✅ 50 item permainan (25 tokoh + 25 kejadian)
- ✅ Kategori yang sesuai dengan perikop Alkitab
- ✅ Statistik penggunaan item
- ✅ Riwayat permainan

## 🔧 Struktur Kode

### **index.html**
- HTML structure dengan semantic markup
- CSS dengan responsive design
- Meta tags untuk mobile optimization
- External script loading

### **game-data.js**
```javascript
const gameData = [
    {
        nama: "Yesus Kristus",
        kategori: "tokoh",
        clue_teks: [...],
        clue_gerakan: [...],
        clue_pembantu: "..."
    },
    // ... 50 items total
];
```

### **game-script.js**
- Game state management
- Team formation logic
- Game flow control
- UI interaction handlers
- Audio and animation functions

## 🎨 Responsive Breakpoints

```css
/* Desktop Large */
@media (min-width: 1201px) { ... }

/* Desktop Medium */
@media (max-width: 1200px) { ... }

/* Tablet */
@media (max-width: 1024px) { ... }

/* Mobile Large */
@media (max-width: 768px) { ... }

/* Mobile Small */
@media (max-width: 480px) { ... }
```

## 🎵 Sound Effects

Aplikasi menggunakan Web Audio API untuk:
- ✅ Click sounds
- ✅ Success/error feedback
- ✅ Score animations
- ✅ Loading transitions

## 📊 Game Logic

### **Scoring System**
- Jawaban benar: 10 + (sisa clue × 2) poin
- Jawaban salah: 0 poin
- Clue habis: 0 poin

### **Team Balancing**
- Jika selisih anggota ≥2, auto-assign ke tim terkecil
- Jika selisih <2, random assignment
- Visual indicators untuk tim terbesar/terkecil

### **Fuzzy Matching**
- Menggunakan Levenshtein Distance
- Threshold 80% similarity
- Case-insensitive comparison

## 🚀 Deployment

Aplikasi dapat di-deploy ke:
- **GitHub Pages**: Upload semua file
- **Netlify**: Drag & drop folder
- **Vercel**: Connect repository
- **Local hosting**: Apache/Nginx

## 🔍 Troubleshooting

### **CORS Issues**
Jika mengalami masalah loading data:
1. Gunakan local server (Metode 2)
2. Atau buka dengan browser flags:
   ```bash
   chrome.exe --disable-web-security --user-data-dir="C:/temp/chrome_dev"
   ```

### **Audio Issues**
- Pastikan browser mendukung Web Audio API
- Beberapa browser memerlukan user interaction untuk audio

### **Mobile Issues**
- Pastikan viewport meta tag ada
- Test di berbagai device dan browser

## 📈 Performance

- ✅ Lazy loading untuk data
- ✅ Optimized animations
- ✅ Efficient DOM manipulation
- ✅ Minimal external dependencies

## 🎯 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

---

**Dibuat dengan ❤️ untuk permainan Youth yang menyenangkan!** 
