# Data Mapping & Transformation Logic

Dokumen ini berisi pemetaan dari langkah operasional manual (Excel) ke dalam logika algoritma backend (bisa diimplementasikan melalui `pandas.DataFrame` di Python atau koleksi array manipulation di PHP).

## 1. Pemrosesan Data SLA (Data Cleaning)
- **Input:** File SLA mentah.
- **Logika Algoritma:**
  1. Abaikan (drop/hapus) kolom B hingga R.
  2. Filter baris data di mana nilai pada kolom `SVTTitle` sama persis dengan string `"SC3 - IT OLA Response - 0010"`.
  3. Urutkan (sort) data berdasarkan kolom `OverallElapsedTime` dengan metode *Ascending* (terkecil ke terbesar).
  4. Simpan kondisi data ini ke memori (misal: variabel `df_sla`).

## 2. Penggabungan Data (Sistem Pengganti VLOOKUP)
- **Input:** File Report mentah & `df_sla`.
- **Logika Algoritma:**
  1. Lakukan operasi `Left Join` atau `Merge` pada dataset Report mentah.
  2. Kunci relasi (Foreign Key) yang dicocokkan antar kedua file adalah kolom `Incident ID`.
  3. Petakan kolom referensi `OLA Response` dari dataset SLA ke dalam dataset Report.
  4. Simpan ke dalam variabel memori utama: `df_report_final`.

## 3. Logika Agregasi (Sistem Pengganti Pivot Table)
Setiap fungsi agregasi di bawah ini akan di-filter (klausa `WHERE / IN`) menggunakan daftar/array `NIK_Agent_Duty` yang diinputkan oleh pengguna pada web.

### A. Section: Cancelled
- **Group By (Rows):** `Ticket Hashtag`
- **Pivoted Column:** `Status History.Cancelled.USER`
- **Aggregation (Values):** Count of `Incident ID`
- **Kondisi Khusus:** Hanya agregasi data di mana nilai `Status History.Cancelled.USER` ada di dalam array `NIK_Agent_Duty`.

### B. Section: Resolved
- **Group By (Rows):** `Ticket Hashtag`
- **Pivoted Column:** `Status History.Resolved.USER`
- **Aggregation (Values):** Count of `Incident ID`
- **Kondisi Khusus:** Filter data di mana kolom resolved user termasuk dalam array `NIK_Agent_Duty`.

### C. Section: Inprogress
- **Group By (Rows):** `Status History.In Progress.USER`
- **Aggregation (Values):** Count of `Incident ID`
- **Kondisi Khusus:** Filter data di mana kolom in progress user termasuk dalam array `NIK_Agent_Duty`.

### D. Section: Assigned
- **Group By (Rows):** `Status History.Assigned.USER`
- **Aggregation (Values):** Count of `Incident ID`
- **Kondisi Khusus:** Filter data di mana kolom assigned user termasuk dalam array `NIK_Agent_Duty`.

### E. Section: OLA Response
- **Group By (Rows):** `Submit Date`
- **Pivoted Column:** `OLA Response`
- **Aggregation (Values):** Count of `Incident ID`
- **Kondisi Khusus:** Umumnya mencakup seluruh data (tanpa perlu difilter berdasarkan agen, kecuali sistem menghendaki parameter khusus).

### F. Section: TOP 5 Kategori
- **Group By (Rows):** `Operational Categorization Tier 1` lalu `Operational Categorization Tier 2` (Hierarkis).
- **Aggregation (Values):** Count of `Incident ID`
- **Kondisi Khusus:** Urutkan hasil agregasi berdasarkan nilai Count terbanyak (*Descending*), lalu batasi pemotongan data untuk 5 baris pertama (terapkan `LIMIT 5` atau `head(5)`).

## 4. Eksekusi Output ke Google Sheets
- Sistem backend menembak API endpoint *Spreadsheets.create*.
- Tabel Referensi Agent (Nama & NIK) disuntikkan secara statis di sel awal (misal: A1).
- Lakukan iterasi (*looping*) untuk menulis matriks agregasi A hingga F secara berurutan (*sequential*), dengan memberi jarak satu baris kosong antartabel.
- Kirim `batchUpdate` *requests* untuk mengeksekusi format UI: menebalkan header (Bold), memberi *Borders*, warna *background* (misal kode hex `#b8cce4`), dan menyalakan fitur penyesuaian lebar kolom otomatis (*auto-fit column size*).
