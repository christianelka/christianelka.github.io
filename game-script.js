// Game Script - Tebak Alkitab Bersama!
// File: game-script.js
// Berisi semua logic dan fungsi permainan

// Game state
let gameState = {
    teams: {},
    scores: {},
    usedItems: [],
    gameHistory: [],
    candidates: [],
    currentTeam: null,
    currentItem: null,
    currentClues: [],
    currentClueIndex: 0,
    remainingClues: 10,
    roundNumber: 1,
    teamsPlayedThisRound: []
};

// Game data loaded from external JavaScript file
let daftarSesuatu = [];

// Function to load game data from external JS file
async function loadGameData() {
    console.log('Loading game data from external JS file...');
    
    // Check if gameData is available from external file
    if (typeof window.gameData !== 'undefined' && window.gameData.length > 0) {
        daftarSesuatu = window.gameData;
        console.log(`✅ Successfully loaded ${daftarSesuatu.length} game items from game-data.js`);
        showAlert(`✅ Berhasil memuat ${daftarSesuatu.length} item permainan dari file eksternal!`, 'success');
        return;
    } else {
        console.log('External data loading failed, using sample data...');
        useSampleData();
    }
}

// Function to show error panel with options (simplified)
function showErrorPanel() {
    const dataInfoElement = document.getElementById('dataInfo');
    const dataErrorElement = document.getElementById('dataError');
    
    if (dataInfoElement) dataInfoElement.style.display = 'none';
    if (dataErrorElement) dataErrorElement.style.display = 'block';
}

// Utility functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        playSound('click');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

function showAlert(message, type = 'info') {
    playSound('click');
    
    const alertConfig = {
        title: getAlertTitle(type),
        text: message,
        icon: getAlertIcon(type),
        confirmButtonText: 'OK',
        confirmButtonColor: getAlertColor(type),
        timer: type === 'success' ? 2000 : 3000,
        timerProgressBar: true,
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    };
    
    Swal.fire(alertConfig);
}

function getAlertTitle(type) {
    switch(type) {
        case 'success': return 'Berhasil!';
        case 'error': 
        case 'danger': return 'Error!';
        case 'warning': return 'Peringatan!';
        case 'info': return 'Informasi';
        default: return 'Notifikasi';
    }
}

function getAlertIcon(type) {
    switch(type) {
        case 'success': return 'success';
        case 'error': 
        case 'danger': return 'error';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'info';
    }
}

function getAlertColor(type) {
    switch(type) {
        case 'success': return '#28a745';
        case 'error': 
        case 'danger': return '#dc3545';
        case 'warning': return '#ffc107';
        case 'info': return '#17a2b8';
        default: return '#667eea';
    }
}

function updateGameStatus() {
    const teamCount = Object.keys(gameState.teams).length;
    const leaders = Object.values(gameState.teams).map(team => team.ketua).join(', ');
    
    const teamCountElement = document.getElementById('teamCount');
    const teamLeadersElement = document.getElementById('teamLeaders');
    const gameStateElement = document.getElementById('gameState');
    const itemCountElement = document.getElementById('itemCount');
    const dataInfoElement = document.getElementById('dataInfo');
    const gameStatusElement = document.getElementById('gameStatus');
    
    if (teamCountElement) teamCountElement.textContent = teamCount;
    if (teamLeadersElement) teamLeadersElement.textContent = leaders || '-';
    if (gameStateElement) gameStateElement.textContent = teamCount > 0 ? 'Siap bermain' : 'Belum dimulai';
    if (itemCountElement) itemCountElement.textContent = daftarSesuatu.length;
    
    // Hide loading info and show game status
    if (dataInfoElement) dataInfoElement.style.display = 'none';
    if (gameStatusElement && teamCount > 0) {
        gameStatusElement.classList.add('show');
    }
}

// Ketua functions
function addCandidate() {
    const candidateNameInput = document.getElementById('candidateName');
    if (!candidateNameInput) return;
    
    const name = candidateNameInput.value.trim();
    if (!name) {
        showErrorDialog('Nama tidak boleh kosong!');
        return;
    }
    
    if (gameState.candidates.includes(name)) {
        showAlert('Nama sudah ada dalam daftar!', 'warning');
        return;
    }
    
    gameState.candidates.push(name);
    candidateNameInput.value = '';
    displayCandidates();
    playSound('click');
    showSuccessDialog(`${name} berhasil ditambahkan sebagai calon ketua!`);
}

