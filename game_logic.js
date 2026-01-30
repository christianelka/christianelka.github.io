// Agen Terang vs Agen Gelap - Game Logic
// Word bank with Bible references
const WORD_BANK = {
    tokoh: [
        { utama: "Yesus Kristus", bingung: "Yohanes Pembaptis", kesulitan: 1, ayat: "Yohanes 3:16" },
        { utama: "Musa", bingung: "Harun", kesulitan: 1, ayat: "Keluaran 3:1-10" },
        { utama: "Daud", bingung: "Salomo", kesulitan: 1, ayat: "1 Samuel 17" },
        { utama: "Adam", bingung: "Hawa", kesulitan: 1, ayat: "Kejadian 2:7" },
        { utama: "Nuh", bingung: "Sem", kesulitan: 1, ayat: "Kejadian 6:9-22" },
        { utama: "Abraham", bingung: "Ishak", kesulitan: 1, ayat: "Kejadian 12:1-3" },
        { utama: "Petrus", bingung: "Andreas", kesulitan: 2, ayat: "Matius 16:18" },
        { utama: "Paulus", bingung: "Barnabas", kesulitan: 2, ayat: "Kisah Para Rasul 9:1-19" },
        { utama: "Elia", bingung: "Elisya", kesulitan: 2, ayat: "1 Raja-raja 18" },
        { utama: "Yusuf (Anak Yakub)", bingung: "Benyamin", kesulitan: 2, ayat: "Kejadian 37" },
        { utama: "Yakub", bingung: "Esau", kesulitan: 2, ayat: "Kejadian 32:22-32" },
        { utama: "Yunus", bingung: "Amos", kesulitan: 2, ayat: "Yunus 1-2" },
        { utama: "Daniel", bingung: "Yehezkiel", kesulitan: 2, ayat: "Daniel 6" },
        { utama: "Simson", bingung: "Gideon", kesulitan: 2, ayat: "Hakim-hakim 16" },
        { utama: "Maria Ibu Yesus", bingung: "Maria Magdalena", kesulitan: 2, ayat: "Lukas 1:26-38" },
        { utama: "Rut", bingung: "Naomi", kesulitan: 2, ayat: "Rut 1:16-17" },
        { utama: "Ester", bingung: "Rut", kesulitan: 2, ayat: "Ester 4:14" },
        { utama: "Yohanes Murid Yesus", bingung: "Yakobus", kesulitan: 2, ayat: "Yohanes 21:20-24" },
        { utama: "Zakheus", bingung: "Matius", kesulitan: 3, ayat: "Lukas 19:1-10" },
        { utama: "Rahab", bingung: "Debora", kesulitan: 3, ayat: "Yosua 2" },
        { utama: "Gideon", bingung: "Yefta", kesulitan: 3, ayat: "Hakim-hakim 6-7" },
        { utama: "Samuel", bingung: "Nathan", kesulitan: 3, ayat: "1 Samuel 3" },
        { utama: "Yosua", bingung: "Kaleb", kesulitan: 3, ayat: "Yosua 1:9" },
        { utama: "Saul Raja", bingung: "Salomo", kesulitan: 3, ayat: "1 Samuel 9-10" },
        { utama: "Stefanus", bingung: "Filipus", kesulitan: 3, ayat: "Kisah Para Rasul 7" },
        { utama: "Nikodemus", bingung: "Yusuf Arimatea", kesulitan: 3, ayat: "Yohanes 3:1-21" },
        { utama: "Lazarus", bingung: "Simon Orang Kusta", kesulitan: 3, ayat: "Yohanes 11:1-44" },
        { utama: "Herodes", bingung: "Pilatus", kesulitan: 3, ayat: "Matius 2:1-18" },
        { utama: "Yudas Iskariot", bingung: "Tomas", kesulitan: 3, ayat: "Matius 26:14-16" },
        { utama: "Bileam", bingung: "Barak", kesulitan: 3, ayat: "Bilangan 22-24" }
    ],
    peristiwa: [
        { utama: "Penciptaan Dunia", bingung: "Hari Keenam", kesulitan: 1, ayat: "Kejadian 1" },
        { utama: "Air Bah Nuh", bingung: "Laut Merah Terbelah", kesulitan: 1, ayat: "Kejadian 7-8" },
        { utama: "Kelahiran Yesus", bingung: "Kenaikan Yesus", kesulitan: 1, ayat: "Lukas 2:1-20" },
        { utama: "Penyaliban Yesus", bingung: "Kebangkitan Yesus", kesulitan: 1, ayat: "Matius 27:32-56" },
        { utama: "Keluaran dari Mesir", bingung: "Pembuangan ke Babel", kesulitan: 1, ayat: "Keluaran 12-14" },
        { utama: "Runtuhnya Tembok Yerikho", bingung: "Menara Babel", kesulitan: 2, ayat: "Yosua 6" },
        { utama: "Daud Melawan Goliat", bingung: "Simson Melawan Filistin", kesulitan: 2, ayat: "1 Samuel 17" },
        { utama: "Pentakosta", bingung: "Transfigurasi Yesus", kesulitan: 2, ayat: "Kisah Para Rasul 2" },
        { utama: "Pertobatan Paulus", bingung: "Panggilan Samuel", kesulitan: 2, ayat: "Kisah Para Rasul 9" },
        { utama: "Daniel di Gua Singa", bingung: "Tiga Sahabat di Perapian", kesulitan: 2, ayat: "Daniel 6" },
        { utama: "Manna dari Langit", bingung: "Lima Roti Dua Ikan", kesulitan: 2, ayat: "Keluaran 16" },
        { utama: "Yunus Ditelan Ikan", bingung: "Petrus Berjalan di Atas Air", kesulitan: 2, ayat: "Yunus 1:17-2:10" },
        { utama: "Perjamuan Terakhir", bingung: "Perjamuan Kawin Kana", kesulitan: 3, ayat: "Matius 26:17-30" },
        { utama: "Lazarus Dibangkitkan", bingung: "Anak Janda Nain Dibangkitkan", kesulitan: 3, ayat: "Yohanes 11" },
        { utama: "Yakub Bergulat dengan Malaikat", bingung: "Abraham Bertemu Tiga Tamu", kesulitan: 3, ayat: "Kejadian 32:22-32" },
        { utama: "Sodom dan Gomora", bingung: "Tulah Mesir", kesulitan: 3, ayat: "Kejadian 19" },
        { utama: "Elia Naik ke Surga", bingung: "Henokh Diangkat", kesulitan: 3, ayat: "2 Raja-raja 2:1-12" },
        { utama: "Baptisan Yesus", bingung: "Pencobaan Yesus", kesulitan: 2, ayat: "Matius 3:13-17" },
        { utama: "Yesus Mengusir Pedagang", bingung: "Yesus Menyembuhkan di Bait", kesulitan: 3, ayat: "Yohanes 2:13-22" },
        { utama: "Pertempuran Yosua di Ai", bingung: "Pertempuran Gideon", kesulitan: 3, ayat: "Yosua 8" }
    ],
    benda: [
        { utama: "Salib", bingung: "Mahkota Duri", kesulitan: 1, ayat: "Yohanes 19:17-18" },
        { utama: "Bahtera Nuh", bingung: "Tabut Perjanjian", kesulitan: 2, ayat: "Kejadian 6:14-22" },
        { utama: "Tongkat Musa", bingung: "Tongkat Harun", kesulitan: 2, ayat: "Keluaran 4:1-5" },
        { utama: "Batu Loh Sepuluh Hukum", bingung: "Gulungan Taurat", kesulitan: 3, ayat: "Keluaran 31:18" },
        { utama: "Jubah Warna-warni Yusuf", bingung: "Jubah Elia", kesulitan: 2, ayat: "Kejadian 37:3" },
        { utama: "Ketapel Daud", bingung: "Pedang Goliat", kesulitan: 2, ayat: "1 Samuel 17:40" },
        { utama: "Palungan Bayi Yesus", bingung: "Kandang Domba", kesulitan: 2, ayat: "Lukas 2:7" },
        { utama: "Roti dan Anggur Perjamuan", bingung: "Lima Roti Dua Ikan", kesulitan: 3, ayat: "Matius 26:26-28" },
        { utama: "Tali Merah Rahab", bingung: "Pintu Darah Paskah", kesulitan: 3, ayat: "Yosua 2:18" },
        { utama: "Sangkakala Yerikho", bingung: "Sangkakala Gideon", kesulitan: 3, ayat: "Yosua 6:4-5" },
        { utama: "Piala Firaun", bingung: "Piala Belsyazar", kesulitan: 3, ayat: "Kejadian 40:11" },
        { utama: "Bulu Domba Gideon", bingung: "Kurban Abraham", kesulitan: 3, ayat: "Hakim-hakim 6:36-40" },
        { utama: "Kunci Kerajaan Surga", bingung: "Pintu Sempit", kesulitan: 3, ayat: "Matius 16:19" },
        { utama: "Mahkota Raja Daud", bingung: "Mahkota Raja Salomo", kesulitan: 3, ayat: "2 Samuel 12:30" },
        { utama: "Minyak Urapan", bingung: "Air Pembaptisan", kesulitan: 2, ayat: "1 Samuel 16:13" }
    ]
};

