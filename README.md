# 🎮 Permainan Youth - Tebak Alkitab Bersama!

Aplikasi web interaktif untuk permainan tebak-tebakan Alkitab dengan tampilan modern dan responsif.

## 📁 Struktur File

```
├── index.html                 # Aplikasi web utama
├── daftar_sesuatu.txt        # Data 50 item permainan (format TXT)
├── open_without_cors.bat     # Script untuk buka Brave dengan CORS disabled
└── README.md                 # File dokumentasi ini
```

## 🚀 Cara Menjalankan

### Opsi 1: Menggunakan Local Server (Direkomendasikan)

1. **Install Python** (jika belum ada)
2. **Buka terminal/command prompt** di folder project
3. **Jalankan server**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
4. **Buka browser** dan akses: `http://localhost:8000`

### Opsi 2: Menggunakan Live Server (VS Code)

1. **Install extension** "Live Server" di VS Code
2. **Klik kanan** pada `index.html`
3. **Pilih** "Open with Live Server"

### Opsi 3: Menggunakan XAMPP/WAMP

1. **Copy semua file** ke folder `htdocs` (XAMPP) atau `www` (WAMP)
2. **Start Apache server**
3. **Akses** melalui `http://localhost/nama-folder`

## 🔧 Troubleshooting

### ❌ Error: "Gagal memuat file TXT"

**Penyebab:**
- File `daftar_sesuatu.txt` tidak ditemukan
- CORS issue saat membuka file langsung di browser
- Format TXT tidak valid

**Solusi:**

#### 🚀 **Opsi 1: Bypass CORS (Paling Mudah)**
1. **Double-click** file `open_without_cors.bat`
2. **Brave akan terbuka** dengan CORS disabled
3. **Buka file** `index.html` di browser tersebut

#### 📁 **Opsi 2: Pilih File Manual**
1. **Klik tombol** "Pilih File TXT" di aplikasi
2. **Pilih file** `daftar_sesuatu.txt` dari dialog
3. **Data akan dimuat** secara manual

#### 🎮 **Opsi 3: Gunakan Data Sample**
1. **Klik tombol** "Gunakan Data Sample" di aplikasi
2. **Aplikasi akan menggunakan** 10 item sample
3. **Permainan bisa langsung dimulai**

#### 🌐 **Opsi 4: Local Server**
1. **Jalankan server**:
   ```bash
   python -m http.server 8000
   ```
2. **Buka** `http://localhost:8000`

#### 🔧 **Opsi 5: Browser dengan Flag**
1. **Tutup browser** yang sekarang
2. **Buka Command Prompt**
3. **Jalankan**:
   ```cmd
   brave.exe --disable-web-security --user-data-dir="C:/temp/brave_dev"
   ```
4. **Buka file** `index.html` di browser baru

### ✅ **Verifikasi Setup**

1. **Struktur folder benar**:
   ```
   📁 project-folder/
   ├── 📄 index.html
   ├── 📄 daftar_sesuatu.txt
   ├── 📄 open_without_cors.bat
   └── 📄 README.md
   ```

2. **File TXT valid**:
   - Buka `daftar_sesuatu.txt` di text editor
   - Pastikan format sesuai: NAMA|KATEGORI|CLUE_TEKS|CLUE_GERAKAN|CLUE_PEMBANTU

3. **Browser support**:
   - Brave dengan flag CORS disabled
   - Atau gunakan file selector manual

### ✅ Verifikasi Setup

1. **Struktur folder benar**:
   ```
   📁 project-folder/
   ├── 📄 index.html
   ├── 📄 daftar_sesuatu.json
   └── 📄 README.md
   ```

2. **File JSON valid**:
   - Buka `daftar_sesuatu.json` di text editor
   - Pastikan format JSON valid (bisa dicek di jsonlint.com)

3. **Server berjalan**:
   - Akses `http://localhost:8000` (bukan file://)
   - Console browser tidak menampilkan error CORS

## 🎯 Fitur Aplikasi

### ✅ Fitur Utama
- **Pemilihan Ketua**: Sistem voting interaktif
- **Pembentukan Tim**: Assignment otomatis dengan visualisasi
- **Game Engine**: Sistem permainan lengkap dengan clue berurutan
- **Score Board**: Papan skor dengan ranking dan medali
- **Item Tracking**: Monitoring item yang sudah digunakan

### 🎨 UI/UX
- **Responsive Design**: Desktop, tablet, dan mobile
- **Modern Interface**: Glassmorphism dan animasi smooth
- **Real-time Updates**: Status permainan diperbarui otomatis
- **Loading Indicators**: Visual feedback saat memuat data

### 📊 Data Management
- **50 Item**: Tokoh dan kejadian Alkitab
- **Multiple Clues**: Teks, gerakan, dan clue pembantu
- **Category System**: Tokoh Penting vs Kejadian Besar
- **Progress Tracking**: Statistik penggunaan per kategori

## 🛠️ Development

### Struktur Data TXT
```
NAMA|KATEGORI|CLUE_TEKS1,CLUE_TEKS2|CLUE_GERAKAN1,CLUE_GERAKAN2|CLUE_PEMBANTU
```

**Contoh:**
```
Abraham|tokoh|Bapak orang beriman,Disebut bapak bangsa|Mengangkat tangan ke langit,Berjalan dengan tongkat|Dari Kitab Kejadian
```

### Menambah Item Baru
1. **Edit** `daftar_sesuatu.txt`
2. **Tambahkan** baris baru dengan format: `NAMA|KATEGORI|CLUE_TEKS|CLUE_GERAKAN|CLUE_PEMBANTU`
3. **Refresh** browser untuk memuat data baru

## 📱 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🐛 Bug Report

Jika menemukan bug atau masalah:

1. **Periksa Console** browser (F12)
2. **Catat error message** yang muncul
3. **Screenshot** jika diperlukan
4. **Deskripsikan** langkah-langkah reproduksi

## 📄 License

Project ini dibuat untuk kegiatan Youth dengan tujuan edukasi dan hiburan.

---

**Happy Gaming! 🎮✨** 
