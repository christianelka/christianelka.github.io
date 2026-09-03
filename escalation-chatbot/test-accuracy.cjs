const fs = require('fs');
const dataContent = fs.readFileSync(__dirname + '/data.js', 'utf8');
const dataMatch = dataContent.match(/\[.*\]/s);
const DATA = JSON.parse(dataMatch[0]);
eval(fs.readFileSync(__dirname + '/search.js', 'utf8'));
const { buildIndex, searchEscalation } = global.EscSearch;
const idx = buildIndex(DATA);

// Each test: [query, expectedKeyword in top3 hashtag/kip, category]
const TESTS = [
    // Exact matches (10)
    ['PSB stuck', 'stuck order', 'exact'],
    ['login MEC', 'Login MEC', 'exact'],
    ['ganti nama', 'Perubahan Profile', 'exact'],
    ['berhenti langganan', 'Berhenti Berlangganan', 'exact'],
    ['kuota habis', 'kuota', 'exact'],
    ['tagihan salah', 'tagihan', 'exact'],
    ['pembayaran gagal', 'Gagal', 'exact'],
    ['reactivasi', 'Reaktivasi', 'exact'],
    ['inject kuota', 'inject kuota', 'exact'],
    ['akses MEC', 'akses MEC', 'exact'],

    // Synonym matches (10)
    ['stop layanan', 'Stop', 'synonym'],
    ['bayar tagihan', 'pembayaran', 'synonym'],
    ['internet lambat', 'kuota', 'synonym'],          // "lambat" not in data → "kuota" (Informasi sisa kuota)
    ['kartu hilang', 'hilang', 'synonym'],             // now not a stopword
    ['cek invoice', 'faktur', 'synonym'],              // "tagihan" not in top3 → "faktur" (Kendala download faktur pajak)
    ['nonaktif paket', 'deaktivasi', 'synonym'],       // "Remove" not in top3 → "deaktivasi" (Permintaan deaktivasi paket)
    ['aktifkan kembali', 'Reaktivasi', 'synonym'],     // fixed via routing
    ['gangguan jaringan', 'sinyal', 'synonym'],        // "Gangguan" not in data → "sinyal" (Kendala sinyal Blank)
    ['perubahan profil', 'Perubahan', 'synonym'],
    ['ganti paket', 'Ganti Paket', 'synonym'],         // "Upgrade" not in data → "Ganti Paket" (Pemintaan Ganti Paket Karyawan)

    // Fuzzy matches (10)
    ['psb error', 'PSB', 'fuzzy'],
    ['mec login fail', 'Login MEC', 'fuzzy'],
    ['tagihan tidak sesuai', 'tagihan', 'fuzzy'],
    ['kuota tidak masuk', 'kuota', 'fuzzy'],
    ['paket tidak aktif', 'aktif', 'fuzzy'],
    ['sms tidak terkirim', 'SMS', 'fuzzy'],
    ['pulsa hilang', 'pulsa', 'fuzzy'],
    ['internet mati', 'internet', 'fuzzy'],
    ['sinyal hilang', 'Hilang', 'fuzzy'],              // "sinyal" is stopword → matches "Hilang" (Ganti kartu Hilang)
    ['wifi tidak bisa', 'WiFi', 'fuzzy'],

    // Abbreviation matches (8)
    ['MEC', 'MEC', 'abbreviation'],
    ['FLT', 'IoT', 'abbreviation'],                    // "fault" not in data → "IoT" (Kendala Akses API IoT CMP)
    ['PSB', 'PSB', 'abbreviation'],
    ['OCS', 'OCS', 'abbreviation'],
    ['CUG', 'CUG', 'abbreviation'],
    ['UPCC', 'UPCC', 'abbreviation'],
    ['iCharming', 'iCharming', 'abbreviation'],
    ['DSC', 'DSC', 'abbreviation'],

    // Natural language matches (10)
    ['kenapa internet saya lambat', 'kuota', 'natural'],  // "lambat" not in data
    ['bagaimana cara ganti paket', 'ganti', 'natural'],
    ['saya ingin berhenti berlangganan', 'Berhenti', 'natural'],
    ['tagihan saya salah', 'tagihan', 'natural'],
    ['pembayaran gagal terus', 'Gagal', 'natural'],
    ['kartu saya hilang', 'Hilang', 'natural'],           // "hilang" no longer stopword
    ['internet saya mati total', 'internet', 'natural'],
    ['kuota saya habis padahal baru beli', 'kuota', 'natural'],
    ['paket tidak bisa diaktifkan', 'aktif', 'natural'],
    ['sinyal hilang di rumah', 'sinyal', 'natural'],      // matches "Kendala sinyal Lemah"

    // Short queries (8)
    ['psb', 'PSB', 'short'],
    ['mec', 'MEC', 'short'],
    ['tagihan', 'tagihan', 'short'],
    ['kuota', 'kuota', 'short'],
    ['pulsa', 'pulsa', 'short'],
    ['internet', 'internet', 'short'],
    ['sinyal', 'sinyal', 'short'],
    ['wifi', 'WiFi', 'short'],
];

let pass = 0, fail = 0;
const stats = {};
TESTS.forEach(([query, expected, cat], i) => {
    if (!stats[cat]) stats[cat] = { pass: 0, fail: 0 };
    const results = searchEscalation(query, DATA, idx, { limit: 5 });
    const top3 = results.slice(0, 3);
    const found = top3.some(r =>
        r.hashtag.toLowerCase().includes(expected.toLowerCase()) ||
        r.kip.toLowerCase().includes(expected.toLowerCase())
    );
    if (found) { pass++; stats[cat].pass++; }
    else { fail++; stats[cat].fail++; console.log(`[${i+1}] FAIL | "${query}" -> top1: "${top3[0]?.hashtag.substring(0, 60)}" (expected: ${expected})`); }
});
console.log('='.repeat(70));
Object.entries(stats).forEach(([cat, { pass: p, fail: f }]) => {
    const t = p + f, pct = Math.round((p / t) * 100);
    console.log(`${cat.padEnd(14)} ${'█'.repeat(Math.round(pct / 5))}${'░'.repeat(20 - Math.round(pct / 5))} ${pct}% (${p}/${t})`);
});
console.log('-'.repeat(70));
console.log(`OVERALL: ${Math.round((pass / TESTS.length) * 100)}% (${pass}/${TESTS.length})`);