const Game = {
    players: [],
    roles: [],
    word: null,
    confusedWord: null,
    ayat: null,
    currentPlayerIndex: 0,
    round: 1,
    votes: {},
    voteHistory: {}, // Track who voted for whom
    scores: {},
    eliminated: [],
    timerInterval: null,
    selectedDifficulty: 0,
    config: { dark: 1, confused: 0, duoMode: false },
    usedWords: [],
    gameNumber: 1,
    clueOrder: [],
    soundEnabled: false,
    sounds: {},
    // Statistics
    stats: {
        gamesPlayed: 0,
        terangWins: 0,
        gelapWins: 0,
        correctGuesses: 0
    },
    // Achievements
    achievements: {},
    // Random Events
    currentEvent: null,
    // Sudden death
    suddenDeathPlayers: [],
    isSuddenDeath: false,
    // Animation state
    currentScreen: 'welcome',

    // Initialize loading screen and effects
    init() {
        this.createParticles();
        this.setupRippleEffect();

        // Hide loading screen after 2.5 seconds
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 2500);
    },

    // Create floating particles background
    createParticles() {
        const container = document.getElementById('particles-container');
        if (!container) return;

        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random size
            const size = Math.random() * 6 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';

            // Random horizontal position
            particle.style.left = Math.random() * 100 + '%';

            // Random animation duration
            const duration = Math.random() * 20 + 15;
            particle.style.animationDuration = duration + 's';

            // Random delay
            particle.style.animationDelay = Math.random() * 20 + 's';

            // Random color variation
            const colors = [
                'rgba(139, 92, 246, 0.6)',  // purple
                'rgba(6, 182, 212, 0.6)',   // cyan
                'rgba(244, 114, 182, 0.5)', // pink
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;

            container.appendChild(particle);
        }
    },

    // Spawn confetti for victory
    spawnConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) return;

        container.innerHTML = ''; // Clear existing

        const confettiCount = 100;
        const colors = ['#8b5cf6', '#06b6d4', '#f472b6', '#22c55e', '#f59e0b', '#ef4444'];
        const shapes = ['square', 'rectangle', 'circle'];

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';

            // Random color
            const color = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.backgroundColor = color;

            // Random shape
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            if (shape === 'circle') {
                confetti.style.borderRadius = '50%';
            } else if (shape === 'rectangle') {
                confetti.style.width = '5px';
                confetti.style.height = '12px';
            }

            // Random position
            confetti.style.left = Math.random() * 100 + '%';

            // Random animation duration
            const duration = Math.random() * 2 + 2;
            confetti.style.animationDuration = duration + 's';

            // Random delay for staggered effect
            confetti.style.animationDelay = Math.random() * 1 + 's';

            // Random rotation
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

            container.appendChild(confetti);
        }

        // Remove confetti after animation
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    },

    // Setup ripple effect on buttons
    setupRippleEffect() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-glow, .btn-outline-glow');
            if (!btn) return;

            this.createRipple(e, btn);
        });
    },

    // Create ripple animation
    createRipple(event, button) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';

        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    },

    // Enhanced showScreen with smooth transitions
    showScreen(id) {
        const currentScreenEl = document.getElementById('screen-' + this.currentScreen);
        const newScreenEl = document.getElementById('screen-' + id);

        if (!newScreenEl) return;

        // Exit animation for current screen
        if (currentScreenEl && this.currentScreen !== id) {
            currentScreenEl.classList.add('screen-exit');

            setTimeout(() => {
                document.querySelectorAll('.screen').forEach(s => {
                    s.classList.add('hidden');
                    s.classList.remove('screen-exit', 'screen-enter');
                });

                // Show and animate new screen
                newScreenEl.classList.remove('hidden');
                newScreenEl.classList.add('screen-enter');

                this.currentScreen = id;
            }, 300);
        } else {
            // First load - no exit animation
            document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
            newScreenEl.classList.remove('hidden');
            newScreenEl.classList.add('screen-enter');
            this.currentScreen = id;
        }
    },

    // Show modal popup instead of alert
    showModal(icon, title, message, callback = null) {
        document.getElementById('modalIcon').innerHTML = icon;
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').innerHTML = message;

        const modal = new bootstrap.Modal(document.getElementById('gameModal'));

        if (callback) {
            document.getElementById('modalCloseBtn').onclick = () => {
                modal.hide();
                setTimeout(callback, 100);
            };
        } else {
            document.getElementById('modalCloseBtn').onclick = () => modal.hide();
        }

        modal.show();
    },

    startSetup() {
        const count = parseInt(document.getElementById('playerCount').value);
        if (isNaN(count) || count < 4) {
            this.showModal(
                '<i class="bi bi-exclamation-triangle text-warning"></i>',
                'Jumlah Tidak Valid',
                'Jumlah pemain minimal 4 orang!'
            );
            return;
        }
        this.requiredPlayers = count;
        this.updateRoleConfig();
        this.showScreen('config');
        document.getElementById('configPlayerCount').textContent = count;
        this.updateConfigPreview();
    },

    updateRoleConfig() {
        const n = this.requiredPlayers;
        const darkInput = document.getElementById('darkCount');
        const confusedInput = document.getElementById('confusedCount');

        darkInput.max = Math.floor(n / 2) - 1;
        darkInput.value = Math.min(darkInput.value || 1, darkInput.max);

        confusedInput.max = Math.floor(n / 3);
        confusedInput.value = Math.min(confusedInput.value || 0, confusedInput.max);
    },

    updateConfigPreview() {
        const n = this.requiredPlayers;
        const dark = parseInt(document.getElementById('darkCount').value) || 0;
        const confused = parseInt(document.getElementById('confusedCount').value) || 0;
        const falseProphet = parseInt(document.getElementById('falseProphetCount').value) || 0;
        const light = n - dark - confused - falseProphet;

        document.getElementById('previewLight').textContent = light;
        document.getElementById('previewDark').textContent = dark;
        document.getElementById('previewConfused').textContent = confused;
        document.getElementById('previewFalseProphet').textContent = falseProphet;

        this.config.dark = dark;
        this.config.confused = confused;
        this.config.falseProphet = falseProphet;
    },

    confirmConfig() {
        // Save duo mode setting
        this.config.duoMode = document.getElementById('duoModeCheck').checked;

        this.players = [];
        document.getElementById('playerTotal').textContent = this.requiredPlayers;
        document.getElementById('playerProgress').textContent = '0';
        document.getElementById('playerList').innerHTML = '';
        document.getElementById('btnStartGame').disabled = true;
        this.showScreen('setup');
        document.getElementById('playerNameInput').focus();
    },

    addPlayer() {
        const input = document.getElementById('playerNameInput');
        const name = input.value.trim();
        if (!name || this.players.includes(name)) {
            input.classList.add('is-invalid');
            setTimeout(() => input.classList.remove('is-invalid'), 500);
            return;
        }
        if (this.players.length >= this.requiredPlayers) return;

        this.players.push(name);
        this.scores[name] = 0;

        const list = document.getElementById('playerList');
        const badge = document.createElement('div');
        badge.className = 'player-badge mb-2';
        badge.innerHTML = `<i class="bi bi-person-fill text-info"></i><span>${name}</span>
            <button class="btn btn-sm ms-auto" onclick="Game.removePlayer('${name}', this)"><i class="bi bi-x text-danger"></i></button>`;
        list.appendChild(badge);

        document.getElementById('playerProgress').textContent = this.players.length;
        document.getElementById('btnStartGame').disabled = this.players.length < this.requiredPlayers;
        input.value = '';
        input.focus();
    },

    removePlayer(name, btn) {
        this.players = this.players.filter(p => p !== name);
        delete this.scores[name];
        btn.closest('.player-badge').remove();
        document.getElementById('playerProgress').textContent = this.players.length;
        document.getElementById('btnStartGame').disabled = this.players.length < this.requiredPlayers;
    },

    startGame() {
        this.assignRolesAndWord();
        this.round = 1;
        this.eliminated = [];
        this.currentPlayerIndex = 0;
        this.showRoleScreen();
    },

    assignRolesAndWord() {
        this.selectedDifficulty = Math.floor(Math.random() * 3) + 1;

        const allWords = [
            ...WORD_BANK.tokoh.filter(w => w.kesulitan <= this.selectedDifficulty),
            ...WORD_BANK.peristiwa.filter(w => w.kesulitan <= this.selectedDifficulty),
            ...WORD_BANK.benda.filter(w => w.kesulitan <= this.selectedDifficulty)
        ];

        const selected = allWords[Math.floor(Math.random() * allWords.length)];
        this.word = selected.utama;
        this.confusedWord = selected.bingung;
        this.ayat = selected.ayat;

        const n = this.players.length;
        const darkCount = this.config.dark;
        const confusedCount = this.config.confused;
        const falseProphetCount = this.config.falseProphet || 0;
        const lightCount = n - darkCount - confusedCount - falseProphetCount;

        this.roles = [];
        for (let i = 0; i < lightCount; i++) this.roles.push({ type: 'terang', word: this.word });
        for (let i = 0; i < darkCount; i++) this.roles.push({ type: 'gelap', word: null });
        for (let i = 0; i < confusedCount; i++) this.roles.push({ type: 'bingung', word: this.confusedWord });
        for (let i = 0; i < falseProphetCount; i++) this.roles.push({ type: 'nabi_palsu', word: this.word });

        this.shuffle(this.roles);
    },

    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    },

    showRoleScreen() {
        this.showScreen('role');
        const player = this.players[this.currentPlayerIndex];
        document.getElementById('rolePlayerName').textContent = player;
        document.getElementById('roleHidden').classList.remove('hidden');
        document.getElementById('roleRevealed').classList.add('hidden');
        document.getElementById('btnNextRole').classList.add('hidden');
        document.getElementById('roleCard').classList.remove('revealed');
    },

    revealRole() {
        const role = this.roles[this.currentPlayerIndex];
        const currentPlayer = this.players[this.currentPlayerIndex];
        document.getElementById('roleHidden').classList.add('hidden');
        document.getElementById('roleRevealed').classList.remove('hidden');
        document.getElementById('roleCard').classList.add('revealed');
        document.getElementById('btnNextRole').classList.remove('hidden');

        this.playSound('reveal');

        const diffText = ['', '⭐ Mudah', '⭐⭐ Sedang', '⭐⭐⭐ Sulit'][this.selectedDifficulty];

        if (role.type === 'terang' || role.type === 'bingung') {
            // Both Terang and Bingung see the same UI - they don't know which one they are!
            document.getElementById('roleIcon').innerHTML = '<i class="bi bi-envelope-open-fill text-warning"></i>';
            document.getElementById('roleName').textContent = 'Anda Mendapat Kata';
            document.getElementById('roleWord').textContent = role.word;
            document.getElementById('roleAyat').innerHTML = `<i class="bi bi-book me-1"></i>${this.ayat}`;
            document.getElementById('roleAyat').classList.remove('hidden');
            document.getElementById('roleDesc').innerHTML = `Pelajari referensi ayat, lalu berikan clue secara lisan!<br><small class="text-secondary">${diffText}</small><br><small class="text-warning mt-2 d-block">⚠️ Apakah kata Anda sama dengan yang lain?</small>`;
        } else if (role.type === 'nabi_palsu') {
            // Nabi Palsu - knows word but must confuse others!
            document.getElementById('roleIcon').innerHTML = '<i class="bi bi-exclamation-triangle-fill text-danger"></i>';
            document.getElementById('roleName').textContent = 'Nabi Palsu (Tim: Agen Gelap)';
            document.getElementById('roleWord').textContent = role.word;
            document.getElementById('roleAyat').innerHTML = `<i class="bi bi-book me-1"></i>${this.ayat}`;
            document.getElementById('roleAyat').classList.remove('hidden');

            let descHtml = `Kamu tahu kata rahasia, tapi kamu berada di <strong class="text-danger">TIM AGEN GELAP</strong>! Tugasmu adalah menyamar dan <strong class="text-danger">MENYESATKAN</strong> Agen Terang agar mereka salah menebak atau salah eliminasi.<br><small class="text-secondary">${diffText}</small>`;

            // Duo Mode: Show other teammates
            if (this.config.duoMode) {
                const team = this.players.filter((p, i) =>
                    (this.roles[i].type === 'gelap' || this.roles[i].type === 'nabi_palsu') && p !== currentPlayer
                );
                if (team.length > 0) {
                    descHtml += `<br><small class="text-info mt-2 d-block">🤝 Teman Tim: ${team.join(', ')}</small>`;
                }
            }

            document.getElementById('roleDesc').innerHTML = descHtml;
        } else {
            // Agen Gelap
            document.getElementById('roleIcon').innerHTML = '<i class="bi bi-moon-stars-fill text-danger"></i>';
            document.getElementById('roleName').textContent = 'Agen Gelap';
            document.getElementById('roleWord').textContent = '???';
            document.getElementById('roleAyat').classList.add('hidden');

            let descHtml = `Kamu tidak tahu kata rahasianya. Berpura-puralah tahu!<br><small class="text-secondary">${diffText}</small>`;

            // Duo Mode: Show other teammates
            if (this.config.duoMode) {
                const team = this.players.filter((p, i) =>
                    (this.roles[i].type === 'gelap' || this.roles[i].type === 'nabi_palsu') && p !== currentPlayer
                );
                if (team.length > 0) {
                    descHtml += `<br><small class="text-info mt-2 d-block">🤝 Teman Tim: ${team.join(', ')}</small>`;
                }
            }

            document.getElementById('roleDesc').innerHTML = descHtml;
        }
    },

    nextRole() {
        this.currentPlayerIndex++;
        if (this.currentPlayerIndex < this.players.length) {
            this.showRoleScreen();
        } else {
            this.startDiscussion();
        }
    },

    startDiscussion() {
        this.showScreen('discuss');
        document.getElementById('currentRound').textContent = this.round;

        // Random Event (20% chance, not on first round)
        this.currentEvent = null;
        if (this.round > 1 && Math.random() < 0.2) {
            this.triggerRandomEvent();
        }

        const activePlayers = this.players.filter(p => !this.eliminated.includes(p));

        // Generate random clue order from active players
        this.clueOrder = [...activePlayers];
        this.shuffle(this.clueOrder);

        // Display clue order
        const clueList = document.getElementById('clueOrderList');
        clueList.innerHTML = this.clueOrder.map((p, i) =>
            `<span class="badge bg-dark me-1 mb-1">${i + 1}. ${p}</span>`
        ).join('');

        // Display eliminated players
        if (this.eliminated.length > 0) {
            document.getElementById('eliminatedBox').classList.remove('hidden');
            document.getElementById('eliminatedList').textContent = this.eliminated.join(', ');
        } else {
            document.getElementById('eliminatedBox').classList.add('hidden');
        }

        this.playSound('round');
        this.startTimer('discuss', 600);
    },

    triggerRandomEvent() {
        const events = [
            { id: 'double_vote', name: 'Double Vote!', icon: '⚔️', desc: 'Vote terbanyak = 2x suara!', effect: 'Pemain ke-2 & ke-3 vote punya 2x suara' },
            { id: 'skip_elim', name: 'Perlindungan Ilahi', icon: '🛡️', desc: 'Tidak ada eliminasi ronde ini!', effect: 'Voting tetap berlangsung tapi tidak ada yang tereliminasi' },
            { id: 'short_time', name: 'Waktu Terbatas!', icon: '⏱️', desc: 'Diskusi hanya 3 menit!', effect: 'Timer dipotong setengah' },
            { id: 'bonus_round', name: 'Bonus Spiritual', icon: '✨', desc: 'Double points ronde ini!', effect: 'Semua poin ronde ini digandakan' }
        ];

        this.currentEvent = events[Math.floor(Math.random() * events.length)];

        // Show event modal
        this.showModal(
            `<span style="font-size:3rem">${this.currentEvent.icon}</span>`,
            `🎲 ${this.currentEvent.name}`,
            `${this.currentEvent.desc}<br><small class="text-secondary">${this.currentEvent.effect}</small>`
        );

        // Apply event effect
        if (this.currentEvent.id === 'short_time') {
            setTimeout(() => {
                this.stopTimer();
                this.startTimer('discuss', 180); // 3 minutes instead of 10
            }, 500);
        }
    },

    startVoting() {
        this.stopTimer();
        this.votes = {};
        this.currentPlayerIndex = 0;
        this.showNextVoter();
    },

    showNextVoter() {
        // Skip eliminated players, and in sudden death, skip the tied players themselves
        while (this.currentPlayerIndex < this.players.length) {
            const p = this.players[this.currentPlayerIndex];
            if (this.eliminated.includes(p)) {
                this.currentPlayerIndex++;
                continue;
            }
            if (this.isSuddenDeath && this.suddenDeathPlayers.includes(p)) {
                this.currentPlayerIndex++;
                continue;
            }
            break;
        }

        if (this.currentPlayerIndex >= this.players.length) {
            this.processVotes();
            return;
        }

        this.showScreen('vote');
        const voter = this.players[this.currentPlayerIndex];
        document.getElementById('votePlayerName').textContent = voter;

        // In sudden death, show indicator
        if (this.isSuddenDeath) {
            document.getElementById('votePlayerName').innerHTML = voter + ' <span class="badge bg-warning">⚡ Sudden Death</span>';
        }

        const list = document.getElementById('voteList');
        list.innerHTML = '';

        // Determine which players to show for voting
        let votingOptions;
        if (this.isSuddenDeath) {
            votingOptions = this.suddenDeathPlayers;
        } else {
            votingOptions = this.players.filter(p => p !== voter && !this.eliminated.includes(p));
        }

        votingOptions.forEach(p => {
            const col = document.createElement('div');
            col.className = 'col-6';
            col.innerHTML = `<div class="vote-btn text-center" data-player="${p}" onclick="Game.selectVote(this)">
                <i class="bi bi-person-fill d-block mb-1" style="font-size:1.5rem;"></i>${p}</div>`;
            list.appendChild(col);
        });

        // Add skip option (only if not sudden death)
        if (!this.isSuddenDeath) {
            const skipCol = document.createElement('div');
            skipCol.className = 'col-12 mt-2';
            skipCol.innerHTML = `<div class="vote-btn text-center" data-player="__SKIP__" onclick="Game.selectVote(this)" style="border-style:dashed;">
                <i class="bi bi-slash-circle d-block mb-1" style="font-size:1.5rem;"></i>Skip Vote (Tidak Memilih)</div>`;
            list.appendChild(skipCol);
        }

        document.getElementById('btnSubmitVote').disabled = true;
        this.selectedVote = null;
    },

    selectVote(el) {
        document.querySelectorAll('.vote-btn').forEach(b => b.classList.remove('selected'));
        el.classList.add('selected');
        this.selectedVote = el.dataset.player;
        document.getElementById('btnSubmitVote').disabled = false;
    },

    submitVote() {
        if (!this.selectedVote) return;
        const voter = this.players[this.currentPlayerIndex];

        // Track vote history
        this.voteHistory[voter] = this.selectedVote;

        // Only count vote if not skipped
        if (this.selectedVote !== '__SKIP__') {
            this.votes[this.selectedVote] = (this.votes[this.selectedVote] || 0) + 1;
        }
        this.currentPlayerIndex++;
        this.showNextVoter();
    },

    processVotes() {
        // Handle case where everyone skipped
        if (Object.keys(this.votes).length === 0) {
            this.showVoteResults(null, true); // Treat as tie (no elimination)
            return;
        }

        let maxVotes = 0, eliminated = null;
        for (const [player, count] of Object.entries(this.votes)) {
            if (count > maxVotes) { maxVotes = count; eliminated = player; }
        }

        const tiedPlayers = Object.entries(this.votes).filter(([_, c]) => c === maxVotes);

        // Show vote results first
        if (tiedPlayers.length > 1 && !this.isSuddenDeath) {
            // Start sudden death voting
            this.suddenDeathPlayers = tiedPlayers.map(([p, _]) => p);
            this.showSuddenDeath();
        } else if (tiedPlayers.length > 1 && this.isSuddenDeath) {
            // Tie again in sudden death - no elimination
            this.isSuddenDeath = false;
            this.showVoteResults(null, true);
        } else {
            this.isSuddenDeath = false;
            this.showVoteResults(eliminated, false);
        }
    },

    showSuddenDeath() {
        this.showModal(
            '<i class="bi bi-lightning-fill text-warning"></i>',
            '⚡ Sudden Death!',
            `Hasil seri antara: <strong>${this.suddenDeathPlayers.join(' vs ')}</strong><br>Vote ulang hanya untuk 2 pemain tersebut!`,
            () => this.startSuddenDeathVote()
        );
    },

    startSuddenDeathVote() {
        this.isSuddenDeath = true;
        this.votes = {};
        this.voteHistory = {};
        this.currentPlayerIndex = 0;
        this.showNextVoter();
    },

    showVoteResults(eliminated, isTie) {
        // Display vote results modal
        let resultsHtml = '<div class="text-start">';
        const activePlayers = this.players.filter(p => !this.eliminated.includes(p));

        activePlayers.forEach(voter => {
            const votedFor = this.voteHistory[voter] || '__SKIP__';
            const votedName = votedFor === '__SKIP__' ? '<em>Skip</em>' : votedFor;
            resultsHtml += `<div class="mb-1"><i class="bi bi-person-fill me-1"></i>${voter} ➜ ${votedName}</div>`;
        });
        resultsHtml += '</div>';

        // Vote count summary
        resultsHtml += '<hr><div class="text-start"><strong>Total suara:</strong><br>';
        const sortedVotes = Object.entries(this.votes).sort((a, b) => b[1] - a[1]);
        sortedVotes.forEach(([player, count]) => {
            resultsHtml += `<span class="badge bg-secondary me-1">${player}: ${count}</span>`;
        });
        resultsHtml += '</div>';

        this.showModal(
            '<i class="bi bi-clipboard-data text-info"></i>',
            '📊 Hasil Voting',
            resultsHtml,
            () => this.showReveal(eliminated, isTie)
        );
    },

    showReveal(player, isTie) {
        this.showScreen('reveal');
        document.getElementById('guessSection').classList.add('hidden');
        this.playSound('eliminate');

        // Check for skip_elim event
        if (this.currentEvent && this.currentEvent.id === 'skip_elim' && player) {
            document.getElementById('revealTitle').textContent = '🛡️ Perlindungan Ilahi!';
            document.getElementById('revealIcon').innerHTML = '<i class="bi bi-shield-fill text-success"></i>';
            document.getElementById('revealPlayer').textContent = player + ' selamat!';
            document.getElementById('revealRole').textContent = 'Tidak ada eliminasi karena event khusus';
            return;
        }

        if (isTie) {
            document.getElementById('revealTitle').textContent = 'Hasil Seri!';
            document.getElementById('revealIcon').innerHTML = '<i class="bi bi-dash-circle text-warning"></i>';
            document.getElementById('revealPlayer').textContent = 'Tidak ada yang tereliminasi';
            document.getElementById('revealRole').textContent = 'Lanjut ke ronde berikutnya';
        } else {
            const idx = this.players.indexOf(player);
            const role = this.roles[idx];
            this.eliminated.push(player);

            document.getElementById('revealPlayer').textContent = player;

            if (role.type === 'gelap') {
                document.getElementById('revealTitle').textContent = 'Tertangkap!';
                document.getElementById('revealIcon').innerHTML = '<i class="bi bi-moon-stars-fill text-danger"></i>';
                document.getElementById('revealRole').textContent = 'adalah Agen Gelap!';
                document.getElementById('guessSection').classList.remove('hidden');
                this.pendingGuessPlayer = player;
                this.players.filter((_, i) => this.roles[i].type === 'terang' && !this.eliminated.includes(this.players[i]))
                    .forEach(p => this.scores[p] += 20);
            } else if (role.type === 'bingung') {
                document.getElementById('revealTitle').textContent = 'Oops!';
                document.getElementById('revealIcon').innerHTML = '<i class="bi bi-question-circle text-info"></i>';
                document.getElementById('revealRole').textContent = 'adalah Murid Bingung!';
                document.getElementById('guessSection').classList.remove('hidden');
                this.pendingGuessPlayer = player;
                this.players.filter((_, i) => this.roles[i].type === 'terang' && !this.eliminated.includes(this.players[i]))
                    .forEach(p => this.scores[p] += 15);
            } else if (role.type === 'nabi_palsu') {
                document.getElementById('revealTitle').textContent = 'Terbongkar!';
                document.getElementById('revealIcon').innerHTML = '<i class="bi bi-exclamation-triangle-fill text-danger"></i>';
                document.getElementById('revealRole').textContent = 'adalah Nabi Palsu!';
                this.players.filter((_, i) => this.roles[i].type === 'terang' && !this.eliminated.includes(this.players[i]))
                    .forEach(p => this.scores[p] += 25);
            } else {
                document.getElementById('revealTitle').textContent = 'Salah Target!';
                document.getElementById('revealIcon').innerHTML = '<i class="bi bi-lightbulb-fill text-warning"></i>';
                document.getElementById('revealRole').textContent = 'adalah Agen Terang!';
            }
        }
    },

    submitGuess() {
        const guess = document.getElementById('guessInput').value.trim().toLowerCase();
        const correct = this.word.toLowerCase();
        const isCorrect = guess === correct || guess.includes(correct) || correct.includes(guess);

        if (isCorrect) {
            // Correct guess = TEAM WINS! Give points to all team members
            const guesserIdx = this.players.indexOf(this.pendingGuessPlayer);
            const guesserRole = this.roles[guesserIdx].type;

            // Give bonus to ALL players of the same team
            this.players.forEach((p, i) => {
                const type = this.roles[i].type;
                if (type === guesserRole || (guesserRole === 'gelap' && type === 'nabi_palsu') || (guesserRole === 'nabi_palsu' && type === 'gelap')) {
                    if (type === 'gelap') this.scores[p] += 50;
                    else if (type === 'bingung') this.scores[p] += 40;
                    else if (type === 'nabi_palsu') this.scores[p] += 45;
                }
            });

            document.getElementById('guessSection').classList.add('hidden');
            document.getElementById('btnContinue').classList.add('hidden');

            // Show win message then go to final
            this.showModal(
                '<i class="bi bi-trophy-fill text-warning"></i>',
                '🎉 TEBAKAN BENAR!',
                `<strong>${this.pendingGuessPlayer}</strong> berhasil menebak kata!<br>Tim ${guesserRole === 'gelap' ? 'Agen Gelap' : 'Murid Bingung'} <strong>MENANG!</strong>`,
                () => this.showFinalScreen('gelap', true)
            );
        } else {
            this.showModal(
                '<i class="bi bi-x-circle text-danger"></i>',
                'Tebakan Salah',
                'Permainan dilanjutkan ke ronde berikutnya.'
            );
            document.getElementById('guessSection').classList.add('hidden');
        }
    },

    continueGame() {
        const activePlayers = this.players.filter(p => !this.eliminated.includes(p));

        // Count remaining roles
        let darkRemaining = 0, lightRemaining = 0, confusedRemaining = 0, falseProphetRemaining = 0;
        activePlayers.forEach(p => {
            const idx = this.players.indexOf(p);
            const type = this.roles[idx].type;
            if (type === 'gelap') darkRemaining++;
            else if (type === 'terang') lightRemaining++;
            else if (type === 'bingung') confusedRemaining++;
            else if (type === 'nabi_palsu') falseProphetRemaining++;
        });

        const impostersRemaining = darkRemaining + confusedRemaining + falseProphetRemaining;

        // Win condition 1: All imposters (Gelap + Bingung) eliminated - Agen Terang wins!
        if (impostersRemaining === 0) {
            activePlayers.forEach(p => {
                const idx = this.players.indexOf(p);
                if (this.roles[idx].type === 'terang') this.scores[p] += 30;
            });
            this.showFinalScreen('terang');
            return;
        }

        // Win condition 2: Imposters survive until only 2-3 players left - Imposters win!
        // Or if light players are outnumbered/equal to imposters
        if (activePlayers.length <= 3 || lightRemaining <= impostersRemaining) {
            this.players.forEach((p, idx) => {
                const type = this.roles[idx].type;
                if (type === 'gelap') this.scores[p] += 40;
                if (type === 'bingung') this.scores[p] += 25;
                if (type === 'nabi_palsu') this.scores[p] += 35;
            });
            this.showFinalScreen('gelap');
            return;
        }

        // Game continues - next round
        this.round++;
        this.startDiscussion();
    },

    showFinalScreen(winner, wonByGuess = false) {
        this.showScreen('final');
        this.playSound('win');
        this.spawnConfetti(); // Victory confetti!

        // Update statistics
        this.stats.gamesPlayed++;
        if (winner === 'terang') {
            this.stats.terangWins++;
        } else {
            this.stats.gelapWins++;
            if (wonByGuess) this.stats.correctGuesses++;
        }

        // Check achievements
        this.checkAchievements(winner, wonByGuess);

        document.getElementById('finalWord').textContent = this.word;
        document.getElementById('finalAyat').textContent = this.ayat;
        document.getElementById('finalGameNumber').textContent = this.gameNumber;

        const announce = document.getElementById('winnerAnnounce');
        if (winner === 'terang') {
            announce.innerHTML = '<h2 class="text-warning"><i class="bi bi-lightbulb-fill me-2"></i>Agen Terang Menang!</h2>';
        } else {
            const method = wonByGuess ? ' (Tebakan Benar!)' : '';
            announce.innerHTML = `<h2 class="text-secondary"><i class="bi bi-moon-stars-fill me-2"></i>Agen Gelap/Bingung Menang!${method}</h2>`;
        }

        const sorted = Object.entries(this.scores).sort((a, b) => b[1] - a[1]);
        const container = document.getElementById('finalScores');
        container.innerHTML = '';
        sorted.forEach(([name, score], i) => {
            const idx = this.players.indexOf(name);
            const role = this.roles[idx];
            const icon = role.type === 'terang' ? '💡' : (role.type === 'gelap' ? '🌙' : (role.type === 'bingung' ? '❓' : '⚠️'));
            const medal = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : ''));
            const div = document.createElement('div');
            div.className = 'score-row d-flex justify-content-between align-items-center';
            div.innerHTML = `<span>${medal} ${icon} ${name}</span><span class="fw-bold text-info">${score} pts</span>`;
            container.appendChild(div);
        });

        // Show stats summary
        this.updateStatsDisplay();
    },

    checkAchievements(winner, wonByGuess) {
        // Check for various achievements
        const newAchievements = [];

        // First win
        if (this.stats.gamesPlayed === 1) {
            newAchievements.push({ name: 'Pemula', icon: '🎮', desc: 'Selesaikan permainan pertama' });
        }

        // Master (10 games)
        if (this.stats.gamesPlayed === 10) {
            newAchievements.push({ name: 'Veteran', icon: '⭐', desc: 'Main 10 permainan' });
        }

        // Perfect guess
        if (wonByGuess) {
            if (!this.achievements['perfect_guess']) {
                newAchievements.push({ name: 'Psikis', icon: '🔮', desc: 'Tebak kata dengan benar' });
                this.achievements['perfect_guess'] = true;
            }
        }

        // Light domination (5 terang wins)
        if (this.stats.terangWins === 5 && !this.achievements['light_master']) {
            newAchievements.push({ name: 'Master Terang', icon: '💡', desc: 'Agen Terang menang 5 kali' });
            this.achievements['light_master'] = true;
        }

        // Dark domination (5 gelap wins)
        if (this.stats.gelapWins === 5 && !this.achievements['dark_master']) {
            newAchievements.push({ name: 'Master Gelap', icon: '🌙', desc: 'Agen Gelap menang 5 kali' });
            this.achievements['dark_master'] = true;
        }

        // Show achievements if any
        if (newAchievements.length > 0) {
            setTimeout(() => {
                let html = newAchievements.map(a =>
                    `<div class="mb-2"><span style="font-size:2rem">${a.icon}</span><br><strong>${a.name}</strong><br><small class="text-secondary">${a.desc}</small></div>`
                ).join('');
                this.showModal(
                    '<i class="bi bi-trophy-fill text-warning"></i>',
                    '🏆 Achievement Unlocked!',
                    html
                );
            }, 500);
        }
    },

    updateStatsDisplay() {
        const statsEl = document.getElementById('sessionStats');
        if (statsEl) {
            statsEl.innerHTML = `
                <small class="text-secondary">
                    📊 Session: ${this.stats.gamesPlayed} game | 
                    💡 Terang: ${this.stats.terangWins} | 
                    🌙 Gelap: ${this.stats.gelapWins}
                </small>
            `;
        }
    },

    startTimer(type, seconds) {
        this.stopTimer();
        let remaining = seconds;
        const ring = document.getElementById(type + 'Timer');
        const text = document.getElementById(type + 'TimerText');

        const update = () => {
            text.textContent = remaining;
            ring.style.setProperty('--progress', (remaining / seconds * 100) + '%');

            // Dramatic countdown for last 10 seconds
            if (remaining <= 10 && remaining > 0) {
                text.style.color = '#ef4444';
                text.style.animation = 'pulse 0.5s';
                this.playSound('click');
            } else {
                text.style.color = '';
                text.style.animation = '';
            }

            if (remaining <= 0) {
                this.stopTimer();
                if (type === 'discuss') this.startVoting();
            }
            remaining--;
        };
        update();
        this.timerInterval = setInterval(update, 1000);
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    restart() {
        this.players = [];
        this.roles = [];
        this.scores = {};
        this.eliminated = [];
        this.usedWords = [];
        this.gameNumber = 1;
        this.stats = { gamesPlayed: 0, terangWins: 0, gelapWins: 0, correctGuesses: 0 };
        this.showScreen('welcome');
    },

    // Continue with same players but new word
    continueWithSamePlayers() {
        this.usedWords.push(this.word); // Mark current word as used
        this.roles = [];
        this.eliminated = [];
        this.round = 1;
        this.gameNumber++;
        this.currentPlayerIndex = 0;

        // Re-assign roles and get new word
        this.assignRolesAndWord();

        // Check if we got a valid word (not used before)
        let attempts = 0;
        while (this.usedWords.includes(this.word) && attempts < 50) {
            this.assignRolesAndWord();
            attempts++;
        }

        if (this.usedWords.includes(this.word)) {
            this.showModal(
                '<i class="bi bi-info-circle text-info"></i>',
                'Kata Habis',
                'Semua kata sudah digunakan! Memulai ulang permainan.',
                () => this.restart()
            );
            return;
        }

        this.showRoleScreen();
    },

    // Sound Effects
    enableSound() {
        this.soundEnabled = true;
        // Create audio context to enable sounds (Chrome autoplay policy)
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();

        document.getElementById('btnEnableSound').innerHTML = '<i class="bi bi-volume-up-fill me-2"></i>Suara Aktif ✓';
        document.getElementById('btnEnableSound').disabled = true;

        // Play a test beep
        this.playSound('click');
    },

    playSound(type) {
        if (!this.soundEnabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Different sounds for different events
        switch (type) {
            case 'click':
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.1;
                oscillator.start();
                oscillator.stop(ctx.currentTime + 0.1);
                break;
            case 'reveal':
                oscillator.frequency.value = 523;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.2;
                oscillator.start();
                setTimeout(() => { oscillator.frequency.value = 659; }, 100);
                setTimeout(() => { oscillator.frequency.value = 784; }, 200);
                oscillator.stop(ctx.currentTime + 0.3);
                break;
            case 'round':
                oscillator.frequency.value = 440;
                oscillator.type = 'triangle';
                gainNode.gain.value = 0.15;
                oscillator.start();
                oscillator.stop(ctx.currentTime + 0.5);
                break;
            case 'win':
                oscillator.frequency.value = 523;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.2;
                oscillator.start();
                setTimeout(() => { oscillator.frequency.value = 659; }, 150);
                setTimeout(() => { oscillator.frequency.value = 784; }, 300);
                setTimeout(() => { oscillator.frequency.value = 1047; }, 450);
                oscillator.stop(ctx.currentTime + 0.6);
                break;
            case 'eliminate':
                oscillator.frequency.value = 300;
                oscillator.type = 'sawtooth';
                gainNode.gain.value = 0.1;
                oscillator.start();
                oscillator.stop(ctx.currentTime + 0.3);
                break;
        }
    },

    // Moderator View
    showModeratorView() {
        document.getElementById('modWord').textContent = this.word;
        document.getElementById('modConfusedWord').textContent = this.confusedWord;
        document.getElementById('modAyat').innerHTML = `<i class="bi bi-book me-1"></i>${this.ayat}`;

        const roleList = document.getElementById('modRoleList');
        roleList.innerHTML = '';

        this.players.forEach((player, i) => {
            const role = this.roles[i];
            const isEliminated = this.eliminated.includes(player);
            let icon, color, roleName;

            if (role.type === 'terang') {
                icon = 'bi-lightbulb-fill';
                color = 'text-warning';
                roleName = 'Agen Terang';
            } else if (role.type === 'gelap') {
                icon = 'bi-moon-stars-fill';
                color = 'text-danger';
                roleName = 'Agen Gelap';
            } else if (role.type === 'nabi_palsu') {
                icon = 'bi-exclamation-triangle-fill';
                color = 'text-danger';
                roleName = 'Nabi Palsu';
            } else {
                icon = 'bi-question-circle-fill';
                color = 'text-info';
                roleName = 'Murid Bingung';
            }

            const div = document.createElement('div');
            div.className = `score-row d-flex justify-content-between align-items-center ${isEliminated ? 'opacity-50' : ''}`;
            div.innerHTML = `
                <span><i class="bi ${icon} ${color} me-2"></i>${player}${isEliminated ? ' <small>(OUT)</small>' : ''}</span>
                <span class="badge bg-dark">${roleName}</span>
            `;
            roleList.appendChild(div);
        });

        const modal = new bootstrap.Modal(document.getElementById('moderatorModal'));
        modal.show();
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('playerNameInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') Game.addPlayer();
    });
    document.getElementById('guessInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') Game.submitGuess();
    });
});