function displayCandidates() {
    const container = document.getElementById('candidatesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.candidates.forEach((candidate, index) => {
        const card = document.createElement('div');
        card.className = 'team-card';
        card.innerHTML = `
            <h4>${index + 1}. ${candidate}</h4>
            <p>Calon ketua tim</p>
        `;
        container.appendChild(card);
    });
    
    if (gameState.candidates.length >= 2) {
        const ketuaSelection = document.getElementById('ketuaSelection');
        if (ketuaSelection) {
            ketuaSelection.classList.remove('hidden');
        }
    }
}

function finalizeTeams() {
    const teamCountInput = document.getElementById('teamCountInput');
    if (!teamCountInput) return;
    
    const teamCount = parseInt(teamCountInput.value);
    if (teamCount < 2 || teamCount > gameState.candidates.length) {
        showErrorDialog('Jumlah tim tidak valid!');
        return;
    }
    
    // Shuffle candidates and assign to teams
    const shuffled = [...gameState.candidates].sort(() => Math.random() - 0.5);
    gameState.teams = {};
    gameState.scores = {};
    
    for (let i = 0; i < teamCount; i++) {
        const teamKey = `tim${i + 1}`;
        gameState.teams[teamKey] = {
            ketua: shuffled[i],
            anggota: []
        };
        gameState.scores[teamKey] = 0;
    }
    
    updateGameStatus();
    closeModal('ketuaModal');
    showSuccessDialog('Tim berhasil dibuat!', 'Tim Siap!');
}

// Tim functions
function addMember() {
    const memberNameInput = document.getElementById('memberName');
    if (!memberNameInput) return;
    
    const name = memberNameInput.value.trim();
    if (!name) {
        showErrorDialog('Nama tidak boleh kosong!');
        return;
    }
    
    // Check if name is already a leader
    const leaders = Object.values(gameState.teams).map(team => team.ketua);
    if (leaders.includes(name)) {
        showAlert('Nama sudah terdaftar sebagai ketua!', 'warning');
        return;
    }
    
    // Smart team assignment dengan auto-balance
    const selectedTeam = getOptimalTeamAssignment();
    gameState.teams[selectedTeam].anggota.push(name);
    
    memberNameInput.value = '';
    displayTeams();
    showSuccessDialog(`${name} bergabung dengan ${selectedTeam}!`);
    playSound('click');
}

function getOptimalTeamAssignment() {
    const teamKeys = Object.keys(gameState.teams);
    const teamSizes = teamKeys.map(teamKey => ({
        team: teamKey,
        size: gameState.teams[teamKey].anggota.length
    }));
    
    // Urutkan tim berdasarkan jumlah anggota (terkecil dulu)
    teamSizes.sort((a, b) => a.size - b.size);
    
    const minSize = teamSizes[0].size;
    const maxSize = teamSizes[teamSizes.length - 1].size;
    const sizeDifference = maxSize - minSize;
    
    // Jika selisih >= 2, pilih tim dengan anggota paling sedikit
    if (sizeDifference >= 2) {
        const smallestTeams = teamSizes.filter(team => team.size === minSize);
        // Jika ada beberapa tim dengan ukuran sama, pilih secara random
        const randomIndex = Math.floor(Math.random() * smallestTeams.length);
        return smallestTeams[randomIndex].team;
    } else {
        // Jika selisih < 2, pilih secara random
        const randomIndex = Math.floor(Math.random() * teamKeys.length);
        return teamKeys[randomIndex];
    }
}

