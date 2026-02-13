// ==========================================
// VALENTINE MISSION — SHARED DATA
// ==========================================

const couplesData = [
    { id: 1, roleA: "Adam", roleB: "Hawa", code: "GARDEN", verseRef: "Kejadian 2:24", verse: "Sebab itu seorang laki-laki akan meninggalkan ayahnya dan ibunya dan bersatu dengan isterinya, sehingga keduanya menjadi satu daging." },
    { id: 2, roleA: "Abraham", roleB: "Sara", code: "PROMISE", verseRef: "Kejadian 12:2", verse: "Aku akan membuat engkau menjadi bangsa yang besar, dan memberkati engkau serta membuat namamu masyhur; dan engkau akan menjadi berkat." },
    { id: 3, roleA: "Ishak", roleB: "Ribka", code: "WELL", verseRef: "Kejadian 24:67", verse: "Lalu Ishak membawa Ribka ke dalam kemah Sara, ibunya, dan ia mengambil Ribka, dan Ribka menjadi isterinya, dan Ishak mencintai dia." },
    { id: 4, roleA: "Yakub", roleB: "Rahel", code: "LABAN", verseRef: "Kejadian 29:20", verse: "Jadi bekerjalah Yakub tujuh tahun lamanya untuk mendapat Rahel, tetapi yang tujuh tahun itu dianggapnya seperti beberapa hari saja, karena cintanya kepada Rahel." },
    { id: 5, roleA: "Boas", roleB: "Rut", code: "HARVEST", verseRef: "Rut 1:16", verse: "Ke mana engkau pergi, ke situ jugalah aku pergi, dan di mana engkau bermalam, di situ jugalah aku bermalam; bangsamulah bangsaku dan Allahmulah Allahku." },
    { id: 6, roleA: "Elkana", roleB: "Hana", code: "PRAYER", verseRef: "1 Samuel 1:27", verse: "Untuk anak ini aku berdoa, dan TUHAN telah memberikan kepadaku apa yang aku minta kepada-Nya." },
    { id: 7, roleA: "Daud", roleB: "Abigail", code: "KING", verseRef: "1 Samuel 25:32", verse: "Terpujilah TUHAN, Allah Israel, yang telah mengutus engkau pada hari ini untuk menemui aku." },
    { id: 8, roleA: "Salomo", roleB: "Gadis Sulam", code: "SONG", verseRef: "Kidung Agung 8:7", verse: "Air yang banyak tak dapat memadamkan cinta, sungai-sungai tak dapat menghanyutkannya." },
    { id: 9, roleA: "Yusuf", roleB: "Maria", code: "ANGEL", verseRef: "Matius 1:20", verse: "Yusuf anak Daud, janganlah engkau takut mengambil Maria sebagai isterimu, sebab anak yang di dalam kandungannya adalah dari Roh Kudus." },
    { id: 10, roleA: "Zakharia", roleB: "Elisabet", code: "SILENT", verseRef: "Lukas 1:13", verse: "Jangan takut, hai Zakharia, sebab doamu telah dikabulkan dan Elisabet isterimu akan melahirkan seorang anak laki-laki bagimu." },
    { id: 11, roleA: "Akuila", roleB: "Priskila", code: "TENT", verseRef: "Kisah Rasul 18:3", verse: "Ia tinggal bersama mereka. Mereka melakukan pekerjaan yang sama, yaitu membuat kemah." },
    { id: 12, roleA: "Hosea", roleB: "Gomer", code: "MERCY", verseRef: "Hosea 3:1", verse: "Pergilah, cintailah perempuan itu, sama seperti TUHAN mencintai orang Israel." },
    { id: 13, roleA: "Musa", roleB: "Zipora", code: "SINAI", verseRef: "Keluaran 2:21", verse: "Musa bersedia tinggal di rumah itu, lalu Reuel memberikan Zipora anaknya kepada Musa." },
    { id: 14, roleA: "Simson", roleB: "Delila", code: "POWER", verseRef: "Hakim-hakim 16:17", verse: "Lalu diceritakannyalah seluruh isi hatinya kepadanya." },
    { id: 15, roleA: "Ahab", roleB: "Izebel", code: "NABOTH", verseRef: "1 Raja-raja 21:25", verse: "Tidak pernah ada orang yang menjual dirinya untuk melakukan apa yang jahat di mata TUHAN seperti Ahab." },
    { id: 16, roleA: "Ananias", roleB: "Safira", code: "MONEY", verseRef: "Kisah Rasul 5:1", verse: "Seorang yang bernama Ananias bersama dengan isterinya Safira menjual sebidang tanah." },
    { id: 17, roleA: "Salmon", roleB: "Rahab", code: "SCARLET", verseRef: "Yosua 2:18", verse: "Ikatlah tali kain kirmizi ini pada jendela yang kaupakai untuk menurunkan kami." },
    { id: 18, roleA: "Amram", roleB: "Yokebed", code: "BASKET", verseRef: "Keluaran 2:3", verse: "Ketika perempuan itu tidak dapat menyembunyikannya lagi, diambilnyalah sebuah peti dari padan-padan." },
    { id: 19, roleA: "Harun", roleB: "Elisyeba", code: "PRIEST", verseRef: "Keluaran 6:23", verse: "Harun mengambil Elisyeba anak Aminadab saudara perempuan Nahason menjadi isterinya." },
    { id: 20, roleA: "Kaleb", roleB: "Akhsa", code: "SPRING", verseRef: "Yosua 15:17", verse: "Otniel anak Kenas saudara Kaleb merebut kota itu dan Kaleb memberikan Akhsa anaknya kepadanya menjadi isteri." }
];

