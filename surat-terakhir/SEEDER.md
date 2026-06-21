# SEEDER — Surat Terakhir

> Strategi seed initial data. Fragmen bank starter. Kitab-target matrix.

---

## 1. OVERVIEW

**File seed:** `data/fragmen.json` (di-ship dengan repo)
**DB seed:** `data/db/surat-terakhir.sqlite` (auto-generated saat first boot)
**Initial fragmen count:** 60 (5 ronde × 12 fragmen per kitab = cukup untuk 5 sesi)
**AI-generated:** ditambah on-the-fly, disimpan permanen di DB

---

## 2. STRUKTUR FRAGMEN

```typescript
interface Fragmen {
  kitab: string;         // 'Mazmur' | 'Amsal' | dst
  tema: string;          // 'kasih karunia' | 'pengharapan' | dst
  teks: string;          // isi fragmen (3-15 kata)
  gaya_bahasa: 'puitis' | 'naratif' | 'argumentatif' | 'pastoral' | 'profetis';
  sumber: 'seed' | 'ai';
}
```

---

## 3. RONDE CONFIGURATION

5 ronde, masing-masing dengan kitab target + kitab abu-abu + kitab agen.

| Ronde | Target | Abu-abu | Agen | Tier tersedia |
|---|---|---|---|---|
| 1 | **Mazmur** | Amsal | Kidung Agung | 1, 2, 3 |
| 2 | **Matius** | Markus | Kisah Para Rasul | 1, 2, 3 |
| 3 | **Amsal** | Pengkhotbah | Kidung Agung | 1, 2, 3 |
| 4 | **Markus** | Matius | Wahyu | 1, 2, 3 |
| 5 | **Galatia** | Efesus | 1 Timotius | 2, 3 (rekomendasi) |

**Distribusi per ronde (untuk 6 pemain):**
- 4 pemain → kitab target (fragmen 1-4 dari pool)
- 1 pemain → kitab abu-abu (fragmen dari pool)
- 1 pemain → kitab agen (fragmen dari pool)

---

## 4. POOL FRAGMEN PER KITAB

### 4.1 Mazmur (12 fragmen seed)

| ID | Tema | Teks | Gaya |
|---|---|---|---|
| mzr-01 | perlindungan | TUHAN adalah gembalaku, takkan kekurangan aku | puitis |
| mzr-02 | penyembahan | Bersyukurlah kepada TUHAN, sebab Ia baik! | puitis |
| mzr-03 | pengharapan | Biarlah segenap tanah menyembah dan bermazmur | puitis |
| mzr-04 | pertobatan | Hatiku remuk, hai TUHAN, lepasaskan aku | puitis |
| mzr-05 | pujian | Puji TUHAN, hai jiwaku! Aku mau bermazmur | puitis |
| mzr-06 | kasih setia | Kasih setia TUHAN tak pernah berakhir | puitis |
| mzr-07 | ketenangan | Diamlah dan ketahuilah bahwa Akulah Allah | puitis |
| mzr-08 | kekuatan | TUHAN adalah kekuatan umat-Nya | puitis |
| mzr-09 | perlindungan ilahi | Dalam naungan sayap-Mu aku berlindung | puitis |
| mzr-10 | sukacita | Bersukacitalah karena TUHAN telah menang | puitis |
| mzr-11 | pertobatan | Bersihkanlah aku dari dosaku, ya TUHAN | puitis |
| mzr-12 | pujian pagi | Pada pagi hari aku mendengar suaramu | puitis |

### 4.2 Amsal (12 fragmen seed)

| ID | Tema | Teks | Gaya |
|---|---|---|---|
| ams-01 | hikmat | Jalan orang benar adalah menjauhi kejahatan | argumentatif |
| ams-02 | pendidikan | Anakku, dengarkanlah didikan ayahmu | pastoral |
| ams-03 | mulut | Siapa menjaga mulutnya, menjaga nyawanya | argumentatif |
| ams-04 | persahabatan | Sahabat sejati lebih dekat dari saudara | argumentatif |
| ams-05 | kemalasan | Malas menyebabkan kemiskinan, rajin menyebabkan kaya | argumentatif |
| ams-06 | hati | Lebih baik yang rendah hati dari yang congkak | argumentatif |
| ams-07 | wanita bijak | Siapa mendapat istri yang baik, mendapat yang baik | argumentatif |
| ams-08 | sabar | Panjang sabar lebih baik dari pada pahlawan | argumentatif |
| ams-09 | rumah | Rumah orang benar diberkati TUHAN | argumentatif |
| ams-10 | percaya | Percayalah kepada TUHAN dengan segenap hatimu | argumentatif |
| ams-11 | adil | TUHAN membenci timbangan yang palsu | argumentatif |
| ams-12 | rendah hati | Takut akan TUHAN adalah permulaan hikmat | argumentatif |