function displayTeams() {
    const container = document.getElementById('teamsDisplay');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Hitung statistik tim
    const teamStats = Object.entries(gameState.teams).map(([teamKey, team]) => ({
        key: teamKey,
        ketua: team.ketua,
        anggota: team.anggota,
        totalMembers: team.anggota.length + 1, // +1 untuk ketua
        anggotaList: team.anggota.join(', ') || 'Belum ada'
    }));
    
    // Urutkan berdasarkan jumlah anggota (terbanyak dulu)
    teamStats.sort((a, b) => b.totalMembers - a.totalMembers);
    
    teamStats.forEach((team, index) => {
        const card = document.createElement('div');
        card.className = 'team-card';
        
        // Tentukan warna border berdasarkan ukuran tim
        let borderColor = '#667eea'; // default
        if (team.totalMembers === Math.max(...teamStats.map(t => t.totalMembers))) {
            borderColor = '#28a745'; // hijau untuk tim terbesar
        } else if (team.totalMembers === Math.min(...teamStats.map(t => t.totalMembers))) {
            borderColor = '#ffc107'; // kuning untuk tim terkecil
        }
        
        card.style.borderLeftColor = borderColor;
        card.innerHTML = `
            <h4>${team.key} - ${team.ketua}</h4>
            <p><strong>Total: ${team.totalMembers} orang</strong></p>
            <p>Anggota: ${team.anggotaList}</p>
            <div style="font-size: 0.8rem; color: #666; margin-top: 5px;">
                ${team.totalMembers === Math.max(...teamStats.map(t => t.totalMembers)) ? '🟢 Tim terbesar' : 
                  team.totalMembers === Math.min(...teamStats.map(t => t.totalMembers)) ? '🟡 Tim terkecil' : 
                  '⚪ Tim seimbang'}
            </div>
        `;
        container.appendChild(card);
    });
    
    // Tampilkan statistik pembagian
    const totalMembers = teamStats.reduce((sum, team) => sum + team.totalMembers, 0);
    const avgMembers = (totalMembers / teamStats.length).toFixed(1);
    const maxMembers = Math.max(...teamStats.map(t => t.totalMembers));
    const minMembers = Math.min(...teamStats.map(t => t.totalMembers));
    
    const statsDiv = document.createElement('div');
    statsDiv.className = 'team-card';
    statsDiv.style.background = '#f8f9fa';
    statsDiv.style.marginTop = '15px';
    statsDiv.innerHTML = `
        <h4>📊 Statistik Pembagian Tim</h4>
        <p><strong>Total Anggota:</strong> ${totalMembers} orang</p>
        <p><strong>Rata-rata per Tim:</strong> ${avgMembers} orang</p>
        <p><strong>Tim Terbesar:</strong> ${maxMembers} orang</p>
        <p><strong>Tim Terkecil:</strong> ${minMembers} orang</p>
        <p><strong>Selisih:</strong> ${maxMembers - minMembers} orang</p>
    `;
    container.appendChild(statsDiv);
}

// Game functions
function startGame() {
    if (Object.keys(gameState.teams).length === 0) {
        showAlert('Tentukan tim terlebih dahulu!', 'warning');
        return;
    }
    
    // Reset game state untuk permainan baru
    gameState.roundNumber = 1;
    gameState.teamsPlayedThisRound = [];
    gameState.currentTeam = Object.keys(gameState.teams)[0];
    
    showModal('gameModal');
    startTurn();
}

function startTurn() {
    const team = gameState.teams[gameState.currentTeam];
    const allMembers = [team.ketua, ...team.anggota];
    const randomGuesser = allMembers[Math.floor(Math.random() * allMembers.length)];
    
    // Select random item
    const availableItems = daftarSesuatu.filter(item => 
        !gameState.usedItems.includes(item.nama)
    );
    
    if (availableItems.length === 0) {
        showAlert('Semua item sudah digunakan! Permainan selesai.', 'info');
        closeModal('gameModal');
        return;
    }
    
    gameState.currentItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    gameState.usedItems.push(gameState.currentItem.nama);
    
    // Prepare clues
    gameState.currentClues = [
        ...gameState.currentItem.clue_teks.map(clue => ({ type: 'teks', content: clue })),
        ...gameState.currentItem.clue_gerakan.map(clue => ({ type: 'gerakan', content: clue })),
        { type: 'pembantu', content: gameState.currentItem.clue_pembantu }
    ].sort(() => Math.random() - 0.5);
    
    gameState.currentClueIndex = 0;
    gameState.remainingClues = 10;
    
    const currentTeamElement = document.getElementById('currentTeam');
    const currentGuesserElement = document.getElementById('currentGuesser');
    const gameResultElement = document.getElementById('gameResult');
    const guessInputElement = document.getElementById('guessInput');
    
    if (currentTeamElement) currentTeamElement.textContent = gameState.currentTeam;
    if (currentGuesserElement) currentGuesserElement.textContent = randomGuesser;
    
    // Clear previous result
    if (gameResultElement) gameResultElement.innerHTML = '';
    if (guessInputElement) guessInputElement.value = '';
    
    showNextClue();
    
    // Update tombol "Clue Berikutnya" saat mulai turn baru
    setTimeout(() => {
        updateNextClueButton();
    }, 100);
}

