(function () {
    'use strict';

    const els = {
        chatMessages: document.getElementById('chatMessages'),
        userInput: document.getElementById('userInput'),
        sendBtn: document.getElementById('sendBtn'),
        welcomeScreen: document.getElementById('welcomeScreen'),
        groupFilter: document.getElementById('groupFilter'),
        categoryFilter: document.getElementById('categoryFilter'),
        newChatBtn: document.getElementById('newChatBtn'),
        menuToggle: document.getElementById('menuToggle'),
        sidebar: document.querySelector('.sidebar'),
        settingsBtn: document.getElementById('settingsBtn'),
        settingsModal: document.getElementById('settingsModal'),
        closeSettings: document.getElementById('closeSettings'),
        cfgProvider: document.getElementById('cfgProvider'),
        cfgBaseUrl: document.getElementById('cfgBaseUrl'),
        cfgModel: document.getElementById('cfgModel'),
        cfgApiKey: document.getElementById('cfgApiKey'),
        cfgTopK: document.getElementById('cfgTopK'),
        cfgTemperature: document.getElementById('cfgTemperature'),
        cfgEnabled: document.getElementById('cfgEnabled'),
        cfgUseProxy: document.getElementById('cfgUseProxy'),
        cfgProxyUrl: document.getElementById('cfgProxyUrl'),
        proxyUrlRow: document.getElementById('proxyUrlRow'),
        testConnection: document.getElementById('testConnection'),
        saveSettings: document.getElementById('saveSettings'),
        testResult: document.getElementById('testResult'),
        aiToggleCard: document.getElementById('aiToggleCard'),
        aiEnabledToggle: document.getElementById('aiEnabledToggle'),
        aiStatusLabel: document.getElementById('aiStatusLabel'),
        statusBadge: document.getElementById('statusBadge'),
        correctionModal: document.getElementById('correctionModal'),
        closeCorrection: document.getElementById('closeCorrection'),
        correctionContext: document.getElementById('correctionContext'),
        correctionSearch: document.getElementById('correctionSearch'),
        correctionList: document.getElementById('correctionList'),
        cancelCorrection: document.getElementById('cancelCorrection'),
        confirmCorrection: document.getElementById('confirmCorrection'),
        correctionCount: document.getElementById('correctionCount'),
        exportCorrections: document.getElementById('exportCorrections'),
        importCorrections: document.getElementById('importCorrections'),
        clearCorrections: document.getElementById('clearCorrections'),
        importFileInput: document.getElementById('importFileInput'),
        toast: document.getElementById('toast'),
        totalEntries: document.getElementById('totalEntries'),
        totalGroups: document.getElementById('totalGroups')
    };

    const data = (typeof ESCALATION_DATA !== 'undefined' ? ESCALATION_DATA : (window.ESCALATION_DATA || []));
    const searchIndex = window.EscSearch.buildIndex(data);
    const corrections = window.EscCorrections.createCorrectionsManager(data);
    let aiSettings = window.EscAI.loadSettings();

    let pendingCorrection = null;

    initStats();
    initFilters();
    initEvents();
    refreshAiUi();
    refreshCorrectionStats();

    function initStats() {
        els.totalEntries.textContent = data.length;
        const groups = new Set(data.map(d => d.group));
        els.totalGroups.textContent = groups.size;
    }

    function initFilters() {
        const groups = [...new Set(data.map(d => d.group))].sort();
        groups.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g;
            opt.textContent = g;
            els.groupFilter.appendChild(opt);
        });

        const categories = [...new Set(data.map(d => {
            const m = d.kip.match(/- (.+)$/);
            return m ? m[1].trim() : d.kip;
        }))].sort();
        categories.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            els.categoryFilter.appendChild(opt);
        });
    }

    function initEvents() {
        els.menuToggle.addEventListener('click', () => els.sidebar.classList.toggle('open'));
        document.addEventListener('click', e => {
            if (els.sidebar.classList.contains('open')
                && !els.sidebar.contains(e.target)
                && e.target !== els.menuToggle) {
                els.sidebar.classList.remove('open');
            }
        });

        els.newChatBtn.addEventListener('click', resetChat);

        els.sendBtn.addEventListener('click', handleSend);
        els.userInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });
        els.userInput.addEventListener('input', () => {
            els.userInput.style.height = 'auto';
            els.userInput.style.height = Math.min(els.userInput.scrollHeight, 120) + 'px';
        });

        bindQuickButtons();

        els.settingsBtn.addEventListener('click', openSettings);
        els.closeSettings.addEventListener('click', closeSettings);
        els.cfgProvider.addEventListener('change', applyProviderPreset);
        els.cfgUseProxy.addEventListener('change', () => {
            els.proxyUrlRow.hidden = !els.cfgUseProxy.checked;
        });
        els.testConnection.addEventListener('click', testAiConnection);
        els.saveSettings.addEventListener('click', persistSettingsForm);

        els.aiEnabledToggle.addEventListener('change', () => {
            if (els.aiEnabledToggle.checked && !canUseAi(aiSettings)) {
                els.aiEnabledToggle.checked = false;
                showToast('Konfigurasi AI dulu di pengaturan', 'error');
                openSettings();
                return;
            }
            aiSettings = window.EscAI.saveSettings({ ...aiSettings, enabled: els.aiEnabledToggle.checked });
            refreshAiUi();
        });

        els.closeCorrection.addEventListener('click', closeCorrectionModal);
        els.cancelCorrection.addEventListener('click', closeCorrectionModal);
        els.confirmCorrection.addEventListener('click', saveCorrection);
        els.correctionSearch.addEventListener('input', renderCorrectionOptions);

        els.exportCorrections.addEventListener('click', exportCorrections);
        els.importCorrections.addEventListener('click', () => els.importFileInput.click());
        els.importFileInput.addEventListener('change', importCorrectionsFromFile);
        els.clearCorrections.addEventListener('click', clearCorrectionsConfirm);

        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.addEventListener('click', e => {
                if (e.target === modal) modal.hidden = true;
            });
        });
    }

    function bindQuickButtons() {
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                els.userInput.value = btn.dataset.query;
                handleSend();
            });
        });
    }

    function resetChat() {
        els.chatMessages.innerHTML = '';
        els.chatMessages.appendChild(els.welcomeScreen);
        els.welcomeScreen.style.display = 'flex';
        bindQuickButtons();
    }

    async function handleSend() {
        const text = els.userInput.value.trim();
        if (!text) return;

        els.welcomeScreen.style.display = 'none';
        addMessage(text, 'user');
        els.userInput.value = '';
        els.userInput.style.height = 'auto';

        const typingEl = addTyping();

        const useAi = aiSettings.enabled && canUseAi(aiSettings);

        try {
            if (useAi) {
                const aiResponse = await window.EscAI.callAI(aiSettings, text, data, corrections.listAll());
                typingEl.remove();

                if (!aiResponse.picks || !aiResponse.picks.length) {
                    addBotError('AI tidak menemukan kandidat yang cocok. Memakai pencarian lokal.');
                    const localResults = window.EscSearch.searchEscalation(text, data, searchIndex, {
                        groupFilter: els.groupFilter.value,
                        categoryFilter: els.categoryFilter.value,
                        corrections
                    });
                    renderLocalResults(text, localResults);
                } else {
                    renderAiResponse(text, aiResponse);
                }
            } else {
                await delay(300 + Math.random() * 300);
                const results = window.EscSearch.searchEscalation(text, data, searchIndex, {
                    groupFilter: els.groupFilter.value,
                    categoryFilter: els.categoryFilter.value,
                    corrections
                });
                typingEl.remove();
                renderLocalResults(text, results);
            }
        } catch (err) {
            typingEl.remove();
            console.error('Search error:', err);
            const localResults = window.EscSearch.searchEscalation(text, data, searchIndex, {
                groupFilter: els.groupFilter.value,
                categoryFilter: els.categoryFilter.value,
                corrections
            });
            addBotError(`AI gagal: ${err.message}. Memakai pencarian lokal sebagai fallback.`);
            renderLocalResults(text, localResults);
        }

        scrollChatToBottom();
    }

    function renderLocalResults(query, results) {
        const div = document.createElement('div');
        div.className = 'message bot';

        let html = '<div class="message-avatar">EB</div><div class="message-content">';

        if (!results.length) {
            html += emptyResultHtml(query);
        } else {
            const shown = Math.min(5, results.length);
            html += `<p>Saya menemukan <strong>${results.length}</strong> hasil yang cocok`;
            if (results.length > 5) html += ` - menampilkan <strong>${shown} teratas</strong>`;
            html += '.</p>';
            html += renderResultCards(query, results.slice(0, shown));
        }

        html += '</div>';
        div.innerHTML = html;
        els.chatMessages.appendChild(div);
        attachResultActions(div, query, results.slice(0, 5));
    }

    function renderAiResponse(query, aiResponse) {
        const div = document.createElement('div');
        div.className = 'message bot';

        let html = '<div class="message-avatar">EB</div><div class="message-content">';

        if (!aiResponse.picks || !aiResponse.picks.length) {
            html += emptyResultHtml(query);
        } else {
            html += `<p>Berdasarkan analisis AI <span class="ai-badge">${escapeHtml(aiResponse.modelUsed)}</span>, ditemukan <strong>${aiResponse.picks.length}</strong> rekomendasi:</p>`;
            if (aiResponse.reasoning) {
                html += `<div class="ai-reasoning">${escapeHtml(aiResponse.reasoning)}</div>`;
            }
            html += renderResultCards(query, aiResponse.picks);
        }

        html += '</div>';
        div.innerHTML = html;
        els.chatMessages.appendChild(div);
        attachResultActions(div, query, aiResponse.picks || []);
    }

    function renderResultCards(query, picks) {
        return picks.map((r, i) => {
            const scoreClass = r.score >= 75 ? 'score-high' : r.score >= 45 ? 'score-medium' : 'score-low';
            const scoreLabel = r.score >= 75 ? 'Tinggi' : r.score >= 45 ? 'Sedang' : 'Rendah';
            const matched = (r._matched && r._matched.length)
                ? `<div class="matched-tokens">Match: ${r._matched.map(t => `<span class="matched-token">${escapeHtml(t)}</span>`).join('')}</div>`
                : '';
            const why = r._why ? `<div class="matched-tokens" style="font-style:italic;color:var(--text-secondary)">${escapeHtml(r._why)}</div>` : '';

            return `
            <div class="result-card" data-idx="${r._idx}">
                <div class="result-header">Hasil #${i + 1} <span class="result-score ${scoreClass}">${scoreLabel} (${r.score}%)</span></div>
                <div class="result-group">${escapeHtml(r.group)}</div>
                <div class="result-kip">${escapeHtml(r.kip)}</div>
                <div class="result-hashtag" data-hashtag="${escapeHtml(r.hashtag)}" title="Klik untuk copy">
                    ${escapeHtml(r.hashtag)}
                    <span class="copy-hint">Copy</span>
                </div>
                ${matched}${why}
                <div class="result-actions">
                    <button class="result-action-btn btn-confirm" data-action="confirm" data-idx="${r._idx}">Benar, pakai ini</button>
                    <button class="result-action-btn btn-correct" data-action="correct" data-idx="${r._idx}">Group salah, koreksi</button>
                </div>
            </div>`;
        }).join('');
    }

    function emptyResultHtml(query) {
        return `<p>Maaf, saya tidak menemukan hashtag eskalasi yang cocok untuk: "<strong>${escapeHtml(query)}</strong>"</p>
                <p style="margin-top:8px;color:var(--text-muted);font-size:0.85rem">Coba gunakan kata kunci yang lebih spesifik, atau aktifkan AI Mode untuk pencocokan semantik.</p>`;
    }

    function attachResultActions(container, query, picks) {
        container.querySelectorAll('.result-hashtag').forEach(el => {
            el.addEventListener('click', () => copyHashtag(el));
        });
        container.querySelectorAll('.result-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx, 10);
                const accepted = data[idx];
                const others = picks.filter(p => p._idx !== idx);

                if (btn.dataset.action === 'confirm') {
                    corrections.recordCorrection({
                        query,
                        acceptedEntry: accepted,
                        rejectedEntries: others,
                        type: 'confirm'
                    });
                    refreshCorrectionStats();
                    showToast('Tersimpan - bot akan ingat preferensi ini', 'success');
                } else if (btn.dataset.action === 'correct') {
                    openCorrectionModal({
                        query,
                        wrongEntry: accepted,
                        otherShown: picks
                    });
                }
            });
        });
    }

    function copyHashtag(el) {
        const text = el.dataset.hashtag || el.textContent.replace(/Copy$/, '').trim();
        navigator.clipboard.writeText(text).then(() => {
            el.classList.add('copied');
            const hint = el.querySelector('.copy-hint');
            if (hint) hint.textContent = 'Copied';
            setTimeout(() => {
                el.classList.remove('copied');
                if (hint) hint.textContent = 'Copy';
            }, 1800);
        }).catch(() => showToast('Clipboard tidak tersedia', 'error'));
    }

    function addMessage(text, type) {
        const div = document.createElement('div');
        div.className = `message ${type}`;
        const avatar = type === 'user' ? 'You' : 'EB';
        div.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">${escapeHtml(text)}</div>
        `;
        els.chatMessages.appendChild(div);
        scrollChatToBottom();
        return div;
    }

    function addTyping() {
        const div = document.createElement('div');
        div.className = 'message bot';
        div.innerHTML = `
            <div class="message-avatar">EB</div>
            <div class="message-content">
                <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>
        `;
        els.chatMessages.appendChild(div);
        scrollChatToBottom();
        return div;
    }

    function addBotError(message) {
        const div = document.createElement('div');
        div.className = 'message bot';
        div.innerHTML = `
            <div class="message-avatar">EB</div>
            <div class="message-content" style="color:#ff7675;border-color:#ff7675">${escapeHtml(message)}</div>
        `;
        els.chatMessages.appendChild(div);
    }

    function scrollChatToBottom() {
        els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
    }

    function openSettings() {
        els.cfgProvider.value = aiSettings.provider || '9router';
        els.cfgBaseUrl.value = aiSettings.baseUrl || '';
        els.cfgModel.value = aiSettings.model || '';
        els.cfgApiKey.value = aiSettings.apiKey || '';
        els.cfgTopK.value = aiSettings.topK || 8;
        els.cfgTemperature.value = aiSettings.temperature ?? 0.1;
        els.cfgEnabled.checked = !!aiSettings.enabled;
        els.cfgUseProxy.checked = !!aiSettings.useProxy;
        els.cfgProxyUrl.value = aiSettings.proxyUrl || 'proxy.php';
        els.proxyUrlRow.hidden = !els.cfgUseProxy.checked;
        els.testResult.hidden = true;
        els.settingsModal.hidden = false;
    }

    function closeSettings() {
        els.settingsModal.hidden = true;
    }

    function applyProviderPreset() {
        const preset = window.EscAI.PROVIDER_PRESETS[els.cfgProvider.value];
        if (!preset) return;
        els.cfgBaseUrl.value = preset.baseUrl;
        els.cfgModel.value = preset.defaultModel;
    }

    async function testAiConnection() {
        const candidate = readSettingsForm();
        els.testResult.hidden = false;
        els.testResult.className = 'test-result';
        els.testResult.textContent = 'Testing...';

        try {
            const reply = await window.EscAI.pingAI(candidate);
            els.testResult.classList.add('success');
            els.testResult.textContent = `OK - ${candidate.model} merespons: "${reply}"`;
        } catch (err) {
            els.testResult.classList.add('error');
            els.testResult.textContent = `Gagal: ${err.message}`;
        }
    }

    function readSettingsForm() {
        return {
            ...aiSettings,
            provider: els.cfgProvider.value,
            baseUrl: els.cfgBaseUrl.value.trim(),
            model: els.cfgModel.value.trim(),
            apiKey: els.cfgApiKey.value.trim(),
            topK: parseInt(els.cfgTopK.value, 10) || 8,
            temperature: parseFloat(els.cfgTemperature.value) || 0,
            enabled: els.cfgEnabled.checked,
            useProxy: els.cfgUseProxy.checked,
            proxyUrl: els.cfgProxyUrl.value.trim() || 'proxy.php'
        };
    }

    function persistSettingsForm() {
        const next = readSettingsForm();
        if (next.enabled && !canUseAi(next)) {
            showToast('Lengkapi base URL, model, dan API key sebelum mengaktifkan', 'error');
            return;
        }
        aiSettings = window.EscAI.saveSettings(next);
        refreshAiUi();
        closeSettings();
        showToast('Pengaturan disimpan', 'success');
    }

    function canUseAi(s) {
        if (!s.baseUrl || !s.model) return false;
        if (s.provider !== 'ollama' && !s.apiKey) return false;
        return true;
    }

    function refreshAiUi() {
        const ready = canUseAi(aiSettings);
        els.aiEnabledToggle.checked = !!(aiSettings.enabled && ready);
        els.aiToggleCard.classList.toggle('active', els.aiEnabledToggle.checked);

        if (!ready) {
            els.aiStatusLabel.textContent = 'Belum dikonfigurasi';
        } else if (aiSettings.enabled) {
            els.aiStatusLabel.textContent = `${labelFor(aiSettings.provider)} - ${aiSettings.model}`;
        } else {
            els.aiStatusLabel.textContent = 'Siap, tapi belum aktif';
        }

        els.statusBadge.textContent = els.aiEnabledToggle.checked ? 'AI Mode' : 'Local Search';
        els.statusBadge.classList.toggle('ai-on', els.aiEnabledToggle.checked);
    }

    function labelFor(providerKey) {
        return window.EscAI.PROVIDER_PRESETS[providerKey]?.label || providerKey;
    }

    function openCorrectionModal({ query, wrongEntry, otherShown }) {
        pendingCorrection = {
            query,
            wrongEntry,
            otherShown,
            chosenIdx: null
        };
        els.correctionContext.innerHTML = `
            Query: <em>"${escapeHtml(query)}"</em><br>
            Hashtag yang salah: <strong>${escapeHtml(wrongEntry.group)}</strong> - ${escapeHtml(wrongEntry.kip)}
        `;
        els.correctionSearch.value = '';
        renderCorrectionOptions();
        els.confirmCorrection.disabled = true;
        els.correctionModal.hidden = false;
        setTimeout(() => els.correctionSearch.focus(), 50);
    }

    function closeCorrectionModal() {
        els.correctionModal.hidden = true;
        pendingCorrection = null;
    }

    function renderCorrectionOptions() {
        if (!pendingCorrection) return;
        const q = els.correctionSearch.value.trim();
        let candidates;
        if (q.length < 2) {
            candidates = window.EscSearch.searchEscalation(pendingCorrection.query, data, searchIndex, { corrections })
                .slice(0, 30);
        } else {
            candidates = window.EscSearch.searchEscalation(q, data, searchIndex, {})
                .slice(0, 30);
        }

        if (!candidates.length) {
            els.correctionList.innerHTML = '<div class="correction-empty">Tidak ada hasil. Coba kata kunci lain.</div>';
            return;
        }

        els.correctionList.innerHTML = candidates.map(c => `
            <div class="correction-option" data-idx="${c._idx}">
                <div class="opt-group">${escapeHtml(c.group)}</div>
                <div class="opt-kip">${escapeHtml(c.kip)}</div>
                <div class="opt-hashtag">${escapeHtml(c.hashtag)}</div>
            </div>
        `).join('');

        els.correctionList.querySelectorAll('.correction-option').forEach(el => {
            el.addEventListener('click', () => {
                els.correctionList.querySelectorAll('.correction-option').forEach(x => x.classList.remove('selected'));
                el.classList.add('selected');
                pendingCorrection.chosenIdx = parseInt(el.dataset.idx, 10);
                els.confirmCorrection.disabled = false;
            });
        });
    }

    function saveCorrection() {
        if (!pendingCorrection || pendingCorrection.chosenIdx == null) return;
        const accepted = data[pendingCorrection.chosenIdx];
        const rejected = [
            pendingCorrection.wrongEntry,
            ...(pendingCorrection.otherShown || []).filter(o => o._idx !== pendingCorrection.chosenIdx && o._idx !== pendingCorrection.wrongEntry._idx)
        ];

        corrections.recordCorrection({
            query: pendingCorrection.query,
            acceptedEntry: accepted,
            rejectedEntries: rejected,
            type: 'correction'
        });

        refreshCorrectionStats();
        closeCorrectionModal();
        showToast('Koreksi disimpan - bot akan belajar dari ini', 'success');
    }

    function refreshCorrectionStats() {
        const s = corrections.stats();
        els.correctionCount.textContent = s.total;
    }

    function exportCorrections() {
        const json = corrections.exportJson();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `escbot-corrections-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Koreksi diunduh', 'success');
    }

    function importCorrectionsFromFile(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const mode = confirm('OK = gabungkan dengan koreksi yang ada, Cancel = ganti total') ? 'merge' : 'replace';
                const total = corrections.importJson(ev.target.result, mode);
                refreshCorrectionStats();
                showToast(`Berhasil. Total ${total} koreksi tersimpan.`, 'success');
            } catch (err) {
                showToast('File tidak valid: ' + err.message, 'error');
            }
            els.importFileInput.value = '';
        };
        reader.readAsText(file);
    }

    function clearCorrectionsConfirm() {
        if (!confirm('Hapus SEMUA koreksi yang sudah dipelajari? Tindakan ini tidak bisa dibatalkan.')) return;
        corrections.clearAll();
        refreshCorrectionStats();
        showToast('Koreksi dihapus', 'success');
    }

    function showToast(message, type) {
        els.toast.textContent = message;
        els.toast.className = 'toast' + (type ? ' ' + type : '');
        els.toast.hidden = false;
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => { els.toast.hidden = true; }, 3000);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = String(str ?? '');
        return div.innerHTML;
    }

    function delay(ms) {
        return new Promise(res => setTimeout(res, ms));
    }
})();