### 4.3 Pengkhotbah (6 fragmen seed)

| ID | Tema | Teks | Gaya |
|---|---|---|---|
| pek-01 | kefanaan | Segala sesuatu indah pada waktunya | puitis |
| pek-02 | sia-sia | Vanitas vanitatum, semuanya sia-sia | naratif |
| pek-03 | sukacita | Tidak ada yang lebih baik bagi manusia selain bersukacita | naratif |
| pek-04 | waktu | Ada waktu untuk segala sesuatu | naratif |
| pek-05 | hikmat | Hikmat lebih baik dari pada senjata perang | naratif |
| pek-06 | dua | Lebih baik dua dari satu, karena mereka mendapat upah | naratif |

### 4.4 Matius (10 fragmen seed)

| ID | Tema | Teks | Gaya |
|---|---|---|---|
| mat-01 | kasih | Kasilah sesamamu manusia seperti dirimu sendiri | naratif |
| mat-02 | iman | Aku ini tidak layak Tuhan masuk ke dalam rumahku | naratif |
| mat-03 | doa | Mintalah, maka akan diberikan kepadamu | naratif |
| mat-04 | murid | Pergilah ke seluruh dunia, beritakanlah Injil | naratif |
| mat-05 | garam | Kamu adalah garam dunia, jangan kehilangan asinnya | naratif |
| mat-06 | terang | Kamu adalah terang dunia, jangan disembunyikan | naratif |
| mat-07 | beban | Marilah kepada-Ku, semua yang letih lesu, Aku akan memberi kelegaan | naratif |
| mat-08 | pengharapan | Di mana dua atau tiga orang berkumpul dalam nama-Ku, Aku ada | naratif |
| mat-09 | kemenangan | Aku telah mengalahkan dunia, jangan takut | naratif |
| mat-10 | pertobatan | Bertobatlah, karena Kerajaan Surga sudah dekat | profetis |

### 4.5 Markus (8 fragmen seed)

| ID | Tema | Teks | Gaya |
|---|---|---|---|
| mrk-01 | percaya | Jangan takut, hanya percaya! | naratif |
| mrk-02 | iman | Hai orang percaya, semua mungkin bagi yang percaya | naratif |
| mrk-03 | murid | Siapa yang ingin menjadi yang terkemuka, harus menjadi hamba | naratif |
| mrk-04 | bahaya | Waspadalah terhadap ragi orang Farisi | naratif |
| mrk-05 | pertobatan | Bertobatlah dan percayalah kepada Injil | profetis |
| mrk-06 | keluarga | Siapa yang melakukan kehendak Allah, itulah saudaraku | naratif |
| mrk-07 | pelayanan | Anak Manusia datang untuk melayani, bukan untuk dilayani | naratif |
| mrk-08 | pertobatan pertobatan | Murid-murid-Nya yang pertama, percayalah! | naratif |

### 4.6 Lukas (8 fragmen seed)

| ID | Tema | Teks | Gaya |
|---|---|---|---|
| luk-01 | sukacita | Jangan takut, aku memberitakan kepadamu sukacita besar | naratif |
| luk-02 | doa | Mintalah, maka akan diberikan kepadamu | naratif |
| luk-03 | pertobatan | Bertobatlah, jangan sampai kamu binasa | profetis |
| luk-04 | pertobatan pertobatan | Ada sukacita di surga karena satu orang berdosa bertobat | naratif |
| luk-05 | iman | Imanmu telah menyelamatkan engkau, pergilah dengan selamat | naratif |
| luk-06 | perumpamaan | Anak yang hilang itu, ayahnya berlari mendekat | naratif |
| luk-07 | syukur | Bersyukurlah kepada Tuhan, sebab Dia baik | puitis |
| luk-08 | pemuridan | Barangsiapa tidak menanggalkan semuanya, tidak dapat murid-Ku | naratif |

### 4.7 Yohanes (8 fragmen seed)

| ID | Tema | Teks | Gaya |
|---|---|---|---|
| yoh-01 | kasih | Kasihilah sesamamu manusia, seperti Aku telah mengasihi kamu | naratif |
| yoh-02 | pengharapan | Damai sejahtera Kutinggalkan kepadamu | naratif |
| yoh-03 | pertobatan | Akulah jalan, kebenaran, dan kehidupan | naratif |
| yoh-04 | terang | Akulah terang dunia, siapa mengikut Aku tidak berjalan dalam kegelapan | naratif |
| yoh-05 | iman | Allah begitu mengasihi dunia sehingga memberikan Anak-Nya | naratif |
| yoh-06 | pertobatan pertobatan | Aku datang bukan untuk menghakimi, tetapi untuk menyelamatkan | naratif |
| yoh-07 | pertobatan pertobatan | Buah harus dihasilkan, agar Bapa-Ku dimuliakan | naratif |
| yoh-08 | pemuridan | Di mana Aku, di situ juga pelayan-Ku | naratif |