function showNextClue() {
    if (gameState.currentClueIndex >= gameState.currentClues.length) {
        // Jika clue habis, akhiri giliran
        endTurn(false);
        return;
    }
    
    const clue = gameState.currentClues[gameState.currentClueIndex];
    const clueDisplay = document.getElementById('clueDisplay');
    if (!clueDisplay) return;
    
    const categoryName = gameState.currentItem.kategori === 'tokoh' ? 'Tokoh Penting' : 'Kejadian Besar';
    const categoryIcon = gameState.currentItem.kategori === 'tokoh' ? '👤' : '📅';
    
    clueDisplay.innerHTML = `
        <div class="clue-container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span class="clue-type ${clue.type}">${clue.type.toUpperCase()}</span>
                <span style="background: #e3f2fd; color: #1976d2; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem;">
                    ${categoryIcon} ${categoryName}
                </span>
            </div>
            <h4>${clue.content}</h4>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(gameState.remainingClues / 10) * 100}%"></div>
            </div>
            <p>Sisa clue: ${gameState.remainingClues}</p>
            <p>Clue ${gameState.currentClueIndex + 1} dari ${gameState.currentClues.length}</p>
        </div>
    `;
    
    gameState.currentClueIndex++;
    
    // Update tombol "Clue Berikutnya" berdasarkan sisa clue
    updateNextClueButton();
}

function updateNextClueButton() {
    const nextClueButton = document.querySelector('button[onclick="nextClue()"]');
    if (!nextClueButton) return;
    
    if (gameState.remainingClues <= 1) {
        // Disable tombol jika clue sisa 1 atau kurang
        nextClueButton.disabled = true;
        nextClueButton.style.opacity = '0.5';
        nextClueButton.style.cursor = 'not-allowed';
        nextClueButton.innerHTML = '<i class="fas fa-ban"></i> Clue Habis';
    } else {
        // Enable tombol jika masih ada clue
        nextClueButton.disabled = false;
        nextClueButton.style.opacity = '1';
        nextClueButton.style.cursor = 'pointer';
        nextClueButton.innerHTML = '<i class="fas fa-arrow-right"></i> Clue Berikutnya';
    }
}

function nextClue() {
    gameState.remainingClues--;
    if (gameState.remainingClues <= 0) {
        endTurn(false);
    } else {
        showNextClue();
    }
    // Update tombol setelah mengurangi remainingClues
    updateNextClueButton();
}

function submitGuess() {
    const guessInput = document.getElementById('guessInput');
    if (!guessInput) return;
    
    const guess = guessInput.value.trim();
    if (!guess) {
        showAlert('Masukkan tebakan Anda!', 'warning');
        return;
    }
    
    const isCorrect = isCorrectGuess(guess, gameState.currentItem.nama);
    
    if (isCorrect) {
        // Jawaban benar
        showSuccessAnimation();
        setTimeout(() => {
            endTurn(true, guess);
        }, 1000);
    } else {
        // Jawaban salah
        showWrongAnimation();
        setTimeout(() => {
            showWrongAnswer();
            gameState.remainingClues--;
            guessInput.value = '';
            
            // Tampilkan clue berikutnya atau akhiri giliran jika clue habis
            if (gameState.remainingClues <= 0) {
                endTurn(false, guess);
            } else {
                showNextClue();
            }
        }, 1000);
    }
}

function isCorrectGuess(guess, answer) {
    const similarity = calculateSimilarity(guess.toLowerCase(), answer.toLowerCase());
    return similarity >= 0.8;
}

function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

function showWrongAnswer() {
    const resultDiv = document.getElementById('gameResult');
    if (!resultDiv) return;
    
    resultDiv.innerHTML = `
        <div class="alert alert-warning">
            <h4>❌ Salah!</h4>
            <p>Coba lagi dengan clue berikutnya...</p>
        </div>
    `;
    
    // Hapus pesan setelah 2 detik
    setTimeout(() => {
        if (resultDiv) {
            resultDiv.innerHTML = '';
        }
    }, 2000);
}

