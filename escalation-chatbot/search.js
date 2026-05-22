(function (global) {
    'use strict';

    const STOPWORDS = new Set([
        'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'ini', 'itu',
        'atau', 'juga', 'ada', 'tidak', 'bisa', 'mohon', 'bantu', 'tolong', 'dear',
        'rekan', 'terima', 'kasih', 'capture', 'nomor', 'silakan', 'minta',
        'agar', 'atas', 'telah', 'sudah', 'akan', 'lagi', 'saya', 'kami', 'kita',
        'jadi', 'adalah', 'sebagai', 'oleh', 'bahwa', 'dapat', 'dalam', 'kepada',
        'tersebut', 'antar', 'antara', 'para', 'setiap', 'semua', 'sangat', 'hanya',
        'saja', 'seperti', 'baik', 'baru', 'lama', 'via', 'dimana', 'kemana',
        'kapan', 'siapa', 'apa', 'bagaimana', 'mengapa', 'kenapa', 'nya', 'sekarang',
        'disini', 'sini', 'sana', 'mau', 'ingin', 'supaya',
        'karena', 'sebab', 'maka', 'lalu', 'kemudian', 'setelah', 'sebelum', 'saat',
        'ketika', 'selama', 'hingga', 'sampai', 'tanpa', 'tetapi', 'tapi', 'namun',
        'melainkan', 'padahal', 'sedangkan', 'daripada', 'bagai', 'laksana', 'umpama',
        'hal', 'perihal', 'tentang', 'mengenai', 'perlu', 'butuh', 'memerlukan',
        'membutuhkan', 'please', 'help', 'the', 'and', 'for', 'with', 'pak', 'bu',
        'mas', 'mbak', 'team', 'tim', 'gan', 'sis', 'atasan', 'percepatan', 'dibantu',
        'dibantukan', 'mohonkan', 'minimalisir', 'segera', 'kira', 'apakah'
    ]);

    const SHORT_TOKENS_KEPT = new Set([
        'iot', 'mec', 'sim', 'cdr', 'puk', 'apn', 'sms', 'cug', 'hlr', 'ocs',
        'b2b', 'va', 'tv', 'ip', 'dns', 'am', 'pdf', 'cs', 'ces', 'lba', 'bcp',
        'scv', 'tdc', 'usim', 'esim', 'volte', 'gprs', 'lte', 'nbp'
    ]);

    const SYNONYMS = {
        'billing': ['tagihan', 'ebill', 'invoice', 'faktur'],
        'tagihan': ['billing', 'ebill', 'invoice', 'faktur'],
        'ebill': ['billing', 'tagihan', 'invoice'],
        'invoice': ['tagihan', 'billing', 'faktur'],
        'sim': ['simcard', 'kartu', 'usim'],
        'simcard': ['sim', 'kartu', 'usim'],
        'kartu': ['sim', 'simcard', 'usim'],
        'usim': ['sim', 'simcard', 'kartu'],
        'mutasi': ['ganti', 'kepemilikan', 'transfer'],
        'ganti': ['mutasi', 'tukar', 'kepemilikan'],
        'kepemilikan': ['mutasi', 'ganti', 'transfer'],
        'berhenti': ['terminasi', 'deaktivasi', 'stop', 'cabut', 'cancel'],
        'terminasi': ['berhenti', 'deaktivasi', 'stop', 'cabut'],
        'deaktivasi': ['berhenti', 'terminasi', 'stop', 'cabut', 'nonaktifkan'],
        'reaktivasi': ['aktivasi', 'renewal', 'refresh'],
        'kuota': ['quota', 'paket', 'data'],
        'paket': ['package', 'bundle', 'kuota'],
        'gagal': ['error', 'fail', 'failed', 'tidak'],
        'error': ['gagal', 'fail', 'failed'],
        'login': ['masuk', 'akses', 'signin'],
        'masuk': ['login', 'akses'],
        'akses': ['login', 'masuk'],
        'roaming': ['roamax', 'roam'],
        'roamax': ['roaming', 'roam'],
        'pajak': ['tax', 'ppn', 'faktur'],
        'pembayaran': ['bayar', 'payment', 'bookpayment'],
        'bayar': ['pembayaran', 'payment'],
        'corporate': ['corp', 'perusahaan'],
        'consumer': ['cons', 'retail'],
        'profile': ['profil', 'data', 'informasi'],
        'limit': ['batas', 'plafon'],
        'b2b2c': ['mepro'],
        'mepro': ['b2b2c'],
        'iot': ['cmp', 'aeris'],
        'flash': ['ekstra', 'tambahan'],
        'ekstra': ['flash', 'tambahan'],
        'cug': ['teamplan'],
        'teamplan': ['cug'],
        'fitur': ['feature', 'layanan'],
        'inject': ['topup', 'tambah', 'isi'],
        'topup': ['inject', 'isi', 'tambah', 'top'],
        'mec': ['myenterprise'],
        'myenterprise': ['mec', 'enterprise'],
        'orbit': ['b2b2c'],
        'volte': ['voice'],
        'complete': ['selesai', 'completed'],
        'order': ['pesanan', 'permintaan'],
        'repeat': ['ulang', 'kembali'],
        'reset': ['ubah'],
        'aktivasi': ['activation', 'aktifkan'],
        'enterprise': ['myenterprise', 'mec'],
        'connectivity': ['konektivitas', 'koneksi'],
        'sinyal': ['signal', 'network'],
        'network': ['sinyal', 'jaringan'],
        'chatgpt': ['gpt', 'chat'],
        'gpt': ['chatgpt'],
        'zoom': ['video', 'meeting'],
        'whatsapp': ['wa'],
        'diakses': ['akses', 'login'],
        'mengakses': ['akses', 'login'],
        'didapatkan': ['dapat', 'terima'],
        'digunakan': ['guna', 'pakai'],
        'prime': ['layanan', 'digital', 'video'],
        'netflix': ['layanan', 'digital', 'streaming'],
        'spotify': ['layanan', 'digital', 'musik'],
        'youtube': ['layanan', 'digital', 'video'],
        'streaming': ['layanan', 'digital', 'video'],
        'video': ['layanan', 'digital', 'streaming'],
        'berlangganan': ['aktivasi', 'layanan'],
        'bonus': ['ekstra', 'tambahan', 'kuota'],
        'ces': ['eskalasi', 'escalation']
    };

    const GROUP_ROUTING_HINTS = [
        { keywords: ['add offer', 'open restric', 'open restrict', 'add offering'], groupMatch: 'UFO', boost: 90 },
        { keywords: ['aktivasi paket team', 'balance transfer', 'bltf', 'pengecekan nomor'], groupMatch: 'CUGCorporate', boost: 90 },
        { keywords: ['iccid', ' sn ', 'serial number', 'pengecekan iccid'], groupMatch: 'Paradise', boost: 90 },
        { keywords: ['volte'], groupMatch: 'UniprovPaceLayer', boost: 50 },
        { keywords: ['add psb', 'psb stuck', 'stuck order'], groupMatch: 'MyEnterpriseAccess', boost: 80 },
        { keywords: ['parent child', 'parents child', 'parent-child', 'registrasi child', 'child member'], groupMatch: 'CRMBE', boost: 80 },
        { keywords: ['sisa kuota', 'inject kuota', 'aod', 'remove paket', 'remove package'], groupMatch: 'UPCC', boost: 100 },
        { keywords: ['blacklist', 'whitelist', 'layanan google'], groupMatch: 'iCharming', boost: 100 },
        { keywords: ['cek order proses', 'proses reaktivasi', 'perubahan billing status', 'change billing status'], groupMatch: 'IoT CMP', boost: 80 },
        { keywords: ['gprs lock', 'gprs block', 'terminate gprs', 'nonaktif gprs', 'ubah order failed', 'order failed komplet', 'order failed ke komplet', 'failed ke komplet'], groupMatch: 'DSC', boost: 100 }
    ];

    const KIP_ROUTING_HINTS = [
        { keywords: ['prime video', 'netflix', 'spotify', 'disney', 'youtube premium', 'apple music', 'hbo'], kipMatch: 'layanan digital', boost: 150 },
        { keywords: ['chatgpt', 'chat gpt', 'openai'], kipMatch: 'chat gpt', boost: 150 },
        { keywords: ['zoom pro', 'zoom premium'], kipMatch: 'zoom', boost: 150 }
    ];

    const INDONESIAN_PREFIXES = ['meng', 'meny', 'menc', 'mem', 'men', 'me', 'ber', 'bel', 'ter', 'pem', 'pen', 'peng', 'per', 'di', 'ke', 'se'];
    const INDONESIAN_SUFFIXES = ['kan', 'lah', 'kah', 'nya', 'an', 'i'];

    function stem(token) {
        if (!token || token.length < 5) return token;
        let stemmed = token;
        for (const prefix of INDONESIAN_PREFIXES) {
            if (stemmed.length - prefix.length >= 3 && stemmed.startsWith(prefix)) {
                const candidate = stemmed.slice(prefix.length);
                if (candidate.length >= 3) { stemmed = candidate; break; }
            }
        }
        for (const suffix of INDONESIAN_SUFFIXES) {
            if (stemmed.length - suffix.length >= 3 && stemmed.endsWith(suffix)) {
                const candidate = stemmed.slice(0, -suffix.length);
                if (candidate.length >= 3) { stemmed = candidate; break; }
            }
        }
        return stemmed;
    }

    function normalize(text) {
        return String(text || '')
            .toLowerCase()
            .replace(/https?:\/\/\S+/g, ' ')
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function isMeaningfulToken(token) {
        if (!token || STOPWORDS.has(token)) return false;
        return token.length >= 3 || SHORT_TOKENS_KEPT.has(token);
    }

    function tokenize(text) {
        const norm = normalize(text);
        if (!norm) return [];
        return norm.split(' ').filter(isMeaningfulToken);
    }

    function expandWithSynonyms(tokens) {
        const seen = new Set(tokens);
        const expanded = [];
        tokens.forEach(t => {
            const syns = SYNONYMS[t];
            if (!syns) return;
            syns.forEach(syn => {
                syn.split(' ').forEach(w => {
                    if (!seen.has(w) && isMeaningfulToken(w)) {
                        seen.add(w);
                        expanded.push(w);
                    }
                });
            });
        });
        return expanded;
    }

    function escapeRegex(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function hasWord(haystack, needle) {
        if (!needle || !haystack) return false;
        const re = new RegExp(`(^|[^a-z0-9])${escapeRegex(needle)}([^a-z0-9]|$)`, 'i');
        return re.test(haystack);
    }

    function hasStem(haystack, needle) {
        if (!needle || !haystack || needle.length < 4) return false;
        const re = new RegExp(`(^|[^a-z0-9])${escapeRegex(needle)}[a-z]{0,4}([^a-z0-9]|$)`, 'i');
        return re.test(haystack);
    }

    function buildIndex(data) {
        const docTokens = data.map(d => new Set(tokenize(`${d.kip} ${d.group}`)));

        const documentFrequency = Object.create(null);
        docTokens.forEach(toks => {
            toks.forEach(t => { documentFrequency[t] = (documentFrequency[t] || 0) + 1; });
        });

        const N = data.length;
        const idf = Object.create(null);
        for (const t in documentFrequency) {
            idf[t] = Math.log(1 + (N - documentFrequency[t] + 0.5) / (documentFrequency[t] + 0.5));
        }

        return { docTokens, idf, df: documentFrequency, N };
    }

    function searchEscalation(query, data, index, opts) {
        opts = opts || {};
        const groupFilter = opts.groupFilter || '';
        const categoryFilter = (opts.categoryFilter || '').toLowerCase();
        const corrections = opts.corrections;

        const queryNorm = normalize(query);
        if (!queryNorm) return [];

        const queryTokens = tokenize(query);
        const synonymTokens = expandWithSynonyms(queryTokens);
        const idfFloor = Math.log(1 + index.N);

        const triggeredRoutingHints = GROUP_ROUTING_HINTS.filter(hint =>
            hint.keywords.some(kw => queryNorm.includes(kw))
        );

        const triggeredKipHints = KIP_ROUTING_HINTS.filter(hint =>
            hint.keywords.some(kw => queryNorm.includes(kw))
        );

        const results = [];

        data.forEach((entry, entryIdx) => {
            if (groupFilter && entry.group !== groupFilter) return;
            if (categoryFilter) {
                const m = entry.kip.match(/- (.+)$/);
                const cat = m ? m[1].trim() : '';
                if (cat.toLowerCase() !== categoryFilter) return;
            }

            const kipNorm = normalize(entry.kip);
            const groupNorm = normalize(entry.group);

            let score = 0;
            const matched = new Set();

            if (queryNorm.length >= 5 && kipNorm.includes(queryNorm)) {
                score += 120;
            }

            queryTokens.forEach(t => {
                const weight = index.idf[t] || idfFloor;
                const stemToken = stem(t);
                if (hasWord(kipNorm, t)) {
                    score += 18 * weight;
                    matched.add(t);
                } else if (hasWord(groupNorm, t)) {
                    score += 12 * weight;
                    matched.add(t);
                } else if (stemToken !== t && stemToken.length >= 3) {
                    if (hasStem(kipNorm, stemToken)) {
                        score += 12 * weight;
                        matched.add(t);
                    } else if (hasStem(groupNorm, stemToken)) {
                        score += 8 * weight;
                        matched.add(t);
                    }
                }
            });

            synonymTokens.forEach(t => {
                const weight = (index.idf[t] || idfFloor) * 0.5;
                if (hasWord(kipNorm, t)) {
                    score += 8 * weight;
                    matched.add(t);
                } else if (hasWord(groupNorm, t)) {
                    score += 5 * weight;
                    matched.add(t);
                }
            });

            for (let j = 0; j < queryTokens.length - 1; j++) {
                const bigram = queryTokens[j] + ' ' + queryTokens[j + 1];
                if (kipNorm.includes(bigram)) score += 30;
                else if (groupNorm.includes(bigram)) score += 18;
            }

            if (queryTokens.length > 0) {
                const coverageRatio = matched.size / queryTokens.length;
                score *= (0.6 + 0.4 * coverageRatio);
            }

            if (corrections && typeof corrections.boostFor === 'function') {
                score += corrections.boostFor(query, entryIdx);
            }

            triggeredRoutingHints.forEach(hint => {
                if (entry.group.toLowerCase().includes(hint.groupMatch.toLowerCase())) {
                    score += hint.boost;
                }
            });

            triggeredKipHints.forEach(hint => {
                if (entry.kip.toLowerCase().includes(hint.kipMatch.toLowerCase())) {
                    score += hint.boost;
                }
            });

            if (score > 0.5) {
                results.push({
                    ...entry,
                    _idx: entryIdx,
                    _matched: [...matched],
                    scoreRaw: score
                });
            }
        });

        results.sort((a, b) => b.scoreRaw - a.scoreRaw);

        const topScore = results[0]?.scoreRaw || 1;
        results.forEach(r => {
            const relativeToTop = Math.min(100, Math.round((r.scoreRaw / topScore) * 100));
            const absoluteFloor = Math.min(100, Math.round((r.scoreRaw / 60) * 100));
            r.score = Math.min(relativeToTop, absoluteFloor);
        });

        return results;
    }

    global.EscSearch = {
        normalize,
        tokenize,
        expandWithSynonyms,
        buildIndex,
        searchEscalation,
        STOPWORDS,
        SHORT_TOKENS_KEPT,
        SYNONYMS
    };
})(typeof window !== 'undefined' ? window : globalThis);