### 4.8 Kisah Para Rasul (6 fragmen seed) — AGEN untuk Ronde 2

| ID | Tema | Teks | Gaya |
|---|---|---|---|
| kpr-01 | pertobatan | Saulus, Saulus, mengapa engkau menganiaya Aku? | naratif |
| kpr-02 | Roh Kudus | Pada hari Pentakosta, Roh Kudus turun ke atas mereka | naratif |
| kpr-03 | pertobatan pertobatan | Bertobatlah dan hendaklah kamu masing-masing dibaptis | profetis |
| kpr-04 | pertobatan pertobatan | Berani memberitakan Injil di hadapan umum | naratif |
| kpr-05 | pertobatan pertobatan | Jemaat mula-mula bertekun dalam pengajaran rasul-rasul | naratif |
| kpr-06 | pertobatan pertobatan | Ananias, pergilah, carilah Saulus di jalan yang lurus | naratif |

### 4.9 Galatia (8 fragmen seed) — TARGET Ronde 5

| ID | Tema | Teks | Gaya |
|---|---|---|---|
| gal-01 | kebebasan | Berdirilah teguh, jangan lagi memikul kuk perhambaan | argumentatif |
| gal-02 | pertobatan | Kamu yang oleh kasih karunia Allah telah diselamatkan oleh iman | argumentatif |
| gal-03 | pertobatan | Janganlah disesatkan, Allah tidak membiarkan diri-Nya dipermainkan | profetis |
| gal-04 | pertobatan pertobatan | Saudara-saudara, jikalau seorang kedapatan melakukan pelanggaran | pastoral |
| gal-05 | pertobatan pertobatan | Marilah kita tidak jemu-jemu berbuat baik, karena pada waktunya kita akan menuai | argumentatif |
| gal-06 | pertobatan pertobatan | Karena itu berdirilah teguh dalam kemerdekaan | argumentatif |
| gal-07 | pertobatan pertobatan | Kamu telah dimerdekakan, janganlah lagi menghambakan diri | argumentatif |
| gal-08 | pertobatan pertobatan | Janganlah kamu tertipu, persahabatan dengan dunia adalah permusuhan dengan Allah | profetis |

### 4.10 Efesus (6 fragmen seed) — ABU-ABU untuk Ronde 5

| ID | Tema | Teks | Gaya |
|---|---|---|---|
| efe-01 | pertobatan | Karena oleh kasih karunia kamu diselamatkan oleh iman | pastoral |
| efe-02 | pertobatan pertobatan | Hendaklah kamu saling mengasihi, seperti Kristus mengasihi jemaat | pastoral |
| efe-03 | pertobatan pertobatan | Aku berlutut di hadapan Bapa, dari siapa semua keluarga di surga | pastoral |
| efe-04 | pertobatan pertobatan | Marilah kita membuang perbuatan kegelapan dan mengenakan senjata terang | pastoral |
| efe-05 | pertobatan pertobatan | Satu tubuh, satu Roh, satu pengharapan | pastoral |
| efe-06 | pertobatan pertobatan | Bangunlah dan berdirilah teguh, Ikatlah pinggangmu | pastoral |

### 4.11 Wahyu (6 fragmen seed) — AGEN untuk Ronde 4

| ID | Tema | Teks | Gaya |
|---|---|---|---|
| wah-01 | pertobatan | Aku adalah Alfa dan Omega, yang pertama dan yang terakhir | profetis |
| wah-02 | pertobatan | Barangsiapa menang, ia akan mengenakan pakaian putih | profetis |
| wah-03 | pertobatan | Aku berdiri di muka pintu dan mengetuk | profetis |
| wah-04 | pertobatan | Aku akan membuat segalanya baru | profetis |
| wah-05 | pertobatan | Suatu pagi, mata air kehidupan jernih mengkilat | profetis |
| wah-06 | pertobatan | Kemenangan yang mengalahkan dunia ialah iman kita | profetis |

### 4.12 Kidung Agung (6 fragmen seed) — AGEN untuk Ronde 1, 3

| ID | Tema | Teks | Gaya |
|---|---|---|---|
| kda-01 | cinta | Kekasihku berbicara kepadaku: Bangunlah, manisku | puitis |
| kda-02 | cinta romantis | Lihat, musim dingin sudah lalu, hujan sudah berhenti | puitis |
| kda-03 | cinta | Di bawah naungan pohon apel aku ingin duduk | puitis |
| kda-04 | cinta | Suara kekasihku! Lihat, ia datang melompat | puitis |
| kda-05 | cinta | Mawar di antara duri-duri, demikianlah kekasihku | puitis |
| kda-06 | cinta | Aku tidur, tetapi hatiku bangun, suara kekasihku mengetuk | puitis |