function endTurn(isCorrect, guess = '') {
    const resultDiv = document.getElementById('gameResult');
    if (!resultDiv) return;
    
    const score = isCorrect ? 10 + (gameState.remainingClues * 2) : 0;
    
    gameState.scores[gameState.currentTeam] += score;
    gameState.gameHistory.push({
        tim: gameState.currentTeam,
        sesuatu: gameState.currentItem.nama,
        benar: isCorrect
    });
    
    let resultHTML = '';
    if (isCorrect) {
        resultHTML = `
            <div class="alert alert-success">
                <h4>✅ Benar!</h4>
                <p>Jawaban: ${gameState.currentItem.nama}</p>
                <p>Skor: ${score} poin</p>
                <p>Sisa clue: ${gameState.remainingClues}</p>
            </div>
        `;
        
        // Show score animation
        const scoreElement = document.querySelector('.score-board');
        if (scoreElement) {
            showScoreAnimation(score, scoreElement);
        }
    } else {
        // Tampilkan semua clue yang tersedia
        let allCluesHTML = '<h4>Semua Clue:</h4><ul>';
        gameState.currentClues.forEach((clue, index) => {
            allCluesHTML += `<li><strong>${clue.type.toUpperCase()}:</strong> ${clue.content}</li>`;
        });
        allCluesHTML += '</ul>';
        
        resultHTML = `
            <div class="alert alert-danger">
                <h4>❌ Salah!</h4>
                <p>Jawaban: ${gameState.currentItem.nama}</p>
                <p>Skor: 0 poin</p>
                <p>Clue habis!</p>
                ${allCluesHTML}
            </div>
        `;
    }
    
    resultDiv.innerHTML = resultHTML;
    
    setTimeout(() => {
        nextTeam();
    }, 3000);
}

function nextTeam() {
    const teamKeys = Object.keys(gameState.teams);
    const currentIndex = teamKeys.indexOf(gameState.currentTeam);
    const nextIndex = (currentIndex + 1) % teamKeys.length;
    
    // Tambahkan tim saat ini ke daftar yang sudah bermain di ronde ini
    if (!gameState.teamsPlayedThisRound.includes(gameState.currentTeam)) {
        gameState.teamsPlayedThisRound.push(gameState.currentTeam);
    }
    
    gameState.currentTeam = teamKeys[nextIndex];
    
    // Cek apakah semua tim sudah bermain di ronde ini
    if (gameState.teamsPlayedThisRound.length >= teamKeys.length) {
        // Satu ronde selesai - show round completion UI
        showRoundCompletion();
        return;
    }
    
    const gameResultElement = document.getElementById('gameResult');
    const guessInputElement = document.getElementById('guessInput');
    
    if (gameResultElement) gameResultElement.innerHTML = '';
    if (guessInputElement) guessInputElement.value = '';
    startTurn();
}

function showRoundCompletion() {
    const gameContent = document.getElementById('gameContent');
    if (!gameContent) return;
    
    const roundCompletionHTML = `
        <div class="current-player" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);">
            <h3>🎉 Ronde ${gameState.roundNumber} Selesai!</h3>
            <p>Semua tim telah bermain satu kali</p>
        </div>
        
        <div class="game-area">
            <div style="text-align: center; margin: 20px 0;">
                <h4>📊 Skor Sementara:</h4>
                <div class="score-board" style="margin: 15px 0;">
                    ${Object.entries(gameState.scores).map(([team, score], index) => {
                        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
                        return `<div class="score-item"><span>${medal} ${team}</span><span>${score} poin</span></div>`;
                    }).join('')}
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center; margin: 20px 0;">
                <button class="btn btn-success" onclick="continueGame()">
                    <i class="fas fa-play"></i> Lanjutkan Permainan
                </button>
                <button class="btn btn-warning" onclick="endGame()">
                    <i class="fas fa-stop"></i> Akhiri Permainan
                </button>
            </div>
        </div>
    `;
    
    gameContent.innerHTML = roundCompletionHTML;
}

function continueGame() {
    // Reset tracking untuk ronde baru
    gameState.roundNumber++;
    gameState.teamsPlayedThisRound = [];
    
    // Restore game modal content
    const gameContent = document.getElementById('gameContent');
    if (!gameContent) return;
    
    gameContent.innerHTML = `
        <div class="current-player" id="currentPlayer">
            <h3>Giliran: <span id="currentTeam">-</span></h3>
            <p>Penebak: <span id="currentGuesser">-</span></p>
        </div>
        
        <div class="game-area">
            <div id="clueDisplay"></div>
            <div class="guess-input">
                <input type="text" id="guessInput" class="form-control" placeholder="Masukkan tebakan Anda...">
                <button class="btn btn-success" onclick="submitGuess()">Tebak!</button>
                <button class="btn btn-secondary" onclick="nextClue()">Clue Berikutnya</button>
            </div>
            <div id="gameResult"></div>
        </div>
    `;
    
    startTurn();
    
    // Update tombol setelah restore game content
    setTimeout(() => {
        updateNextClueButton();
    }, 200);
}