// ==========================================
// TICKET MAP — Group-of-4 pairing system
// Role A = Pencari (Seeker), Role B = Pemegang (Holder)
// NO gender rule — any ticket can be any role!
//
// Every 4 tickets form a mini-group (1-4, 5-8, ..., 37-40).
// Within each group, 2 random pairs are formed. Any ticket
// can be paired with any other, and roles are random too.
// 3 pairing combos × 2 role combos per pair = very random!
//
// NO CONFIG NEEDED. Just distribute tickets in groups of 4.
// ==========================================

// Seeded PRNG (mulberry32) — same result every page load
function _seedRng(seed) {
    return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function _buildTicketMap() {
    const map = {};
    const rng = _seedRng(2026);
    let pairId = 1;

    // 3 ways to pair 4 tickets [a,b,c,d] into 2 pairs:
    const pairingOptions = [
        [[0, 1], [2, 3]],  // (a,b) + (c,d)
        [[0, 2], [1, 3]],  // (a,c) + (b,d)
        [[0, 3], [1, 2]]   // (a,d) + (b,c)
    ];

    for (let blockStart = 1; blockStart <= 40; blockStart += 4) {
        const tickets = [];
        for (let i = 0; i < 4 && blockStart + i <= 40; i++) {
            tickets.push(blockStart + i);
        }

        if (tickets.length === 4) {
            // Pick a random pairing from 3 options
            const pick = Math.floor(rng() * 3);
            const pairs = pairingOptions[pick];

            for (const [i, j] of pairs) {
                // Randomly assign who is A (Seeker) and who is B (Holder)
                const swapRole = rng() > 0.5;
                map[tickets[i]] = { pairId, role: swapRole ? 'B' : 'A' };
                map[tickets[j]] = { pairId, role: swapRole ? 'A' : 'B' };
                pairId++;
            }
        } else {
            // Partial group (2 tickets): direct pair, random roles
            const swapRole = rng() > 0.5;
            map[tickets[0]] = { pairId, role: swapRole ? 'B' : 'A' };
            map[tickets[1]] = { pairId, role: swapRole ? 'A' : 'B' };
            pairId++;
        }
    }

    return map;
}

const ticketMap = _buildTicketMap();

// ==========================================
// HUNT STATIONS — Location Pool (25 locations)
// ==========================================
const locationPool = [
    { clue: "🏛️ \"Di tempat ini, suara pujian bergema dan firman diberitakan. Carilah di dekat mimbar utama!\"" },
    { clue: "🎵 \"Nada-nada indah lahir dari tempat ini. Di mana alat musik beristirahat, petunjuk menunggumu.\"" },
    { clue: "📖 \"Tempat para pemuda berkumpul untuk belajar dan bertumbuh. Ruangan dengan kursi tersusun rapi.\"" },
    { clue: "🌳 \"Keluar dari gedung, ada tempat teduh di mana orang sering duduk berbincang.\"" },
    { clue: "🚪 \"Tempat di mana setiap orang pertama kali masuk. Periksa dekat pintu masuk utama!\"" },
    { clue: "🍽️ \"Tempat menyiapkan makanan dan minuman untuk jemaat. Cek area pantry atau dapur!\"" },
    { clue: "🚗 \"Di luar gedung, kendaraan beristirahat menunggu pemiliknya. Cari di sekitar area parkir!\"" },
    { clue: "📋 \"Pusat administrasi gereja, tempat surat dan dokumen tersimpan. Cek dekat kantor!\"" },
    { clue: "🏗️ \"Naiklah ke atas! Dari sini kamu bisa melihat ke bawah. Cari di area balkon!\"" },
    { clue: "🪜 \"Tempat naik dan turun antar lantai. Perhatikan area sekitar tangga!\"" },
    { clue: "🔊 \"Di mana suara diatur dan dikontrol. Tempat orang mengatur sound system!\"" },
    { clue: "🎭 \"Platform di bagian depan, tempat orang berdiri saat memimpin ibadah. Cek panggung!\"" },
    { clue: "🪟 \"Cahaya matahari masuk melalui sini. Cari di dekat jendela besar!\"" },
    { clue: "🏛️ \"Tiang-tiang penopang berdiri kokoh menyanggah gedung. Cek di sekitar pilar utama!\"" },
    { clue: "🪑 \"Deretan pertama, paling dekat dengan mimbar. Cari di bangku paling depan!\"" },
    { clue: "⛩️ \"Bukan pintu gedung, tapi gerbang area luar. Cek di gerbang masuk halaman!\"" },
    { clue: "❄️ \"Dari sini udara sejuk berhembus. Cari di dekat unit pendingin ruangan!\"" },
    { clue: "📽️ \"Alat yang menampilkan gambar dan tulisan di layar. Cek di area proyektor!\"" },
    { clue: "✝️ \"Simbol iman yang paling utama terpampang di sini. Cari di dekat salib!\"" },
    { clue: "🌲 \"Tumbuhan besar memberikan keteduhan di halaman gereja. Cek di bawah pohon!\"" },
    { clue: "💧 \"Tempat mengambil air minum untuk jemaat. Cari dekat galon atau dispenser!\"" },
    { clue: "📌 \"Tempat informasi dan pengumuman ditempel. Cek papan pengumuman!\"" },
    { clue: "📦 \"Ruangan tempat barang-barang disimpan. Cari di sekitar gudang!\"" },
    { clue: "🙏 \"Tempat yang tenang untuk berdoa secara pribadi. Cari ruang yang sunyi!\"" },
    { clue: "🏟️ \"Ruangan besar tempat pertemuan atau fellowship. Cek di aula gereja!\"" }
];

// Route assignments: which location indices each couple visits (5 per route)
const routeMap = [
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    [5, 10, 15, 20, 0],
    [6, 11, 16, 21, 1],
    [7, 12, 17, 22, 2],
    [8, 13, 18, 23, 3],
    [9, 14, 19, 24, 4],
    [10, 15, 20, 0, 5],
    [11, 16, 21, 1, 6],
    [12, 17, 22, 2, 7],
    [13, 18, 23, 3, 8],
    [14, 19, 24, 4, 9],
    [15, 20, 0, 5, 10],
    [16, 21, 1, 6, 11],
    [17, 22, 2, 7, 12],
    [18, 23, 3, 8, 13],
    [19, 24, 4, 9, 14]
];

// Unique answer codes for each route (100 total, all unique)
const huntCodes = [
    ["KASIH", "SETIA", "IMAN", "DAMAI", "SUKA"],
    ["BERKAT", "JANJI", "DOMBA", "HARAP", "TERANG"],
    ["SUMUR", "MULIA", "RELA", "INDAH", "NIKMAT"],
    ["RINDU", "SABAR", "CINTA", "MIMPI", "BAKTI"],
    ["GANDUM", "MURAH", "TEBUS", "PANEN", "JELAI"],
    ["MOHON", "PUJI", "NAZAR", "JAWAB", "KUASA"],
    ["BIJAK", "ADIL", "BENAR", "RENDAH", "TAKWA"],
    ["MAWAR", "BUNGA", "WANGI", "RATNA", "MEGAH"],
    ["WAHYU", "SUCI", "MURNI", "MURID", "KABAR"],
    ["KUDUS", "SABDA", "TULUS", "ABADI", "TEGUH"],
    ["PERAK", "EMAS", "PERMATA", "JUBAH", "MAHKOTA"],
    ["GARAM", "RAGI", "BIJI", "BUAH", "TUNAS"],
    ["ANGGUR", "ROTI", "MANNA", "ZAITUN", "MADU"],
    ["SINGA", "ELANG", "MERPATI", "AWAN", "PELANGI"],
    ["PERISAI", "PEDANG", "TAMENG", "PANJI", "TABUT"],
    ["SUNGAI", "GUNUNG", "LEMBAH", "PADANG", "BATU"],
    ["JALAN", "PINTU", "KUNCI", "RUMAH", "BENTENG"],
    ["PELITA", "OBOR", "LENTERA", "SINAR", "FAJAR"],
    ["BANGKIT", "HIDUP", "MUTIARA", "GIRANG", "KURNIA"],
    ["HARPA", "REBANA", "KECAPI", "SULING", "GIRING"]
];

// Build hunt route for a specific couple
function getHuntRoute(pairId) {
    const assignments = routeMap[pairId - 1];
    const codes = huntCodes[pairId - 1];
    return assignments.map((locIdx, i) => ({
        stage: i + 1,
        clue: locationPool[locIdx].clue,
        locationCode: codes[i]
    }));
}

// Get all hunt data for moderator display
function getAllHuntData() {
    const allData = [];
    for (let p = 1; p <= 20; p++) {
        allData.push({
            pairId: p,
            couple: couplesData[p - 1],
            stations: getHuntRoute(p)
        });
    }
    return allData;
}

// ==========================================
// WOULD YOU RATHER — Cringe/Bucin Edition
// ==========================================
const wyrData = [
    { id: 1, optA: "Berlutut di depan dia dan bilang \"Kamu satu-satunya alasan aku bangun pagi\" dengan tatapan serius", optB: "Pegang tangan dia, tatap matanya, dan bilang \"Aku kangeeen\" dengan nada manja" },
    { id: 2, optA: "Peluk dia dari samping dan bisikkan \"Aku bersyukur Tuhan ngasih kamu di hidupku\"", optB: "Pegang pipi dia dan bilang \"Karya Tuhan yang terindah\" sambil senyum" },
    { id: 3, optA: "Nyanyikan satu bait lagu romantis sambil menatap matanya", optB: "Bacakan puisi cinta dadakan minimal 2 baris untuk dia di depan semua orang" },
    { id: 4, optA: "Genggam tangan dia, berlutut, dan bilang \"Kalau kamu planet, kamu Saturnus — karena kamu layak punya cincin dariku\"", optB: "Tatap dia lalu bilang \"Kamu tahu kenapa aku suka hujan? Karena aku ingin berbagi payung denganmu\" sambil berpura-pura memeluk" },
    { id: 5, optA: "Pegang tangannya dan bilang \"Doa-doaku selama ini terjawab lewat kamu\" dengan wajah serius", optB: "Pura-pura foto dia diam-diam, lalu bilang \"Sorry, reflex kalau lihat yang indah\"" },
    { id: 6, optA: "Teriak \"DIA INI SPESIAL BANGET!\" sambil tunjuk dia di depan semua orang", optB: "Tunjukkan wallpaper HP-mu (atau pura-pura) dan bilang \"Ini screensaver terindahku\" sambil arahkan HP ke dia" },
    { id: 7, optA: "Bilang \"Kalau aku Nuh, kamu orang pertama yang aku ajak masuk bahtera\" sambil ulurin tangan", optB: "Bilang \"Kalau aku Adam, aku rela kehilangan tulang rusuk lagi demi kamu\" sambil pegang dada" },
    { id: 8, optA: "Peluk dia dari belakang dan bisikkan \"Hidup tanpamu kayak Wi-Fi tanpa password\"", optB: "Tatap matanya dalam-dalam lalu bilang \"Duh, mata kamu bikin aku lupa ayat hafalan\"" },
    { id: 9, optA: "Berlutut dan bilang \"Bintang di langit kalah sama senyummu\" sambil nunjuk ke atas", optB: "Pegang kedua tangannya, tatap mata, dan bilang \"Kalau dunia gelap, senyummu cukup jadi penerangku\"" },
    { id: 10, optA: "Bilang tanggal hari ini dan bilang \"Tanggal ini akan jadi tanggal penting karena aku ketemu kamu\"", optB: "Nyanyikan \"Kau yang terindah\" (atau lagu apa pun) ganti nama di liriknya jadi \"kamu\"" },
    { id: 11, optA: "Teriak \"AKU SAYANG KAMU!\" ke arah dia di depan semua orang yang ada di sini", optB: "Beri dia bunga imajiner (dari tangan) dan bilang \"Ini bunga untukmu, setiap hari, sampai setahun\"" },
    { id: 12, optA: "Bilang \"Kamu itu jawaban doa-doaku\" sambil berlutut dan pegang tangannya", optB: "Rekam voice note dan bilang \"Ini lagu worship favoritku, tapi lebih indah kalau dengarnya bareng kamu\"" },
    { id: 13, optA: "Gombalin dia di depan semua orang: \"Kamu tahu kenapa langit biru? Karena semua warna indah ada di kamu\"", optB: "Buat puisi 2 baris tentang dia secara dadakan dan bacakan dengan dramatis" },
    { id: 14, optA: "Bilang \"Kamu lebih manis dari manna yang turun dari langit\" sambil senyum ke dia", optB: "Bilang \"Aku rela jalan 40 tahun di padang gurun kalau ada kamu di sampingku\" sambil gandeng tangannya" },
    { id: 15, optA: "Tulis di udara (pakai jari) kata \"I ❤ U\" lalu tunjuk ke dia", optB: "Telepon (pura-pura) dan bilang \"Halo Tuhan, makasih ya udah ciptain dia\" sambil nunjuk ke dia" },
    { id: 16, optA: "Bilang \"Kamu itu Kidung Agung versi nyata\" sambil pegang dadamu dengan dramatis", optB: "Nyanyi satu kalimat lagu rohani dan dedikasikan buat dia di depan semua" },
    { id: 17, optA: "Pegang kedua tangannya dan bilang \"Tuhan menciptakanmu khusus untukku\" dengan muka seserius mungkin", optB: "Ceritakan 1 hal yang menurutmu spesial tentang dia (boleh ngarang!) di depan semua orang" },
    { id: 18, optA: "Pura-pura menangis tersedu-sedu lalu bilang \"Aku terharu karena akhirnya ketemu kamu\"", optB: "Bilang \"Aku sudah siapkan nama anak kita\" lalu sebutkan nama random dengan muka serius" },
    { id: 19, optA: "Bilang \"Aku mau jadi Boas-mu\" lalu pura-pura kasi dia selimut (jaket/cardigan)", optB: "Bilang \"Aku menunggu kamu seperti Yakub menunggu Rahel — 7 tahun pun rela\" sambil berlutut" },
    { id: 20, optA: "Nyanyikan \"10.000 Reasons\" tapi ganti satu baris liriknya jadi tentang dia", optB: "Berdiri, angkat tangan, dan bilang \"Dia adalah berkat terbesar dalam hidupku\" ke semua orang" },
    { id: 21, optA: "Joget TikTok bareng dia di depan semua orang (pilih gerakan sendiri!)", optB: "Ajarkan dia satu gerakan dansa (waltz/salsa) lalu praktekkan berdua 10 detik" },
    { id: 22, optA: "Bilang \"Kamu tuh kayak Google — semua yang aku cari, ada di kamu\" sambil pegang tangannya", optB: "Bisikkan \"Kamu itu bukan WiFi tapi aku selalu connect sama kamu\" lalu senyum" },
    { id: 23, optA: "Tatap dia lalu bilang \"Kalau aku punya 3 permintaan, ketiganya pasti tentang kamu\"", optB: "Gandeng tangannya dan bilang \"Kalau hidup ini film, kamu leading role-nya\" sambil membungkuk hormat" },
    { id: 24, optA: "Bilang \"Selamat pagi sayang\" dengan nada paling manja yang bisa kamu keluarkan", optB: "Bilang \"Selamat malam, mimpi indah ya\" sambil pura-pura selimuti dia" },
    { id: 25, optA: "Pura-pura jadi sales dan promosikan dia ke semua orang: \"Ini paket komplit: cantik/ganteng, baik hati, dan lucu!\"", optB: "Pura-pura jadi reporter dan wawancarai dia: \"Rahasianya apa bisa secantik/seganteng ini?\"" },
    { id: 26, optA: "Salam-salaman ala drama Korea: genggam tangan sambil bilang \"Saranghae\" dengan muka serius", optB: "Lakukan aegyo (gaya imut Korea) sambil bilang \"Oppaa/Unniii\" ke dia" },
    { id: 27, optA: "Bilang \"Aku rela antri 7 tahun kayak Yakub asal yang ditunggu itu kamu\" sambil berlutut", optB: "Tunjuk dia dan bilang \"Mazmur 139:14 — kamu dijadikan secara dahsyat dan ajaib\" dengan muka serius" },
    { id: 28, optA: "Pura-pura jadi MC dan umumkan ke semua: \"Hadirin sekalian, inilah manusia tercantik/terganteng di ruangan ini!\"", optB: "Pura-pura bawa microphone (tangan) dan nyanyikan satu baris lagu dedication buat dia" },
    { id: 29, optA: "High-five dia, lalu tahan tangannya dan bilang \"Eh sorry, aku ga mau lepasin\"", optB: "Tatap mata dia selama 10 detik tanpa berkedip sambil senyum — tanpa ngomong apa-apa" },
    { id: 30, optA: "Lakukan \"finger heart\" Korea lalu bilang \"Ini buat kamu, gratis!\" sambil kasih ke dia", optB: "Gambar hati di udara yang besar pakai kedua tangan lalu tunjuk ke dia dan bilang \"Ini ukuran cintaku\"" },
    { id: 31, optA: "Bilang \"Kamu itu vitamin — tanpa kamu aku sakit\" sambil pura-pura lemas", optB: "Bilang \"Kamu itu oksigen — tanpa kamu aku ga bisa napas\" sambil pegang dada dramatis" },
    { id: 32, optA: "Pura-pura jadi waiter: \"Selamat datang, menu spesial hari ini adalah senyuman dari saya khusus buat Anda\"", optB: "Pura-pura jadi pilot: \"Penerbangan menuju hati kamu siap take off\" sambil berdiri tegap" },
    { id: 33, optA: "Gandeng dia lalu ajak jalan bareng keliling ruangan sambil bilang \"Ini first date kita ya\"", optB: "Pura-pura buka pintu buat dia dan bilang \"Silakan masuk, tuan putri/pangeran\"" },
    { id: 34, optA: "Bilang 3 hal yang kamu sukai dari dia (boleh ngarang) dengan muka serius di depan semua", optB: "Bilang \"Top 3 alasan kenapa kamu harus jadi pacarku\" lalu sebutkan dengan gaya presentasi" },
    { id: 35, optA: "Pura-pura menelepon ibu dan bilang \"Ma, aku udah ketemu jodohku\" sambil nunjuk dia", optB: "Pura-pura menelepon teman dan bilang \"Bro/Sis, doain ya, aku lagi PDKT sama dia\" sambil nunjuk dia" },
    { id: 36, optA: "Pegang pundaknya dan bilang \"Tenang, apapun yang terjadi, aku ada di sini\" dengan nada serius", optB: "Tepuk dadamu dan bilang \"Kalau kamu butuh sandaran, sini\" dengan muka yakin" },
    { id: 37, optA: "Bilang \"Kamu tuh kayak bintang — jauh tapi tetap bikin aku terpesona\" sambil nunjuk ke atas", optB: "Bilang \"Kamu tuh kayak pelangi — muncul setelah hujan dan bikin hari aku indah\" sambil senyum lebar" },
    { id: 38, optA: "Nyanyikan satu baris \"Can't Help Falling in Love\" sambil tatap dia", optB: "Nyanyikan satu baris \"Perfect\" Ed Sheeran sambil pegang tangan dia" },
    { id: 39, optA: "Buat akronim dari nama dia yang isinya pujian (contoh: A=Anggun, N=Nice, I=Incredible)", optB: "Rap freestyle 4 baris tentang dia — boleh jelek yang penting berani!" },
    { id: 40, optA: "Kasih dia piggyback ride pura-pura (bungkuk dan bilang \"naik!\") 3 langkah", optB: "Pura-pura jadi bodyguard dia: berdiri tegap di sampingnya dan bilang \"Nobody touch my VIP\"" }
];
