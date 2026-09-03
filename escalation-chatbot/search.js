/*! Copyright (c) 2026 Christian Anelka. All rights reserved. Proprietary - see LICENSE. */
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
        'dibantukan', 'mohonkan', 'minimalisir', 'segera', 'kira', 'apakah',
        'tolong', 'bisa', 'bantu', 'minta', 'mohon', 'mohonkan', 'supaya', 'agar',
        'agar', 'biar', 'biarlah', 'makanya', 'sehingga', 'sampai', 'hingga',
        'sampai', 'hingga', 'sampai', 'sampai', 'hingga', 'sampai', 'sampai', 'hingga',
        'adapun', 'terutama', 'khususnya', 'umumnya', 'seluruh', 'sebagian',
        'sebagian', 'beberapa', 'banyak', 'sedikit', 'lebih', 'paling', 'amat',
        'sangat', 'sekali', 'terlalu', 'cukup', 'agak', 'sedikit', 'tipis',
        'kurang', 'tidak', 'bukan', 'belum', 'jangan', 'usah', 'tak', 'tiada',
        'tanpa', 'minus', 'nol', 'kosong', 'lenyap', 'sia-sia', 'percuma',
        'buang', 'sia-sia', 'sia', 'percuma', 'buang', 'sia-sia', 'sia', 'percuma',
        'setidaknya', 'minimal', 'maksimal', 'idealnya', 'seharusnya', 'sebaiknya',
        'sepatutnya', 'sewajibnya', 'semestinya', 'seharusnya', 'sepatutnya',
        'tentu', 'pasti', 'mesti', 'wajib', 'harus', 'perlu', 'musti', 'pantas',
        'patut', 'layak', 'selayaknya', 'sepantasnya', 'sewajarnya', 'sepatutnya',
        'biasanya', 'umumnya', 'kebanyakan', 'rata-rata', 'pada umumnya',
        'misalnya', 'contohnya', 'seperti', 'ibarat', 'laksana', 'bagai',
        'seumpama', 'umpamanya', 'andai', 'sekiranya', 'jikalau', 'apabila',
        'seandainya', 'seumpamanya', 'misalkan', 'andaikan', 'andai kata',
        'kiranya', 'barangkali', 'mungkin', 'mungkin saja', 'sepertinya',
        'nampaknya', 'kelihatannya', 'tampaknya', 'katanya', 'kabarnya',
        'beritanya', 'khabarnya', 'konon', 'katanya', 'kabarnya', 'khabarnya',
        'tentu', 'pasti', 'mesti', 'wajib', 'harus', 'perlu', 'musti', 'pantas',
        'patut', 'layak', 'selayaknya', 'sepantasnya', 'sewajarnya', 'sepatutnya',
        'benar', 'salah', 'tepat', 'keliru', 'sesuai', 'tidak sesuai', 'tidak tepat',
        'kurang tepat', 'hampir tepat', 'mendekati', 'mendekati kebenaran',
        'paling benar', 'paling tepat', 'paling sesuai', 'paling pas', 'paling cocok',
        'sudah', 'telah', 'pernah', 'akan', 'sedang', 'tengah', 'lagi', 'masih',
        'belum', 'antara', 'bersama', 'bersama-sama', 'sendiri', 'masing-masing',
        'tiap-tiap', 'setiap', 'seluruh', 'semua', 'keseluruhan', 'total', 'keseluruhan',
        'sebagian', 'separuh', 'separuhnya', 'sebagian', 'beberapa', 'kira-kira',
        'lebih kurang', 'kurang lebih', 'sekitar', 'seputar', 'mengenai', 'perihal',
        'terkait', 'berhubungan', 'berkenaan', 'tentang', 'hal', 'soal', 'masalah',
        'urusan', 'persoalan', 'topik', 'subjek', 'tema', 'isu', 'berita', 'informasi',
        'data', 'fakta', 'bukti', 'dasar', 'landasan', 'acuan', 'rujukan', 'referensi',
        'sumber', 'asal', 'mulai', 'berasal', 'datang', 'berasal dari', 'datang dari',
        'menuju', 'arah', 'tujuan', 'target', 'sasaran', 'arahan', 'arah ke',
        'dekat', 'jauh', 'tinggi', 'rendah', 'besar', 'kecil', 'panjang', 'pendek',
        'lebar', 'sempit', 'tebal', 'tipis', 'berat', 'ringan', 'keras', 'lunak',
        'kasar', 'halus', 'tajam', 'tumpul', 'panas', 'dingin', 'hangat', 'sejuk',
        'terang', 'gelap', 'cerah', 'redup', 'suram', 'terang benderang', 'gelap gulita',
        'bersih', 'kotor', 'rapi', 'berantakan', 'teratur', 'acak', 'sistematis',
        'terstruktur', 'terorganisir', 'terencana', 'terencana dengan baik',
        'efektif', 'efisien', 'optimal', 'maksimal', 'minimal', 'standar', 'biasa',
        'luar biasa', 'istimewa', 'khusus', 'umum', 'spesifik', 'detail', 'ringkas',
        'singkat', 'panjang lebar', 'berkali-kali', 'sekali', 'dua kali', 'tiga kali',
        'beberapa kali', 'sering', 'jarang', 'kadang-kadang', 'sesekali', 'selalu',
        'tiap saat', 'kapan saja', 'setiap saat', 'sepanjang waktu', 'sepanjang hari',
        'sepanjang minggu', 'sepanjang bulan', 'sepanjang tahun', 'sepanjang masa',
        'sejak', 'mulai dari', 'sampai dengan', 'hingga', 'sampai', 'sampai sekarang',
        'sampai saat ini', 'sampai hari ini', 'sampai minggu ini', 'sampai bulan ini',
        'sampai tahun ini', 'sampai sekarang', 'sampai saat ini', 'sampai hari ini',
        'sebelumnya', 'sebelum', 'sesudah', 'sesudahnya', 'setelah', 'setelahnya',
        'sementara', 'selagi', 'sambil', 'sekaligus', 'bersamaan', 'bersama-sama',
        'secara bersamaan', 'bersamaan dengan', 'berbarengan', 'berbarengan dengan',
        'serentak', 'bersamaan', 'bersamaan dengan', 'berbarengan', 'berbarengan dengan',
        'langsung', 'segera', 'cepat', 'kilat', 'tiba-tiba', 'mendadak', 'secepatnya',
        'secepat mungkin', 'secepat-cepatnya', 'secepatnya', 'secepat-cepatnya',
        'pelan-pelan', 'perlahan-lahan', 'bertahap', 'bertahap', 'berangsur-angsur',
        'sedikit demi sedikit', 'pelan-pelan', 'perlahan-lahan', 'bertahap', 'bertahap',
        'berangsur-angsur', 'sedikit demi sedikit', 'pelan-pelan', 'perlahan-lahan',
        'sangat', 'amat', 'sekali', 'paling', 'sungguh', 'benar-benar', 'sesungguhnya',
        'sebenarnya', 'pada hakikatnya', 'pada dasarnya', 'pada prinsipnya',
        'khususnya', 'terutama', 'khusus', 'umumnya', 'pada umumnya', 'kebanyakan',
        'rata-rata', 'pada umumnya', 'khususnya', 'terutama', 'khusus',
        'tentu', 'pasti', 'mesti', 'wajib', 'harus', 'perlu', 'musti', 'pantas',
        'patut', 'layak', 'selayaknya', 'sepantasnya', 'sewajarnya', 'sepatutnya',
        'benar', 'salah', 'tepat', 'keliru', 'sesuai', 'tidak sesuai', 'tidak tepat',
        'kurang tepat', 'hampir tepat', 'mendekati', 'mendekati kebenaran',
        'paling benar', 'paling tepat', 'paling sesuai', 'paling pas', 'paling cocok'
    ]);

    const SHORT_TOKENS_KEPT = new Set([
        'iot', 'mec', 'sim', 'cdr', 'puk', 'apn', 'sms', 'cug', 'hlr', 'ocs',
        'b2b', 'va', 'tv', 'ip', 'dns', 'am', 'pdf', 'cs', 'ces', 'lba', 'bcp',
        'scv', 'tdc', 'usim', 'esim', 'volte', 'gprs', 'lte', 'nbp'
    ]);

    const ABBREVIATIONS = {
        'tsel': 'telkomsel',
        't-sel': 'telkomsel',
        'ml': 'mobile',
        'ea': 'enterprise access',
        'mec': 'my enterprise care',
        'psb': 'provisioning',
        'rem': 'remove',
        'rea': 'reactivation',
        'cho': 'change ownership',
        'reactiv': 'reaktivasi',
        'flt': 'fault',
        'nrc': 'non recurring charge',
        'rc': 'recurring charge',
        'bltf': 'balance transfer',
        'iccid': 'iccid',
        'sn': 'serial number',
        'ppn': 'pajak pertambahan nilai',
        'vat': 'pajak pertambahan nilai',
        'corporate': 'enterprise',
        'consumer': 'retail',
        'b2b': 'business to business',
        'b2c': 'business to consumer',
        'b2b2c': 'business to business to consumer',
        'iot': 'internet of things',
        'm2m': 'machine to machine',
        'fr': 'freedom ring',
        'dsc': 'device service center',
        'fa': 'faktur',
        'ifree': 'ifree',
        'mytsel': 'my telkomsel',
        'wa': 'whatsapp',
        'linkaja': 'linkaja e-wallet',
        'cl': 'collection',
        'cls': 'credit limit service',
        'co': 'change ownership',
        'hss': 'home subscriber server',
        'ki': 'ki',
        'puk': 'puk code',
        'apn': 'access point name',
        'dns': 'domain name system',
        'ip': 'internet protocol',
        'vpn': 'virtual private network',
        'lan': 'local area network',
        'wan': 'wide area network',
        'wifi': 'wireless fidelity',
        'lte': 'long term evolution',
        'volte': 'voice over lte',
        'sms': 'short message service',
        'ussd': 'unstructured supplementary service data',
        'gprs': 'general packet radio service',
        'cdr': 'call detail record',
        'hlr': 'home location register',
        'vkr': 'visitor location register',
        'ocs': 'online charging system',
        'pcs': 'postpaid charging system',
        'in': 'intelligent network',
        'mpp': 'mass market prepaid',
        'scv': 'single customer view',
        'tdc': 'telkomsel data center',
        'nbp': 'new billing platform',
        'crm': 'customer relationship management',
        'erp': 'enterprise resource planning',
        'sla': 'service level agreement',
        'kpi': 'key performance indicator',
        'okp': 'outage key performance',
        'rf': 'radio frequency',
        'bts': 'base transceiver station',
        'ran': 'radio access network',
        'core': 'core network',
        'transport': 'transport network',
        'backhaul': 'backhaul network',
        'access': 'access network',
        'distribution': 'distribution network',
        'last mile': 'last mile network',
        'fiber': 'fiber optic',
        'copper': 'copper wire',
        'microwave': 'microwave link',
        'satellite': 'satellite link',
        'subsea': 'submarine cable',
        'terrestrial': 'terrestrial cable',
        'backbone': 'backbone network',
        'edge': 'edge computing',
        'cloud': 'cloud computing',
        'datacenter': 'data center',
        'colocation': 'colocation facility',
        'hosting': 'hosting service',
        'domain': 'domain name',
        'ssl': 'secure sockets layer',
        'tls': 'transport layer security',
        'cert': 'certificate',
        'key': 'encryption key',
        'token': 'authentication token',
        'session': 'user session',
        'cookie': 'browser cookie',
        'cache': 'cache memory',
        'cdn': 'content delivery network',
        'load balancer': 'load balancer',
        'firewall': 'firewall',
        'ids': 'intrusion detection system',
        'ips': 'intrusion prevention system',
        'siem': 'security information and event management',
        'soc': 'security operations center',
        'mfa': 'multi factor authentication',
        'sso': 'single sign on',
        'rbac': 'role based access control',
        'acl': 'access control list',
        'api': 'application programming interface',
        'rest': 'representational state transfer',
        'soap': 'simple object access protocol',
        'graphql': 'graph query language',
        'webhook': 'webhook',
        'callback': 'callback url',
        'oauth': 'open authorization',
        'jwt': 'json web token',
        'saml': 'security assertion markup language',
        'openid': 'openid connect',
        'ldap': 'lightweight directory access protocol',
        'ad': 'active directory',
        'dhcp': 'dynamic host configuration protocol',
        'nat': 'network address translation',
        'pat': 'port address translation',
        'vlan': 'virtual local area network',
        'vxlan': 'virtual extensible local area network',
        'mpls': 'multi protocol label switching',
        'sdn': 'software defined networking',
        'nfv': 'network function virtualization',
        'man': 'metropolitan area network',
        'pan': 'personal area network',
        'can': 'campus area network',
        'gan': 'global area network',
        'san': 'storage area network',
        'vpc': 'virtual private cloud',
        'vdc': 'virtual data center',
        'iaas': 'infrastructure as a service',
        'paas': 'platform as a service',
        'saas': 'software as a service',
        'caas': 'container as a service',
        'faas': 'function as a service',
        'baas': 'backend as a service',
        'daas': 'desktop as a service',
        'draas': 'disaster recovery as a service',
        'maas': 'monitoring as a service',
        'caaas': 'communication as a service',
        'bpaas': 'business process as a service',
        'dbaas': 'database as a service',
        'straas': 'storage as a service',
        'neaas': 'network as a service',
        'seaas': 'security as a service',
        'traas': 'testing as a service',
        'qaaas': 'quality assurance as a service',
        'secops': 'security operations',
        'devops': 'development operations',
        'netops': 'network operations',
        'cloudops': 'cloud operations',
        'dataops': 'data operations',
        'mlops': 'machine learning operations',
        'relops': 'reliability operations',
        'sre': 'site reliability engineering',
        'chaos': 'chaos engineering',
        'observability': 'observability',
        'monitoring': 'monitoring',
        'logging': 'logging',
        'tracing': 'tracing',
        'profiling': 'profiling',
        'debugging': 'debugging',
        'testing': 'testing',
        'automation': 'automation',
        'orchestration': 'orchestration',
        'containerization': 'containerization',
        'virtualization': 'virtualization',
        'microservices': 'microservices',
        'monolith': 'monolithic architecture',
        'serverless': 'serverless computing',
        'fog': 'fog computing',
        'mist': 'mist computing',
        'quantum': 'quantum computing',
        'neuromorphic': 'neuromorphic computing',
        'photonic': 'photonic computing',
        'optical': 'optical computing',
        'biological': 'biological computing',
        'molecular': 'molecular computing',
        'dna': 'dna computing',
        'topological': 'topological computing',
        'adiabatic': 'adiabatic quantum computing',
        'trapped ion': 'trapped ion quantum computing',
        'superconducting': 'superconducting quantum computing',
        'spin': 'spin qubit quantum computing'
    };

    function expandAbbreviations(tokens) {
        const expanded = [];
        tokens.forEach(t => {
            expanded.push(t);
            const full = ABBREVIATIONS[t];
            if (full && !tokens.includes(full)) {
                expanded.push(full);
                // ponytail: split multi-word expansions so each word can match independently
                full.split(/\s+/).forEach(w => {
                    if (!expanded.includes(w)) expanded.push(w);
                });
            }
        });
        return expanded;
    }

    const SYNONYMS = {
        // Billing & Payment
        'billing': ['tagihan', 'ebill', 'invoice', 'faktur', 'charge', 'bill'],
        'tagihan': ['billing', 'ebill', 'invoice', 'faktur', 'charge', 'bill'],
        'ebill': ['billing', 'tagihan', 'invoice'],
        'invoice': ['tagihan', 'billing', 'faktur'],
        'pembayaran': ['bayar', 'payment', 'bookpayment', 'pay'],
        'bayar': ['pembayaran', 'payment', 'pay'],
        'pajak': ['tax', 'ppn', 'faktur'],
        'charge': ['tagihan', 'billing', 'potong'],
        
        // SIM & Kartu
        'sim': ['simcard', 'kartu', 'usim'],
        'simcard': ['sim', 'kartu', 'usim'],
        'kartu': ['sim', 'simcard', 'usim'],
        'usim': ['sim', 'simcard', 'kartu'],
        
        // Ownership & Transfer
        'mutasi': ['ganti', 'kepemilikan', 'transfer', 'pindah', 'change ownership'],
        'ganti': ['mutasi', 'tukar', 'kepemilikan', 'ubah', 'change ownership', 'perubahan profile', 'ganti nama'],
        'ganti nama': ['change ownership', 'perubahan profile', 'ganti kepemilikan', 'mutasi'],
        'kepemilikan': ['mutasi', 'ganti', 'transfer', 'change ownership', 'perubahan profile'],
        'transfer': ['mutasi', 'pindah', 'pemindahan'],
        'nama': ['name', 'profile', 'perubahan profile', 'perubahan nama'],
        'pemilik': ['kepemilikan', 'ownership', 'ganti kepemilikan'],
        'dipakai': ['pakai', 'gunakan', 'use', 'digunakan'],
        'nomor': ['msisdn', 'number', 'nomor telepon'],
        
        // Termination & Deactivation
        'berhenti': ['terminasi', 'deaktivasi', 'stop', 'cabut', 'cancel', 'nonaktif', 'berhenti berlangganan'],
        'terminasi': ['berhenti', 'deaktivasi', 'stop', 'cabut', 'nonaktif', 'berhenti berlangganan', 'terminate'],
        'deaktivasi': ['berhenti', 'terminasi', 'stop', 'cabut', 'nonaktifkan', 'disable'],
        'nonaktif': ['deaktivasi', 'berhenti', 'terminasi', 'disable', 'remove'],
        'berhenti langganan': ['terminasi', 'berhenti berlangganan', 'stop', 'terminate', 'cabut'],
        'berhenti berlangganan': ['terminasi', 'berhenti langganan', 'stop', 'terminate', 'cabut'],
        'langganan': ['berlangganan', 'subscribe', 'terminasi', 'berhenti berlangganan'],
        'suspend': ['freeze', 'block', 'nonaktif', 'disabled', 'beku'],
        'freeze': ['suspend', 'block', 'nonaktif', 'beku', 'bekukan'],
        
        // Reactivation & Activation
        'reaktivasi': ['aktivasi', 'renewal', 'refresh', 'aktifkan', 'aktifkan kembali', 'reactivasi', 're-aktivasi', 'renew'],
        'aktifkan kembali': ['reaktivasi', 'renewal', 'refresh', 'reactivasi', 're-aktivasi', 'aktifkan'],
        'aktivasi': ['activation', 'aktifkan', 'enable', 'aktif'],
        'aktifkan': ['aktivasi', 'activation', 'enable'],
        'resume': ['aktifkan', 'enable', 'activate', 'restore', 'aktif'],
        
        // Quota & Package
        'kuota': ['quota', 'paket', 'data', 'volume'],
        'paket': ['package', 'bundle', 'kuota', 'plan'],
        'bonus': ['ekstra', 'tambahan', 'kuota', 'gratis'],
        'flash': ['ekstra', 'tambahan', 'bonus'],
        'ekstra': ['flash', 'tambahan', 'bonus'],
        
        // Errors & Issues
        'gagal': ['error', 'fail', 'failed', 'tidak', 'eror'],
        'error': ['gagal', 'fail', 'failed', 'eror'],
        'eror': ['error', 'gagal', 'fail'],
        'masalah': ['gangguan', 'trouble', 'problem', 'issue', 'keluhan'],
        'gangguan': ['trouble', 'masalah', 'problem', 'issue'],
        'problem': ['masalah', 'gangguan', 'trouble', 'issue'],
        'issue': ['masalah', 'gangguan', 'trouble', 'problem'],
        'trouble': ['gangguan', 'masalah', 'problem', 'issue'],
        
        // Speed & Performance
        'lemot': ['lambat', 'slow', 'loading', 'lama', 'lemah'],
        'lambat': ['lemot', 'slow', 'loading', 'lama'],
        'slow': ['lambat', 'lemot', 'lama'],
        'cepat': ['fast', 'kilat', 'instan'],
        
        // Connection & Signal
        'sinyal': ['signal', 'network', 'jaringan', 'cover'],
        'network': ['sinyal', 'jaringan', 'net'],
        'jaringan': ['network', 'sinyal', 'net'],
        'koneksi': ['connectivity', 'connection', 'sambung'],
        'connectivity': ['konektivitas', 'koneksi', 'connection'],
        'blank': ['kosong', 'empty', 'tidak muncul', 'hilang'],
        'putus': ['disconnect', 'lost', 'terputus', 'disconnect'],
        
        // Login & Access
        'login': ['masuk', 'akses', 'signin', 'log in'],
        'masuk': ['login', 'akses', 'signin'],
        'akses': ['login', 'masuk', 'access', 'buka'],
        'diakses': ['akses', 'login', 'buka'],
        'mengakses': ['akses', 'login', 'buka'],
        'blokir': ['block', 'blacklist', 'restrict', 'larang'],
        'blacklist': ['blokir', 'block', 'restrict'],
        'whitelist': ['allow', 'izinkan', 'unblock'],
        
        // Roaming
        'roaming': ['roamax', 'roam', 'luar negeri'],
        'roamax': ['roaming', 'roam'],
        
        // Products & Services
        'corporate': ['corp', 'perusahaan', 'enterprise', 'bisnis'],
        'consumer': ['cons', 'retail', 'pribadi', 'perorangan'],
        'enterprise': ['myenterprise', 'mec', 'corporate', 'bisnis'],
        'mec': ['myenterprise', 'enterprise', 'my enterprise care'],
        'myenterprise': ['mec', 'enterprise'],
        'orbit': ['b2b2c', 'home'],
        'b2b2c': ['mepro', 'orbit'],
        'mepro': ['b2b2c'],
        
        // IoT & M2M
        'iot': ['cmp', 'aeris', 'm2m', 'device'],
        
        // Communication
        'cug': ['teamplan', 'group'],
        'teamplan': ['cug', 'group'],
        'chatgpt': ['gpt', 'chat', 'ai'],
        'gpt': ['chatgpt', 'chat', 'ai'],
        'zoom': ['video', 'meeting', 'conference'],
        'whatsapp': ['wa', 'chat'],
        'video': ['layanan', 'digital', 'streaming'],
        'streaming': ['layanan', 'digital', 'video'],
        
        // Digital Services
        'prime': ['layanan', 'digital', 'video', 'amazon'],
        'netflix': ['layanan', 'digital', 'streaming', 'video'],
        'spotify': ['layanan', 'digital', 'musik', 'music'],
        'youtube': ['layanan', 'digital', 'video'],
        'disney': ['layanan', 'digital', 'streaming', 'video'],
        
        // Actions
        'inject': ['topup', 'tambah', 'isi', 'add'],
        'topup': ['inject', 'isi', 'tambah', 'top', 'add'],
        'tambah': ['add', 'insert', 'inject', 'topup'],
        'kurang': ['reduce', 'subtract', 'remove', 'hapus'],
        'hapus': ['delete', 'remove', 'buang', 'hilangkan'],
        'ubah': ['change', 'modify', 'update', 'edit', 'ganti'],
        'update': ['ubah', 'change', 'modify', 'edit'],
        'ganti': ['change', 'replace', 'tukar', 'ubah'],
        'reset': ['ubah', 'restore', 'ulang'],
        'ulang': ['repeat', 'repeat', 'lagi'],
        'repeat': ['ulang', 'kembali', 'lagi'],
        
        // Status
        'complete': ['selesai', 'completed', 'done', 'finish'],
        'selesai': ['complete', 'done', 'finish', 'tuntas'],
        'proses': ['processing', 'process', 'jalan', 'berjalan'],
        'pending': ['tunda', 'tunggu', 'waiting', 'dalam proses'],
        
        // Order & Request
        'order': ['pesanan', 'permintaan', 'request', 'orderan'],
        'pesanan': ['order', 'permintaan', 'request'],
        'permintaan': ['order', 'request', 'pesan'],
        
        // Profile & Data
        'profile': ['profil', 'data', 'informasi', 'info'],
        'profil': ['profile', 'data', 'informasi'],
        'informasi': ['info', 'data', 'detail'],
        
        // Limits
        'limit': ['batas', 'plafon', 'maksimum'],
        'batas': ['limit', 'plafon', 'maximum'],
        
        // Fitur & Layanan
        'fitur': ['feature', 'layanan', 'fungsi'],
        'layanan': ['service', 'fitur', 'services'],
        'service': ['layanan', 'servis'],
        
        // Voice & Call
        'volte': ['voice', 'call', 'panggilan'],
        'voice': ['volte', 'call', 'suara'],
        
        // Network Issues
        'down': ['mati', 'tidak aktif', 'nonaktif', 'error'],
        'mati': ['down', 'tidak aktif', 'nonaktif'],
        'timeout': ['habis waktu', 'expire', 'expired'],
        'expire': ['timeout', 'habis waktu', 'kedaluwarsa'],
        
        // Common Verbs
        'cek': ['check', 'lihat', 'verify', 'verifikasi'],
        'lihat': ['cek', 'check', 'view', 'show'],
        'tanya': ['ask', 'question', 'tanyakan'],
        'bantu': ['help', 'assist', 'tolong'],
        'tolong': ['help', 'bantu', 'assist'],
        
        // Adjectives
        'berhasil': ['success', 'sukses', 'ok', 'done'],
        'gagal': ['fail', 'failed', 'error', 'tidak berhasil'],
        'tidak': ['no', 'not', 'bukan', 'invalid'],
        'valid': ['benar', 'correct', 'ok'],
        'invalid': ['salah', 'wrong', 'tidak valid'],
        
        // Common Abbreviations
        'tsel': ['telkomsel', 'telkom', 't-sel'],
        'telkomsel': ['tsel', 'telkom', 't-sel'],
        'psb': ['provisioning', 'order', 'pendaftaran'],
        'flt': ['fault', 'gangguan', 'masalah'],
        'nrc': ['non recurring charge', 'biaya satu kali'],
        'rc': ['recurring charge', 'biaya berulang'],
        
        // Package Types
        'internet': ['data', 'kuota', 'online', 'web'],
        'telepon': ['call', 'voice', 'panggilan', 'telp'],
        'sms': ['message', 'pesan', 'text'],
        'email': ['mail', 'surat', 'surel'],
        
        // Common Issues
        'tidak bisa': ['gagal', 'error', 'unable', 'cannot'],
        'tidak muncul': ['blank', 'kosong', 'missing', 'hilang'],
        'tidak masuk': ['gagal', 'error', 'tidak diterima'],
        'tidak terkirim': ['gagal kirim', 'failed', 'error'],
        'tidak diterima': ['gagal terima', 'missing', 'hilang'],
        
        // Escalation
        'ces': ['eskalasi', 'escalation', 'eskalasi'],
        'eskalasi': ['escalation', 'ces', 'escalate'],
        
        // Common Patterns
        'lupa': ['forgot', 'forgot password', 'lupa password'],
        'password': ['sandi', 'kata sandi', 'pass'],
        'pin': ['kode', 'code', 'nomor pin'],
        
        // Status Words
        'aktif': ['active', 'enabled', 'on'],
        'nonaktif': ['inactive', 'disabled', 'off'],
        'tertunda': ['pending', 'waiting', 'tunggu'],
        'berjalan': ['running', 'process', 'proses'],
        
        // Common Actions
        'kirim': ['send', 'submit', 'kirimkan'],
        'terima': ['receive', 'dapatkan', 'received'],
        'simpan': ['save', 'store', 'kept'],
        'unduh': ['download', 'unduh'],
        'unggah': ['upload', 'kirim file'],
        
        // Device & Tech
        'ponsel': ['hp', 'handphone', 'mobile', 'phone'],
        'hp': ['ponsel', 'handphone', 'mobile', 'phone'],
        'komputer': ['pc', 'computer', 'laptop'],
        'pc': ['komputer', 'computer'],
        
        // Common Phrases
        'tidak sesuai': ['salah', 'wrong', 'mismatch', 'berbeda'],
        'sesuai': ['correct', 'match', 'cocok', 'benar'],
        'cocok': ['match', 'sesuai', 'correct', 'pas'],
        'freedom ring': ['fr', 'freedom', 'fr kuota', 'fr unlimited', 'fr internet'],
        'fr': ['freedom ring', 'freedom', 'fr kuota'],
        'preload': ['preload kuota', 'inject kuota', 'kuota preload', 'preload data'],
        'inject kuota': ['preload', 'inject', 'tambah kuota', 'topup kuota'],
        'ifree': ['ifree sms', 'ifree 100 sms', 'ifree sms 100', 'sms ifree'],
        'ifree sms': ['ifree', 'sms gratis', 'sms ifree'],
        'linkaja': ['linkaja e-wallet', 'e-wallet linkaja', 'linkaja payment', 'bayar linkaja'],
        'e-wallet linkaja': ['linkaja', 'linkaja e-wallet', 'e-wallet'],
        'ekstra kuota': ['kuota ekstra', 'bonus kuota', 'tambahan kuota', 'flash kuota', 'extra quota'],
        'flash corporate': ['flash corp', 'corporate flash', 'fc', 'flash corp'],
        'teamplan': ['cug', 'team plan', 'cug team', 'teamplan cug'],
        'cug': ['teamplan', 'team plan', 'cug team'],
        'dsc': ['dsc order', 'device service center', 'dsc gagal', 'dsc failed'],
        'order failed': ['gagal order', 'psb failed', 'order gagal', 'failed order', 'psb order failed'],
        'psb': ['provisioning', 'psb order', 'order psb', 'proses psb'],
        'reestablished': ['reestablished gagal', 'reestablish failed', 'reconnect', 'reestablish'],
        'mytsel': ['my telkomsel', 'mytsel', 'myt'],
        'mytelkomsel': ['mytsel', 'my telkomsel', 'my tsel'],
        'indihome': ['indihome fiber', 'ind home', 'indi'],
        'myads': ['my ads', 'telkomsel myads', 'ads'],
        'in-car': ['in car wifi', 'in-car wifi', 'incar', 'in car connectivity'],
        'in-car wifi': ['in-car', 'in car', 'car wifi', 'in car connectivity'],
        'centrin': ['centrin inet', 'centrin internet', 'centrin wifi'],
        'tagihan fa': ['fa tagihan', 'faktur', 'faktur pajak', 'fa billing'],
        'faktur pajak': ['tagihan fa', 'fa tagihan', 'faktur', 'invoice pajak'],
        'virtual account': ['va', 'ganti va', 'virtual acct', 'va payment'],
        'ganti va': ['change va', 'virtual account ganti', 'replace va', 'ubah va'],
        'blokir': ['block', 'blocked', 'terblokir', 'collection', 'kena blokir'],
        'collection': ['blokir', 'blocked', 'kena collection', 'terblokir collection'],
        'migrasi': ['migration', 'pindah', 'migrate', 'migrasi prabayar', 'migrasi pascabayar'],
        'prabayar': ['prepaid', 'prepaid corporate', 'top up prepaid'],
        'pascabayar': ['postpaid', 'halo', 'halo corporate'],
        'halo': ['pascabayar', 'postpaid', 'halo corporate'],
        'refund': ['pengembalian', 'return', 'uang kembali', 'refund dana'],
        'adjustment': ['penyesuaian', 'sesuaikan', 'adjust', 'perubahan nominal'],
        'bookpayment': ['book payment', 'pembayaran booking', 'booking pembayaran'],
        'cdr': ['call detail record', 'detail rekaman panggilan', 'call record'],
        'billing cycle': ['bc', 'siklus tagihan', 'cycle billing', 'billing period'],
        'limit domestik': ['domestic limit', 'limit dalam negeri', 'cls'],
        'informatika': ['informasi', 'info', 'data'],
        'tertunda': ['pending', 'waiting', 'tunggu', 'proses tertunda'],
        'berjalan': ['running', 'process', 'proses', 'sedang berjalan'],
        'inject': ['topup', 'tambah', 'isi', 'add', 'inject kuota', 'top up'],
        'topup': ['inject', 'isi', 'tambah', 'top up', 'add'],
        'tambah': ['add', 'insert', 'inject', 'topup', 'top up'],
        'kurang': ['reduce', 'subtract', 'remove', 'hapus', 'kurangi'],
        'hapus': ['delete', 'remove', 'buang', 'hilangkan', 'hapus paket'],
        'ubah': ['change', 'modify', 'update', 'edit', 'ganti', 'perubahan'],
        'update': ['ubah', 'change', 'modify', 'edit', 'perubahan'],
        'ganti': ['change', 'replace', 'tukar', 'ubah', 'perubahan', 'ganti nama'],
        'reset': ['ubah', 'restore', 'ulang', 'reset password', 'reset pin'],
        'ulang': ['repeat', 'repeat', 'lagi', 'ulang lagi'],
        'repeat': ['ulang', 'kembali', 'lagi', 'repeat order'],
        'complete': ['selesai', 'completed', 'done', 'finish', 'tuntas'],
        'selesai': ['complete', 'done', 'finish', 'tuntas', 'telah selesai'],
        'proses': ['processing', 'process', 'jalan', 'berjalan', 'sedang proses'],
        'pending': ['tunda', 'tunggu', 'waiting', 'dalam proses', 'tertunda'],
        'order': ['pesanan', 'permintaan', 'request', 'orderan', 'pemesanan'],
        'pesanan': ['order', 'permintaan', 'request', 'orderan'],
        'permintaan': ['order', 'request', 'pesan', 'pengajuan'],
        'profile': ['profil', 'data', 'informasi', 'info', 'perubahan profile'],
        'profil': ['profile', 'data', 'informasi', 'perubahan profil'],
        'informasi': ['info', 'data', 'detail', 'keterangan'],
        'limit': ['batas', 'plafon', 'maksimum', 'limit penggunaan'],
        'batas': ['limit', 'plafon', 'maximum', 'limit penggunaan'],
        'fitur': ['feature', 'layanan', 'fungsi', 'fitur hlr'],
        'layanan': ['service', 'fitur', 'services', 'layanan digital'],
        'service': ['layanan', 'servis', 'services'],
        'volte': ['voice', 'call', 'panggilan', 'voice over lte', 'hd voice'],
        'voice': ['volte', 'call', 'suara', 'panggilan'],
        'down': ['mati', 'tidak aktif', 'nonaktif', 'error', 'down server'],
        'mati': ['down', 'tidak aktif', 'nonaktif', 'mati server'],
        'timeout': ['habis waktu', 'expire', 'expired', 'waktu habis'],
        'expire': ['timeout', 'habis waktu', 'kedaluwarsa', 'masa aktif habis'],
        'cek': ['check', 'lihat', 'verify', 'verifikasi', 'pengecekan'],
        'lihat': ['cek', 'check', 'view', 'show', 'melihat'],
        'tanya': ['ask', 'question', 'tanyakan', 'bertanya'],
        'bantu': ['help', 'assist', 'tolong', 'membantu'],
        'tolong': ['help', 'bantu', 'assist', 'membantu'],
        'berhasil': ['success', 'sukses', 'ok', 'done', 'berhasil aktivasi'],
        'gagal': ['fail', 'failed', 'error', 'tidak berhasil', 'gagal aktivasi'],
        'tidak': ['no', 'not', 'bukan', 'invalid', 'tidak bisa'],
        'valid': ['benar', 'correct', 'ok', 'valid data'],
        'invalid': ['salah', 'wrong', 'tidak valid', 'data invalid'],
        'tsel': ['telkomsel', 'telkom', 't-sel', 'telkomsel group'],
        'telkomsel': ['tsel', 'telkom', 't-sel', 'telkomsel group'],
        'internet': ['data', 'kuota', 'online', 'web', 'internet包'],
        'telepon': ['call', 'voice', 'panggilan', 'telp', 'telepon seluler'],
        'sms': ['message', 'pesan', 'text', 'sms service'],
        'email': ['mail', 'surat', 'surel', 'email service'],
        'tidak bisa': ['gagal', 'error', 'unable', 'cannot', 'tidak dapat'],
        'tidak muncul': ['blank', 'kosong', 'missing', 'hilang', 'tidak tampil'],
        'tidak masuk': ['gagal', 'error', 'tidak diterima', 'tidak sampai'],
        'tidak terkirim': ['gagal kirim', 'failed', 'error', 'gagal mengirim'],
        'tidak diterima': ['gagal terima', 'missing', 'hilang', 'tidak sampai'],
        'ces': ['eskalasi', 'escalation', 'eskalasi', 'customer escalation'],
        'eskalasi': ['escalation', 'ces', 'escalate', 'customer escalation'],
        'lupa': ['forgot', 'forgot password', 'lupa password', 'lupa pin'],
        'password': ['sandi', 'kata sandi', 'pass', 'kata kunci'],
        'pin': ['kode', 'code', 'nomor pin', 'pin code'],
        'aktif': ['active', 'enabled', 'on', 'sedang aktif'],
        'nonaktif': ['inactive', 'disabled', 'off', 'tidak aktif'],
        'kirim': ['send', 'submit', 'kirimkan', 'mengirim'],
        'terima': ['receive', 'dapatkan', 'received', 'menerima'],
        'simpan': ['save', 'store', 'kept', 'menyimpan'],
        'unduh': ['download', 'unduh', 'mengunduh'],
        'unggah': ['upload', 'kirim file', 'mengunggah'],
        'ponsel': ['hp', 'handphone', 'mobile', 'phone', 'smartphone'],
        'hp': ['ponsel', 'handphone', 'mobile', 'phone', 'smartphone'],
        'komputer': ['pc', 'computer', 'laptop', 'desktop'],
        'pc': ['komputer', 'computer', 'laptop'],
        'tidak sesuai': ['salah', 'wrong', 'mismatch', 'berbeda', 'tidak cocok'],
        'sesuai': ['correct', 'match', 'cocok', 'benar', 'sesuai data'],
        'cocok': ['match', 'sesuai', 'correct', 'pas', 'cocok data']
    };

    const GROUP_ROUTING_HINTS = [
        { keywords: ['add offer', 'open restric', 'open restrict', 'add offering', 'tambahkan paket', 'buka blokir'], groupMatch: 'UFO', boost: 90 },
        { keywords: ['aktivasi paket team', 'pengecekan nomor', 'pindah paket'], groupMatch: 'CUGCorporate', boost: 90 },
        { keywords: ['iccid', ' sn ', 'serial number', 'pengecekan iccid', 'cek iccid', 'informasi iccid'], groupMatch: 'Paradise', boost: 90 },
        { keywords: ['volte', 'voice over lte', 'panggilan 4g', 'hd voice'], groupMatch: 'UniprovPaceLayer', boost: 50 },
        { keywords: ['add psb', 'psb stuck', 'stuck order', 'order macet', 'proses stuck', 'order tidak bergerak', 'psb order', 'order failed', 'gagal order'], groupMatch: 'MyEnterpriseAccess', boost: 80 },
        { keywords: ['dsc', 'dsc order', 'dsc gagal', 'dsc failed', 'dsc mea', 'device service center'], groupMatch: 'DSC', boost: 120 },
        { keywords: ['parent child', 'parents child', 'parent-child', 'registrasi child', 'child member', 'hubungan parent', 'relasi parent'], groupMatch: 'CRMBE', boost: 80 },
        { keywords: ['sisa kuota', 'inject kuota', 'aod', 'remove paket', 'remove package', 'cek kuota', 'informasi kuota', 'kuota habis'], groupMatch: 'UPCC', boost: 100 },
        { keywords: ['remove paket', 'remove package', 'nonaktif paket', 'deactivate paket', 'cabut paket', 'deaktivasi paket'], groupMatch: 'MyEnterpriseAccess', boost: 100 },
        { keywords: ['reaktivasi', 'aktifkan kembali', 're-aktivasi', 'reactivasi', 'aktifkan lagi'], groupMatch: 'MyEnterpriseAccess', boost: 100 },
        { keywords: ['blacklist', 'whitelist', 'layanan google', 'blokir', 'daftar hitam', 'daftar putih'], groupMatch: 'iCharming', boost: 100 },
        { keywords: ['cek order proses', 'proses reaktivasi', 'perubahan billing status', 'change billing status', 'status order', 'proses order'], groupMatch: 'IoT CMP', boost: 80 },
        { keywords: ['gprs lock', 'gprs block', 'terminate gprs', 'nonaktif gprs', 'ubah order failed', 'order failed komplet', 'order failed ke komplet', 'failed ke komplet', 'gprs error', 'gprs bermasalah'], groupMatch: 'DSC', boost: 100 },
        { keywords: ['bltf', 'balance transfer', 'transfer balance'], groupMatch: 'MyEnterpriseAccess', boost: 100 },
        { keywords: ['flt', 'fault'], groupMatch: 'MyEnterpriseAccess', boost: 50 },
        { keywords: ['pembayaran', 'bayar', 'tagihan', 'invoice', 'pajak', 'ppn', 'faktur', 'charge', 'potong'], groupMatch: 'Billing', boost: 70 },
        { keywords: ['pelanggan', 'customer', 'data pelanggan', 'informasi pelanggan', 'profil pelanggan'], groupMatch: 'CRM', boost: 70 },
        { keywords: ['jaringan', 'network', 'sinyal', 'signal', 'coverage', 'area', 'lokasi'], groupMatch: 'Network', boost: 70 },
        { keywords: ['aplikasi', 'app', 'platform', 'sistem', 'tools', 'tool'], groupMatch: 'Platform', boost: 70 },
        { keywords: ['latihan', 'training', 'edukasi', 'pembelajaran', 'kursus', 'sertifikasi'], groupMatch: 'Training', boost: 70 },
        { keywords: ['freedom ring', 'fr kuota', 'fr unlimited', 'fr internet', 'fr gagal', 'fr failed'], groupMatch: 'Paradise', boost: 100 },
        { keywords: ['ifree', 'ifree sms', 'ifree 100 sms', 'sms ifree', 'add ifree'], groupMatch: 'iCharming', boost: 100 },
        { keywords: ['linkaja', 'linkaja e-wallet', 'e-wallet linkaja', 'bayar linkaja', 'linkaja payment'], groupMatch: 'PaymentGateway', boost: 100 },
        { keywords: ['preload', 'preload kuota', 'inject kuota preload', 'preload data'], groupMatch: 'UPCC', boost: 100 },
        { keywords: ['reestablished', 'reestablished gagal', 'reestablish failed', 'reconnect'], groupMatch: 'DSC', boost: 100 },
        { keywords: ['mytsel', 'my telkomsel', 'myt', 'myt login', 'mytsel login'], groupMatch: 'MyTsel', boost: 100 },
        { keywords: ['indihome', 'indihome fiber', 'indi', 'indihome iptv', 'indihome wifi'], groupMatch: 'IPTV Platform', boost: 100 },
        { keywords: ['myads', 'my ads', 'telkomsel myads', 'ads'], groupMatch: 'LBA', boost: 100 },
        { keywords: ['in-car', 'in car wifi', 'incar', 'in-car wifi', 'car wifi', 'in car connectivity'], groupMatch: 'In-Car Connectivity', boost: 100 },
        { keywords: ['ganti kartu hilang', 'kartu hilang', 'ganti usim', 'replace kartu', 'kartu hilang simcard', 'ganti simcard'], groupMatch: 'OCS', boost: 100 },
        { keywords: ['virtual account', 'va', 'ganti va', 'daftar va', 'delete va', 'hapus va'], groupMatch: 'PaymentGateway', boost: 100 },
        { keywords: ['tagihan fa', 'fa tagihan', 'faktur pajak', 'faktur'], groupMatch: 'MEVO', boost: 100 }
    ];

    const KIP_ROUTING_HINTS = [
        { keywords: ['prime video', 'netflix', 'spotify', 'disney', 'youtube premium', 'apple music', 'hbo', 'streaming', 'video on demand', 'vod'], kipMatch: 'layanan digital', boost: 150 },
        { keywords: ['chatgpt', 'chat gpt', 'openai', 'ai assistant', 'asisten ai', 'kecerdasan buatan'], kipMatch: 'chat gpt', boost: 150 },
        { keywords: ['zoom pro', 'zoom premium', 'zoom meeting', 'video conference', 'konferensi video'], kipMatch: 'zoom', boost: 150 },
        { keywords: ['microsoft 365', 'office 365', 'outlook', 'teams', 'word', 'excel', 'powerpoint'], kipMatch: 'microsoft', boost: 150 },
        { keywords: ['google workspace', 'gmail', 'google drive', 'google meet', 'google calendar'], kipMatch: 'google', boost: 150 },
        { keywords: ['aws', 'amazon web services', 'cloud', 'azure', 'google cloud', 'gcp'], kipMatch: 'cloud services', boost: 150 },
        { keywords: ['security', 'keamanan', 'firewall', 'antivirus', 'protection', 'perlindungan'], kipMatch: 'security', boost: 150 },
        { keywords: ['backup', 'restore', 'pencadangan', 'pemulihan', 'disaster recovery'], kipMatch: 'backup', boost: 150 },
        { keywords: ['monitoring', 'pemantauan', 'alert', 'notifikasi', 'alarm', 'warning'], kipMatch: 'monitoring', boost: 150 },
        { keywords: ['analytics', 'analitik', 'reporting', 'pelaporan', 'dashboard', 'grafik'], kipMatch: 'analytics', boost: 150 },
        { keywords: ['ganti va', 'ubah va', 'delete va', 'hapus va', 'reset va', 'replace va', 'daftar va'], kipMatch: 'Virtual Account', boost: 150 },
        { keywords: ['tagihan fa', 'faktur pajak', 'download faktur', 'invoice', 'cancel invoice'], kipMatch: 'faktur', boost: 150 },
        { keywords: ['remove paket', 'remove package', 'nonaktif paket', 'deactivate paket', 'cabut paket', 'deaktivasi paket'], kipMatch: 'Deaktivasi paket', boost: 150 },
        { keywords: ['reaktivasi', 'aktifkan kembali', 're-aktivasi', 'reactivasi', 'aktifkan lagi'], kipMatch: 'reaktivasi', boost: 150 }
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

    function extractPhrases(tokens) {
        const phrases = [];
        for (let n = 2; n <= Math.min(4, tokens.length); n++) {
            for (let i = 0; i <= tokens.length - n; i++) {
                phrases.push({ text: tokens.slice(i, i + n).join(' '), length: n });
            }
        }
        return phrases;
    }

    function levenshtein(a, b) {
        const m = a.length, n = b.length;
        const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                dp[i][j] = Math.min(
                    dp[i-1][j] + 1,
                    dp[i][j-1] + 1,
                    dp[i-1][j-1] + (a[i-1] !== b[j-1] ? 1 : 0)
                );
            }
        }
        return dp[m][n];
    }

    function fuzzyMatch(token, target, maxDistance) {
        if (!token || !target) return false;
        maxDistance = maxDistance || 2;
        if (token === target) return true;
        if (Math.abs(token.length - target.length) > maxDistance) return false;
        return levenshtein(token, target) <= maxDistance;
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
        const expandedTokens = expandAbbreviations(queryTokens);
        const newFromAbbr = expandedTokens.filter(t => !queryTokens.includes(t));
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

            expandedTokens.forEach(t => {
                if (queryTokens.includes(t)) return;
                const weight = (index.idf[t] || idfFloor) * 0.8;
                if (hasWord(kipNorm, t)) {
                    score += 16 * weight;
                    matched.add(t);
                } else if (hasWord(groupNorm, t)) {
                    score += 10 * weight;
                    matched.add(t);
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

            queryTokens.forEach(t => {
                if (matched.has(t)) return;
                const abbrExpanded = ABBREVIATIONS[t.toLowerCase()];
                const fuzzyMultiplier = abbrExpanded ? 0.1 : 0.3;
                const weight = (index.idf[t] || idfFloor) * fuzzyMultiplier;
                const kipTokens = kipNorm.split(' ');
                const groupTokens = groupNorm.split(' ');
                const kipMatch = kipTokens.some(kt => fuzzyMatch(t, kt, 2));
                const groupMatch = groupTokens.some(gt => fuzzyMatch(t, gt, 2));
                if (kipMatch) {
                    score += 6 * weight;
                    matched.add(t);
                } else if (groupMatch) {
                    score += 4 * weight;
                    matched.add(t);
                }
            });

            const queryPhrases = extractPhrases(queryTokens);
            queryPhrases.forEach(phrase => {
                const phraseBoost = phrase.length * 15;
                if (kipNorm.includes(phrase.text)) {
                    score += phraseBoost;
                    matched.add(phrase.text);
                } else if (groupNorm.includes(phrase.text)) {
                    score += phraseBoost * 0.6;
                    matched.add(phrase.text);
                }
            });

            if (queryTokens.length > 0) {
                let totalIdfWeight = 0;
                let matchedIdfWeight = 0;
                queryTokens.forEach(t => {
                    const weight = index.idf[t] || idfFloor;
                    totalIdfWeight += weight;
                    if (matched.has(t)) matchedIdfWeight += weight;
                });
                const coverageRatio = totalIdfWeight > 0 ? matchedIdfWeight / totalIdfWeight : 0;
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

        const deduplicatedMap = new Map();
        results.forEach(r => {
            const key = r.kip + '|' + r.hashtag;
            if (!deduplicatedMap.has(key)) {
                deduplicatedMap.set(key, r);
            } else {
                const existing = deduplicatedMap.get(key);
                if ((r.skala || 0) > (existing.skala || 0)) {
                    deduplicatedMap.set(key, r);
                }
            }
        });
        
        let finalResults = Array.from(deduplicatedMap.values());

        finalResults.sort((a, b) => {
            const diff = b.scoreRaw - a.scoreRaw;
            if (Math.abs(diff) < 0.1) {
                return (b.skala || 0) - (a.skala || 0);
            }
            return diff;
        });

        const topScore = finalResults[0]?.scoreRaw || 1;
        finalResults.forEach(r => {
            const relativeToTop = Math.min(100, Math.round((r.scoreRaw / topScore) * 100));
            const absoluteFloor = Math.min(100, Math.round((r.scoreRaw / 60) * 100));
            r.score = Math.min(relativeToTop, absoluteFloor);
            
            if (r.skala === 1 && r.score < 100) {
                r.score = Math.min(100, r.score + 5);
            }
        });

        return finalResults;
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