function endGame() {
    closeModal('gameModal');
    showScoreBoard();
}

// Score functions
function showScoreBoard() {
    const content = document.getElementById('scoreContent');
    if (!content) return;
    
    const sortedScores = Object.entries(gameState.scores)
        .sort(([,a], [,b]) => b - a);
    
    let html = '<div class="score-board">';
    sortedScores.forEach(([team, score], index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
        html += `
            <div class="score-item">
                <span>${medal} ${team}</span>
                <span>${score} poin</span>
            </div>
        `;
    });
    html += '</div>';
    
    if (gameState.gameHistory.length > 0) {
        html += '<h3>Riwayat Permainan:</h3>';
        html += '<div class="team-list">';
        gameState.gameHistory.forEach(history => {
            const status = history.benar ? '✅' : '❌';
            html += `
                <div class="team-card">
                    <h4>${status} ${history.tim}</h4>
                    <p>${history.sesuatu}</p>
                </div>
            `;
        });
        html += '</div>';
    }
    
    content.innerHTML = html;
    showModal('scoreModal');
}

function showScoreSementara() {
    showScoreBoard();
}

function showStatusItem() {
    const content = document.getElementById('statusContent');
    if (!content) return;
    
    const totalItems = daftarSesuatu.length;
    const usedItems = gameState.usedItems.length;
    const availableItems = totalItems - usedItems;
    
    // Hitung per kategori
    const categoryStats = {};
    daftarSesuatu.forEach(item => {
        const category = item.kategori || 'tokoh';
        if (!categoryStats[category]) {
            categoryStats[category] = { total: 0, used: 0 };
        }
        categoryStats[category].total++;
        if (gameState.usedItems.includes(item.nama)) {
            categoryStats[category].used++;
        }
    });
    
    let html = `
        <div class="alert alert-info">
            <h4>📊 Statistik Item</h4>
            <p>Total: ${totalItems} | Digunakan: ${usedItems} | Tersedia: ${availableItems}</p>
        </div>
    `;
    
    // Tampilkan statistik per kategori
    html += '<h3>📈 Statistik per Kategori:</h3>';
    html += '<div class="team-list">';
    Object.entries(categoryStats).forEach(([category, stats]) => {
        const categoryName = category === 'tokoh' ? 'Tokoh Penting' : 'Kejadian Besar';
        const percentage = Math.round((stats.used / stats.total) * 100);
        html += `
            <div class="team-card">
                <h4>${categoryName}</h4>
                <p>Total: ${stats.total} | Digunakan: ${stats.used} | Tersisa: ${stats.total - stats.used}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <p>Progress: ${percentage}%</p>
            </div>
        `;
    });
    html += '</div>';
    
    if (gameState.usedItems.length > 0) {
        html += '<h3>🗂️ Item yang Sudah Digunakan:</h3>';
        html += '<div class="team-list">';
        gameState.usedItems.forEach((item, index) => {
            const itemData = daftarSesuatu.find(i => i.nama === item);
            const category = itemData ? (itemData.kategori === 'tokoh' ? '👤' : '📅') : '';
            html += `
                <div class="team-card">
                    <h4>${index + 1}. ${category} ${item}</h4>
                    <p>Kategori: ${itemData ? (itemData.kategori === 'tokoh' ? 'Tokoh Penting' : 'Kejadian Besar') : 'Tidak diketahui'}</p>
                </div>
            `;
        });
        html += '</div>';
    }
    
    content.innerHTML = html;
    showModal('statusModal');
}

// Function to select TXT file manually (now shows info)
function selectTXTFile() {
    showAlert('Data game sudah di-embed langsung dalam aplikasi. Tidak perlu file eksternal!', 'info');
}