### 4.13 1 Timotius (4 fragmen seed) — AGEN untuk Ronde 5

| ID | Tema | Teks | Gaya |
|---|---|---|---|
| tim-01 | pertobatan | Janganlah engkau keras terhadap orang yang lebih muda | pastoral |
| tim-02 | pertobatan | Hendaklah teladan dalam perkataan, dalam tingkah laku | pastoral |
| tim-03 | pertobatan | Jauhilah nafsu orang muda, kejarlah keadilan | pastoral |
| tim-04 | pertobatan | Berdoalah untuk semua orang, untuk raja dan pembesar | pastoral |

---

## 5. RONDE DISTRIBUTION ALGORITHM

```js
function distributeFragmen(round, playerCount) {
  const config = RONDE_CONFIG[round];
  const targetPool = getFragmenByKitab(config.target);
  const abuPool = getFragmenByKitab(config.abu);
  const agenPool = getFragmenByKitab(config.agen);
  
  // Validate pool sizes
  if (targetPool.length < 4) throw new Error(`Pool ${config.target} < 4`);
  if (abuPool.length < 1) throw new Error(`Pool ${config.abu} < 1`);
  if (agenPool.length < 1) throw new Error(`Pool ${config.agen} < 1`);
  
  // Filter out used fragmen in this session
  const availableTarget = filterUsed(targetPool, sessionId);
  const availableAbu = filterUsed(abuPool, sessionId);
  const availableAgen = filterUsed(agenPool, sessionId);
  
  // Shuffle and pick
  const targetShuffled = shuffle(availableTarget);
  const targetPicks = targetShuffled.slice(0, 4);
  const abuPick = shuffle(availableAbu)[0];
  const agenPick = shuffle(availableAgen)[0];
  
  // Mark all as used
  [targetPicks, abuPick, agenPick].flat().forEach(f => markUsed(f.id, sessionId, round));
  
  return {
    target: targetPicks,
    abu: abuPick,
    agen: agenPick
  };
}
```

---

## 6. AUTO-GENERATION THRESHOLD

Kalau `availableTarget.length < AI_GENERATION_THRESHOLD` (default 3):
1. Trigger auto-generate (background, non-blocking)
2. Log ke moderator dashboard: "Auto-generating 5 fragmen untuk kitab Mazmur..."
3. Setelah selesai, push notifikasi ke moderator
4. Distribution continue (sambil tunggu jika perlu, atau pakai sisa yang ada)

---

## 7. SEED INITIALIZATION

### 7.1 First Boot

```js
// scripts/seed.js
const seedFragmen = require('../data/fragmen.json');

async function seedDatabase() {
  const db = getDatabase();
  const existingCount = db.prepare('SELECT COUNT(*) as c FROM fragmen_bank').get().c;
  
  if (existingCount > 0) {
    console.log(`[SEED] DB already has ${existingCount} fragmen, skipping`);
    return;
  }
  
  console.log(`[SEED] Seeding ${seedFragmen.length} initial fragmen...`);
  const insert = db.prepare(`
    INSERT INTO fragmen_bank (kitab, tema, teks, gaya_bahasa, sumber, created_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
  
  const tx = db.transaction((fragmen) => {
    for (const f of fragmen) {
      insert.run(f.kitab, f.tema, f.teks, f.gaya_bahasa, f.sumber || 'seed', Date.now());
    }
  });
  
  tx(seedFragmen);
  console.log(`[SEED] Done. ${seedFragmen.length} fragmen inserted.`);
}
```

### 7.2 When to Run

- **Production:** auto-run on first boot (check if DB empty)
- **Development:** `npm run seed` manual
- **Reset:** delete `data/db/surat-terakhir.sqlite` → restart → re-seed

---

## 8. DATA QUALITY RULES

1. **Minimum 3-15 kata per fragmen** (optimal untuk guessing)
2. **No exact Bible quotes** (harus parafrase/modifikasi, untuk trigger diskusi)
3. **Tema spesifik** (bukan generic "iman" — lebih baik "kasih setia", "pengharapan")
4. **Gaya konsisten** per kitab (Mazmur = puitis, Amsal = argumentatif, dst)
5. **No duplicate** dalam kitab yang sama (validate via UNIQUE constraint di DB)

---

## 9. EXPANSION IDEAS (Future)

- Tambah kitab: Kejadian, Keluaran, Mazmur lagi, Ibrani, 1 Korintus
- Tambah tema khusus: natal, paskah, kenaikan
- Tambah fragmen "Puisi Rohani" (lagu Kristen)
- Tambah fragmen "Khotbah Tokoh" (Charles Spurgeon, Billy Graham, dll)

---

*Dibuat otomatis oleh build pipeline.*