// Function to open browser with CORS disabled
function openWithCORS() {
    Swal.fire({
        title: '🌐 Buka dengan CORS Disabled',
        html: `
            <div style="text-align: left;">
                <p><strong>Untuk membuka browser dengan CORS disabled:</strong></p>
                <ol style="text-align: left; margin: 10px 0;">
                    <li>Tutup browser ini</li>
                    <li>Buka Command Prompt/Terminal</li>
                    <li>Jalankan salah satu perintah:</li>
                </ol>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <p><strong>Brave:</strong></p>
                    <code>brave.exe --disable-web-security --user-data-dir="C:/temp/brave_dev"</code>
                    <br><br>
                    <p><strong>Chrome:</strong></p>
                    <code>chrome.exe --disable-web-security --user-data-dir="C:/temp/chrome_dev"</code>
                    <br><br>
                    <p><strong>Firefox:</strong></p>
                    <code>firefox.exe --disable-web-security</code>
                    <br><br>
                    <p><strong>Edge:</strong></p>
                    <code>msedge.exe --disable-web-security --user-data-dir="C:/temp/edge_dev"</code>
                </div>
                <p><strong>4.</strong> Buka file index.html di browser yang baru</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Mengerti',
        confirmButtonColor: '#667eea',
        width: '600px'
    });
}

// Function to use sample data
function useSampleData() {
    daftarSesuatu = [
        {
            nama: "Abraham",
            kategori: "tokoh",
            clue_teks: ["Bapak orang beriman", "Disebut bapak bangsa"],
            clue_gerakan: ["Mengangkat tangan ke langit", "Berjalan dengan tongkat"],
            clue_pembantu: "Dari Kitab Kejadian"
        },
        {
            nama: "Musa",
            kategori: "tokoh",
            clue_teks: ["Pemimpin bangsa Israel keluar dari Mesir", "Menerima 10 perintah Allah"],
            clue_gerakan: ["Mengangkat tongkat", "Membuka tangan"],
            clue_pembantu: "Dari Kitab Keluaran"
        },
        {
            nama: "Daud",
            kategori: "tokoh",
            clue_teks: ["Raja Israel yang kedua", "Mengalahkan Goliat"],
            clue_gerakan: ["Mengayunkan ketapel", "Memainkan kecapi"],
            clue_pembantu: "Dari Kitab Samuel"
        },
        {
            nama: "Yesus",
            kategori: "tokoh",
            clue_teks: ["Anak Allah", "Juru selamat dunia"],
            clue_gerakan: ["Membuka tangan seperti salib", "Mengangkat tangan memberkati"],
            clue_pembantu: "Dari Kitab Injil"
        },
        {
            nama: "Paulus",
            kategori: "tokoh",
            clue_teks: ["Rasul untuk bangsa-bangsa", "Dulunya penganiaya Kristen"],
            clue_gerakan: ["Menulis surat", "Berjalan jauh"],
            clue_pembantu: "Dari Kitab Kisah Para Rasul"
        },
        {
            nama: "Air Bah",
            kategori: "kejadian",
            clue_teks: ["Air menutupi seluruh bumi", "Hanya 8 orang yang selamat"],
            clue_gerakan: ["Menggerakkan tangan seperti ombak", "Membuat gerakan hujan"],
            clue_pembantu: "Dari Kitab Kejadian"
        },
        {
            nama: "Menara Babel",
            kategori: "kejadian",
            clue_teks: ["Manusia membangun menara tinggi", "Allah mengacaukan bahasa"],
            clue_gerakan: ["Membangun dengan tangan", "Mengacak-acak tangan"],
            clue_pembantu: "Dari Kitab Kejadian"
        },
        {
            nama: "Kelahiran Yesus",
            kategori: "kejadian",
            clue_teks: ["Dilahirkan di kandang domba", "Dikunjungi gembala dan majus"],
            clue_gerakan: ["Menggendong bayi", "Melihat ke langit"],
            clue_pembantu: "Dari Kitab Lukas"
        },
        {
            nama: "Salib",
            kategori: "kejadian",
            clue_teks: ["Yesus mati di kayu salib", "Untuk menebus dosa manusia"],
            clue_gerakan: ["Membuat tanda salib", "Mengangkat tangan"],
            clue_pembantu: "Dari Kitab Injil"
        },
        {
            nama: "Pentakosta",
            kategori: "kejadian",
            clue_teks: ["Roh Kudus turun", "Murid-murid berbicara bahasa lain"],
            clue_gerakan: ["Menggerakkan tangan seperti api", "Berbicara dengan semangat"],
            clue_pembantu: "Dari Kitab Kisah Para Rasul"
        }
    ];
    
    // Hide error panel and show success
    const dataInfoElement = document.getElementById('dataInfo');
    const dataErrorElement = document.getElementById('dataError');
    
    if (dataInfoElement) dataInfoElement.style.display = 'none';
    if (dataErrorElement) dataErrorElement.style.display = 'none';
    updateGameStatus();
    showAlert('✅ Berhasil menggunakan data sample!', 'success');
}

// Sound Effects (using Web Audio API)
let audioContext;
let sounds = {};
let audioInitialized = false;

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        createSounds();
        audioInitialized = true;
        console.log('Audio initialized successfully');
    } catch (e) {
        console.log('Audio not supported:', e);
        audioInitialized = false;
    }
}

function createSounds() {
    // Success sound
    sounds.success = createTone(800, 0.3, 0.1);
    sounds.wrong = createTone(200, 0.3, 0.1);
    sounds.click = createTone(400, 0.1, 0.05);
    sounds.point = createTone(600, 0.2, 0.1);
}

function createTone(frequency, duration, volume) {
    return function() {
        if (!audioContext || !audioInitialized) return;
        
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.log('Audio playback failed:', e);
        }
    };
}

function playSound(soundName) {
    // Initialize audio on first user interaction if not already initialized
    if (!audioInitialized) {
        initAudio();
    }
    
    // Resume audio context if suspended
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('Audio context resumed');
        }).catch(e => {
            console.log('Failed to resume audio context:', e);
        });
    }
    
    if (sounds[soundName] && audioInitialized) {
        sounds[soundName]();
    }
}

// Animation Functions
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 500);
    }
}

function showSuccessAnimation() {
    const animation = document.createElement('div');
    animation.className = 'success-animation';
    animation.innerHTML = '<div class="success-icon">✅</div>';
    document.body.appendChild(animation);
    
    playSound('success');
    createParticles();
    
    setTimeout(() => {
        animation.remove();
    }, 1000);
}

function showWrongAnimation() {
    const animation = document.createElement('div');
    animation.className = 'wrong-animation';
    animation.innerHTML = '<div class="wrong-icon">❌</div>';
    document.body.appendChild(animation);
    
    playSound('wrong');
    
    setTimeout(() => {
        animation.remove();
    }, 1000);
}

function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 0.5 + 's';
        particlesContainer.appendChild(particle);
    }
    
    setTimeout(() => {
        particlesContainer.remove();
    }, 2000);
}

function showScoreAnimation(score, element) {
    const scoreAnim = document.createElement('div');
    scoreAnim.className = 'score-animation';
    scoreAnim.textContent = `+${score}`;
    scoreAnim.style.left = element.offsetLeft + element.offsetWidth / 2 + 'px';
    scoreAnim.style.top = element.offsetTop + 'px';
    document.body.appendChild(scoreAnim);
    
    playSound('point');
    
    setTimeout(() => {
        scoreAnim.remove();
    }, 1000);
}

function updateLoadingText(text) {
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
        loadingText.textContent = text;
    }
}

// SweetAlert Helper Functions
function showConfirmDialog(message, onConfirm, title = 'Konfirmasi') {
    Swal.fire({
        title: title,
        text: message,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#dc3545',
        confirmButtonText: 'Ya',
        cancelButtonText: 'Tidak'
    }).then((result) => {
        if (result.isConfirmed) {
            onConfirm();
        }
    });
}

function showSuccessDialog(message, title = 'Berhasil!') {
    Swal.fire({
        title: title,
        text: message,
        icon: 'success',
        confirmButtonColor: '#28a745',
        timer: 2000,
        timerProgressBar: true
    });
}

function showErrorDialog(message, title = 'Error!') {
    Swal.fire({
        title: title,
        text: message,
        icon: 'error',
        confirmButtonColor: '#dc3545'
    });
}

// Initialize with loading screen
function initializeGame() {
    showLoadingScreen();

    // Simulate loading process
    setTimeout(() => {
        updateLoadingText('Memuat data permainan...');
    }, 1000);

    setTimeout(() => {
        updateLoadingText('Menyiapkan antarmuka...');
    }, 2000);

    setTimeout(() => {
        updateLoadingText('Hampir selesai...');
    }, 3000);

    setTimeout(() => {
        loadGameData().then(() => {
            updateGameStatus();
            hideLoadingScreen();
        });
    }, 4000);
}

// Wait for DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    // DOM is already loaded
    initializeGame();
}

// Initialize audio on first user interaction
function initializeAudioOnInteraction() {
    if (!audioInitialized) {
        initAudio();
        // Remove the event listeners after first interaction
        document.removeEventListener('click', initializeAudioOnInteraction);
        document.removeEventListener('touchstart', initializeAudioOnInteraction);
        document.removeEventListener('keydown', initializeAudioOnInteraction);
    }
}

// Add event listeners for user interaction
document.addEventListener('click', initializeAudioOnInteraction);
document.addEventListener('touchstart', initializeAudioOnInteraction);
document.addEventListener('keydown', initializeAudioOnInteraction); 