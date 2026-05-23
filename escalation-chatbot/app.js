(function () {
    'use strict';

    const els = {
        chatMessages: document.getElementById('chatMessages'),
        userInput: document.getElementById('userInput'),
        sendBtn: document.getElementById('sendBtn'),
        welcomeScreen: document.getElementById('welcomeScreen'),
        newChatBtn: document.getElementById('newChatBtn'),
        menuToggle: document.getElementById('menuToggle'),
        sidebar: document.querySelector('.sidebar'),
        settingsBtn: document.getElementById('settingsBtn'),
        settingsModal: document.getElementById('settingsModal'),
        closeSettings: document.getElementById('closeSettings'),
        guideBtn: document.getElementById('guideBtn'),
        guideModal: document.getElementById('guideModal'),
        closeGuide: document.getElementById('closeGuide'),
        guideStart: document.getElementById('guideStart'),
        guideDontShow: document.getElementById('guideDontShow'),
        cfgProvider: document.getElementById('cfgProvider'),
        cfgBaseUrl: document.getElementById('cfgBaseUrl'),
        cfgModel: document.getElementById('cfgModel'),
        apiKeysList: document.getElementById('apiKeysList'),
        addApiKeyBtn: document.getElementById('addApiKeyBtn'),
        cfgTopK: document.getElementById('cfgTopK'),
        cfgTemperature: document.getElementById('cfgTemperature'),
        cfgEnabled: document.getElementById('cfgEnabled'),
        cfgUseProxy: document.getElementById('cfgUseProxy'),
        cfgProxyUrl: document.getElementById('cfgProxyUrl'),
        proxyUrlRow: document.getElementById('proxyUrlRow'),
        testConnection: document.getElementById('testConnection'),
        saveSettings: document.getElementById('saveSettings'),
        testResult: document.getElementById('testResult'),
        testResultList: document.getElementById('testResultList'),
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
        totalGroups: document.getElementById('totalGroups'),
        historyList: document.getElementById('historyList'),
        exportHistory: document.getElementById('exportHistory'),
        clearHistory: document.getElementById('clearHistory'),
        discussionBanner: document.getElementById('discussionBanner'),
        discussionContext: document.getElementById('discussionContext'),
        cancelDiscussion: document.getElementById('cancelDiscussion'),
        unsavedBanner: document.getElementById('unsavedBanner'),
        unsavedBannerText: document.getElementById('unsavedBannerText'),
        unsavedExportCorr: document.getElementById('unsavedExportCorr'),
        unsavedExportHist: document.getElementById('unsavedExportHist'),
        unsavedDismiss: document.getElementById('unsavedDismiss')
    };

    const data = (typeof ESCALATION_DATA !== 'undefined' ? ESCALATION_DATA : (window.ESCALATION_DATA || []));
    const searchIndex = window.EscSearch.buildIndex(data);
    const corrections = window.EscCorrections.createCorrectionsManager(data);
    const history = window.EscHistory.createHistoryManager();
    let aiSettings = window.EscAI.loadSettings();

    let pendingCorrection = null;
    let workingApiKeys = [];
    let statusRefreshTimer = null;
    let currentThreadId = null;
    let currentDiscussion = null;
    let unsavedBannerDismissed = false;

    const EXPORT_TS_KEY = 'escbot.lastExports.v1';

    function loadLastExports() {
        try {
            const raw = localStorage.getItem(EXPORT_TS_KEY);
            return raw ? JSON.parse(raw) : { corrections: null, history: null };
        } catch (e) {
            return { corrections: null, history: null };
        }
    }

    function setLastExport(kind) {
        const state = loadLastExports();
        state[kind] = new Date().toISOString();
        try { localStorage.setItem(EXPORT_TS_KEY, JSON.stringify(state)); } catch (e) {}
    }

    function hasUnsavedData() {
        const exports = loadLastExports();
        const corrStats = corrections.stats();
        const histStats = history.stats();

        const corrPending = corrStats.total > 0
            && (!exports.corrections || (corrStats.updatedAt && corrStats.updatedAt > exports.corrections));
        const histPending = histStats.totalThreads > 0
            && (!exports.history || (histStats.updatedAt && histStats.updatedAt > exports.history));

        return { corrPending, histPending, anyPending: corrPending || histPending, corrStats, histStats };
    }

    function refreshUnsavedBanner() {
        if (unsavedBannerDismissed) {
            els.unsavedBanner.hidden = true;
            return;
        }
        const status = hasUnsavedData();
        if (!status.anyPending) {
            els.unsavedBanner.hidden = true;
            return;
        }
        const parts = [];
        if (status.corrPending) parts.push(`<strong>${status.corrStats.total} koreksi</strong>`);
        if (status.histPending) parts.push(`<strong>${status.histStats.totalThreads} thread</strong>`);
        els.unsavedBannerText.innerHTML = `Ada ${parts.join(' & ')} belum di-export. Jangan lupa download sebelum tutup tab.`;
        els.unsavedExportCorr.hidden = !status.corrPending;
        els.unsavedExportHist.hidden = !status.histPending;
        els.unsavedBanner.hidden = false;
    }

    initStats();
    initEvents();
    refreshAiUi();
    refreshCorrectionStats();
    renderHistoryList();
    refreshUnsavedBanner();
    maybeShowGuide();

    function initStats() {
        els.totalEntries.textContent = data.length;
        const groups = new Set(data.map(d => d.group));
        els.totalGroups.textContent = groups.size;
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
        els.addApiKeyBtn.addEventListener('click', () => addKeyRow());

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

        els.exportHistory.addEventListener('click', exportHistory);
        els.clearHistory.addEventListener('click', clearHistoryConfirm);

        els.cancelDiscussion.addEventListener('click', cancelDiscussion);

        els.unsavedExportCorr.addEventListener('click', exportCorrections);
        els.unsavedExportHist.addEventListener('click', exportHistory);
        els.unsavedDismiss.addEventListener('click', () => {
            unsavedBannerDismissed = true;
            els.unsavedBanner.hidden = true;
        });

        window.addEventListener('beforeunload', e => {
            const status = hasUnsavedData();
            if (!status.anyPending) return;
            const parts = [];
            if (status.corrPending) parts.push(`${status.corrStats.total} koreksi`);
            if (status.histPending) parts.push(`${status.histStats.totalThreads} thread riwayat`);
            const msg = `Anda punya ${parts.join(' dan ')} yang belum di-export. Yakin mau tutup tab?`;
            e.preventDefault();
            e.returnValue = msg;
            return msg;
        });

        if (els.guideBtn) els.guideBtn.addEventListener('click', openGuide);
        if (els.closeGuide) els.closeGuide.addEventListener('click', closeGuide);
        if (els.guideStart) els.guideStart.addEventListener('click', closeGuide);

        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.addEventListener('click', e => {
                if (e.target === modal) {
                    modal.hidden = true;
                    if (modal === els.settingsModal) stopStatusRefresh();
                }
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
        currentThreadId = null;
        if (currentDiscussion) {
            currentDiscussion = null;
            hideDiscussionBanner();
            els.userInput.placeholder = 'Deskripsikan kendala atau kebutuhan Anda...';
        }
        els.chatMessages.innerHTML = '';
        els.chatMessages.appendChild(els.welcomeScreen);
        els.welcomeScreen.style.display = 'flex';
        bindQuickButtons();
        renderHistoryList();
    }

    async function handleSend() {
        const text = els.userInput.value.trim();
        if (!text) return;

        els.welcomeScreen.style.display = 'none';
        addMessage(text, 'user');
        els.userInput.value = '';
        els.userInput.style.height = 'auto';

        ensureThread(text);
        history.appendMessage(currentThreadId, { role: 'user', content: text });

        const typingEl = addTyping();

        if (currentDiscussion) {
            await handleDiscussionTurn(text, typingEl);
            return;
        }

        const useAi = aiSettings.enabled && canUseAi(aiSettings);

        try {
            if (useAi) {
                const aiResponse = await window.EscAI.callAI(aiSettings, text, data, corrections.listAll());
                typingEl.remove();

                if (!aiResponse.picks || !aiResponse.picks.length) {
                    addBotError('AI tidak menemukan kandidat yang cocok. Memakai pencarian lokal.');
                    history.appendMessage(currentThreadId, {
                        role: 'bot',
                        kind: 'error',
                        content: 'AI tidak menemukan kandidat yang cocok. Memakai pencarian lokal.'
                    });
                    const localResults = window.EscSearch.searchEscalation(text, data, searchIndex, { corrections });
                    renderLocalResults(text, localResults);
                    history.appendMessage(currentThreadId, {
                        role: 'bot',
                        kind: 'local',
                        content: '',
                        picks: localResults.slice(0, 5)
                    });
                } else {
                    renderAiResponse(text, aiResponse);
                    history.appendMessage(currentThreadId, {
                        role: 'bot',
                        kind: 'ai',
                        content: aiResponse.reasoning || '',
                        picks: aiResponse.picks,
                        reasoning: aiResponse.reasoning,
                        modelUsed: aiResponse.modelUsed,
                        keyUsed: aiResponse.keyUsed
                    });
                }
            } else {
                await delay(300 + Math.random() * 300);
                const results = window.EscSearch.searchEscalation(text, data, searchIndex, { corrections });
                typingEl.remove();
                renderLocalResults(text, results);
                history.appendMessage(currentThreadId, {
                    role: 'bot',
                    kind: 'local',
                    content: '',
                    picks: results.slice(0, 5)
                });
            }
        } catch (err) {
            typingEl.remove();
            console.error('Search error:', err);
            const localResults = window.EscSearch.searchEscalation(text, data, searchIndex, { corrections });
            const errMsg = `AI gagal: ${err.message}. Memakai pencarian lokal sebagai fallback.`;
            addBotError(errMsg);
            renderLocalResults(text, localResults);
            history.appendMessage(currentThreadId, { role: 'bot', kind: 'error', content: errMsg });
            history.appendMessage(currentThreadId, {
                role: 'bot',
                kind: 'local',
                content: '',
                picks: localResults.slice(0, 5)
            });
        }

        renderHistoryList();
        scrollChatToBottom();
    }

    function ensureThread(firstMessage) {
        if (currentThreadId && history.getThread(currentThreadId)) return;
        const thread = history.createThread(firstMessage);
        currentThreadId = thread.id;
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
            const keyMeta = aiResponse.keyUsed;
            const keyBadge = keyMeta
                ? `<span class="key-badge${keyMeta.rotated ? ' rotated' : ''}" title="${keyMeta.rotated ? 'Request di-rotate ke key ini setelah key lain gagal/cooldown' : 'Key yang dipakai untuk request ini'}">Key: ${escapeHtml(keyMeta.label)}${keyMeta.rotated ? ' (rotated)' : ''}</span>`
                : '';
            html += `<p>Berdasarkan analisis AI <span class="ai-badge">${escapeHtml(aiResponse.modelUsed)}</span>${keyBadge}, ditemukan <strong>${aiResponse.picks.length}</strong> rekomendasi:</p>`;
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
        const aiReady = aiSettings.enabled && canUseAi(aiSettings);
        return picks.map((r, i) => {
            const scoreClass = r.score >= 75 ? 'score-high' : r.score >= 45 ? 'score-medium' : 'score-low';
            const scoreLabel = r.score >= 75 ? 'Tinggi' : r.score >= 45 ? 'Sedang' : 'Rendah';
            const matched = (r._matched && r._matched.length)
                ? `<div class="matched-tokens">Match: ${r._matched.map(t => `<span class="matched-token">${escapeHtml(t)}</span>`).join('')}</div>`
                : '';
            const why = r._why ? `<div class="matched-tokens" style="font-style:italic;color:var(--text-secondary)">${escapeHtml(r._why)}</div>` : '';
            const revisedBadge = r._aiRevised ? '<span class="revised-badge" title="Hasil revisi diskusi AI">REVISED</span>' : '';
            const discussBtn = aiReady
                ? `<button class="result-action-btn btn-discuss" data-action="discuss" data-idx="${r._idx}" title="Diskusikan koreksi dengan AI">Diskusi dgn AI</button>`
                : '';

            return `
            <div class="result-card" data-idx="${r._idx}">
                <div class="result-header">Hasil #${i + 1}${revisedBadge} <span class="result-score ${scoreClass}">${scoreLabel} (${r.score}%)</span></div>
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
                    ${discussBtn}
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
                    if (currentDiscussion) {
                        saveRevisedCorrection(idx);
                        return;
                    }
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
                } else if (btn.dataset.action === 'discuss') {
                    startDiscussion({
                        query,
                        wrongEntry: accepted,
                        previousPicks: picks
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
        els.cfgTopK.value = aiSettings.topK || 8;
        els.cfgTemperature.value = aiSettings.temperature ?? 0.1;
        els.cfgEnabled.checked = !!aiSettings.enabled;
        els.cfgUseProxy.checked = !!aiSettings.useProxy;
        els.cfgProxyUrl.value = aiSettings.proxyUrl || 'proxy.php';
        els.proxyUrlRow.hidden = !els.cfgUseProxy.checked;

        workingApiKeys = (aiSettings.apiKeys || []).map(k => ({
            id: k.id,
            key: k.key,
            label: k.label || ''
        }));
        if (!workingApiKeys.length && aiSettings.provider !== 'ollama') {
            workingApiKeys.push({ id: window.EscAI.genKeyId(), key: '', label: '' });
        }
        renderKeysList();

        els.testResult.hidden = true;
        els.testResultList.hidden = true;
        els.testResultList.innerHTML = '';
        els.settingsModal.hidden = false;
        startStatusRefresh();
    }

    function closeSettings() {
        els.settingsModal.hidden = true;
        stopStatusRefresh();
    }

    function startStatusRefresh() {
        stopStatusRefresh();
        statusRefreshTimer = setInterval(refreshKeyStatuses, 5000);
    }

    function stopStatusRefresh() {
        if (statusRefreshTimer) {
            clearInterval(statusRefreshTimer);
            statusRefreshTimer = null;
        }
    }

    function refreshKeyStatuses() {
        const baseUrl = els.cfgBaseUrl.value.trim();
        if (!baseUrl) return;
        const rows = els.apiKeysList.querySelectorAll('.api-key-row');
        rows.forEach(row => {
            const keyId = row.dataset.keyId;
            const dot = row.querySelector('.api-key-status');
            if (!dot || !keyId) return;
            const status = window.EscAI.getKeyStatus(keyId, baseUrl);
            const statusClass = status.state === 'cooldown' ? 'cooldown' : 'ready';
            dot.className = `api-key-status ${statusClass}`;
            dot.title = status.state === 'cooldown'
                ? `Cooldown ${status.secondsLeft}s (${status.reason})`
                : 'Ready';
        });
    }

    function renderKeysList() {
        const baseUrl = els.cfgBaseUrl.value.trim();
        const isOllama = els.cfgProvider.value === 'ollama';

        if (isOllama) {
            els.apiKeysList.innerHTML = '<div class="api-keys-empty-note">Ollama lokal tidak butuh API key.</div>';
            els.addApiKeyBtn.disabled = true;
            return;
        }

        els.addApiKeyBtn.disabled = false;
        els.apiKeysList.innerHTML = '';

        workingApiKeys.forEach((k, idx) => {
            const status = baseUrl ? window.EscAI.getKeyStatus(k.id, baseUrl) : { state: 'ready', secondsLeft: 0 };
            const statusClass = status.state === 'cooldown' ? 'cooldown' : 'ready';
            const statusTitle = status.state === 'cooldown'
                ? `Cooldown ${status.secondsLeft}s (${status.reason})`
                : 'Ready';

            const row = document.createElement('div');
            row.className = 'api-key-row';
            row.dataset.keyId = k.id;
            row.innerHTML = `
                <span class="api-key-status ${statusClass}" title="${escapeHtml(statusTitle)}"></span>
                <input type="text" class="api-key-label" placeholder="Label (opsional)" value="${escapeHtml(k.label)}" data-field="label">
                <input type="password" class="api-key-value" placeholder="${idx === 0 ? 'sk-... atau API key utama' : 'API key cadangan'}" value="${escapeHtml(k.key)}" autocomplete="off" data-field="key">
                <button type="button" class="btn-remove-key" title="Hapus key" data-action="remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>
                </button>
            `;
            els.apiKeysList.appendChild(row);

            row.querySelector('[data-field="label"]').addEventListener('input', e => {
                k.label = e.target.value;
            });
            row.querySelector('[data-field="key"]').addEventListener('input', e => {
                k.key = e.target.value.trim();
            });
            row.querySelector('[data-action="remove"]').addEventListener('click', () => removeKeyRow(k.id));
        });
    }

    function addKeyRow() {
        if (els.cfgProvider.value === 'ollama') return;
        workingApiKeys.push({ id: window.EscAI.genKeyId(), key: '', label: '' });
        renderKeysList();
        const rows = els.apiKeysList.querySelectorAll('.api-key-row');
        const lastRow = rows[rows.length - 1];
        if (lastRow) {
            const valueInput = lastRow.querySelector('.api-key-value');
            if (valueInput) valueInput.focus();
        }
    }

    function removeKeyRow(keyId) {
        workingApiKeys = workingApiKeys.filter(k => k.id !== keyId);
        renderKeysList();
    }

    function applyProviderPreset() {
        const preset = window.EscAI.PROVIDER_PRESETS[els.cfgProvider.value];
        if (!preset) return;
        els.cfgBaseUrl.value = preset.baseUrl;
        els.cfgModel.value = preset.defaultModel;
        renderKeysList();
    }

    async function testAiConnection() {
        const candidate = readSettingsForm();
        els.testResult.hidden = true;
        els.testResultList.hidden = false;
        els.testResultList.innerHTML = '';

        const keysToTest = candidate.provider === 'ollama'
            ? [{ id: 'ollama', label: 'Ollama (local)' }]
            : (candidate.apiKeys || []).filter(k => k.key);

        if (!keysToTest.length) {
            els.testResultList.innerHTML = '<div class="test-result-item fail"><span class="tr-icon">!</span><span class="tr-msg">Belum ada API key untuk dites. Tambahkan minimal 1 key.</span></div>';
            return;
        }

        keysToTest.forEach(k => {
            const item = document.createElement('div');
            item.className = 'test-result-item testing';
            item.dataset.keyId = k.id;
            item.innerHTML = `
                <span class="tr-icon">.</span>
                <span class="tr-label">${escapeHtml(k.label || window.EscAI.maskKey(k.key))}</span>
                <span class="tr-msg">Testing...</span>
            `;
            els.testResultList.appendChild(item);
        });

        try {
            const results = await window.EscAI.pingAll(candidate);
            results.forEach(r => {
                const item = els.testResultList.querySelector(`[data-key-id="${r.id}"]`)
                    || els.testResultList.children[0];
                if (!item) return;
                item.className = 'test-result-item ' + (r.ok ? 'ok' : 'fail');
                const icon = r.ok ? 'OK' : 'X';
                item.innerHTML = `
                    <span class="tr-icon">${icon}</span>
                    <span class="tr-label">${escapeHtml(r.label || '')}</span>
                    <span class="tr-msg">${escapeHtml(r.ok ? `Reply: ${r.message}` : r.message)}</span>
                `;
            });
        } catch (err) {
            els.testResultList.innerHTML = `<div class="test-result-item fail"><span class="tr-icon">X</span><span class="tr-msg">${escapeHtml(err.message)}</span></div>`;
        }
    }

    function readSettingsForm() {
        const isOllama = els.cfgProvider.value === 'ollama';
        const apiKeys = isOllama
            ? []
            : workingApiKeys
                .map(k => ({ id: k.id, key: (k.key || '').trim(), label: (k.label || '').trim() }))
                .filter(k => k.key);

        return {
            ...aiSettings,
            provider: els.cfgProvider.value,
            baseUrl: els.cfgBaseUrl.value.trim(),
            model: els.cfgModel.value.trim(),
            apiKeys,
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
            showToast('Lengkapi base URL, model, dan minimal 1 API key sebelum mengaktifkan', 'error');
            return;
        }
        aiSettings = window.EscAI.saveSettings(next);
        refreshAiUi();
        closeSettings();
        showToast('Pengaturan disimpan', 'success');
    }

    function canUseAi(s) {
        if (!s.baseUrl || !s.model) return false;
        if (s.provider === 'ollama') return true;
        return Array.isArray(s.apiKeys) && s.apiKeys.some(k => k && k.key);
    }

    function refreshAiUi() {
        const ready = canUseAi(aiSettings);
        els.aiEnabledToggle.checked = !!(aiSettings.enabled && ready);
        els.aiToggleCard.classList.toggle('active', els.aiEnabledToggle.checked);

        if (!ready) {
            els.aiStatusLabel.textContent = 'Belum dikonfigurasi';
        } else if (aiSettings.enabled) {
            const keyCount = aiSettings.provider === 'ollama' ? 0 : (aiSettings.apiKeys || []).filter(k => k.key).length;
            const keyInfo = keyCount > 1 ? ` (${keyCount} keys)` : '';
            els.aiStatusLabel.textContent = `${labelFor(aiSettings.provider)} - ${aiSettings.model}${keyInfo}`;
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
        refreshUnsavedBanner();
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
        setLastExport('corrections');
        refreshUnsavedBanner();
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

    function startDiscussion({ query, wrongEntry, previousPicks }) {
        if (!aiSettings.enabled || !canUseAi(aiSettings)) {
            showToast('Aktifkan AI Mode dulu untuk diskusi', 'error');
            return;
        }

        currentDiscussion = {
            originalQuery: query,
            wrongEntry,
            previousPicks: previousPicks.slice(),
            allRejectedIdx: new Set(previousPicks.map(p => p._idx)),
            history: []
        };

        showDiscussionBanner(`Original: "${query}" | Salah: ${wrongEntry.group}`);

        addMessage(`Mode diskusi aktif. Ketik koreksi yang Anda mau, contoh:
        - "Bukan group itu, harusnya MyEnterpriseAccess"
        - "Salah, ini soal aktivasi paket bukan SIM card"
        - "Yang benar group MEC dengan kategori MYENTERPRISE"`, 'bot');

        els.userInput.placeholder = 'Ketik koreksi natural language...';
        els.userInput.focus();
        scrollChatToBottom();
    }

    function cancelDiscussion() {
        if (!currentDiscussion) return;
        currentDiscussion = null;
        hideDiscussionBanner();
        els.userInput.placeholder = 'Deskripsikan kendala atau kebutuhan Anda...';
        addMessage('Mode diskusi dibatalkan. Anda bisa kirim query baru.', 'bot');
        scrollChatToBottom();
    }

    function showDiscussionBanner(text) {
        els.discussionContext.textContent = text;
        els.discussionBanner.hidden = false;
    }

    function hideDiscussionBanner() {
        els.discussionBanner.hidden = true;
    }

    async function handleDiscussionTurn(userFeedback, typingEl) {
        currentDiscussion.history.push({ role: 'user', content: userFeedback });

        try {
            const revised = await window.EscAI.reviseAI(aiSettings, {
                originalQuery: currentDiscussion.originalQuery,
                previousPicks: currentDiscussion.previousPicks,
                userFeedback,
                conversationHistory: currentDiscussion.history,
                data
            });

            typingEl.remove();

            if (!revised.picks || !revised.picks.length) {
                addBotError('AI tidak bisa menemukan kandidat baru. Coba feedback lebih spesifik atau klik Batal.');
                history.appendMessage(currentThreadId, {
                    role: 'bot',
                    kind: 'error',
                    content: 'AI tidak bisa menemukan kandidat baru.'
                });
                return;
            }

            renderRevisedResponse(currentDiscussion.originalQuery, revised);

            currentDiscussion.previousPicks = revised.picks;
            revised.picks.forEach(p => currentDiscussion.allRejectedIdx.add(p._idx));
            currentDiscussion.history.push({
                role: 'assistant',
                content: revised.reasoning || 'Picks revised',
                pickIds: revised.picks.map(p => p._idx)
            });

            history.appendMessage(currentThreadId, {
                role: 'bot',
                kind: 'ai-revised',
                content: revised.reasoning || '',
                picks: revised.picks,
                reasoning: revised.reasoning,
                modelUsed: revised.modelUsed,
                keyUsed: revised.keyUsed
            });
        } catch (err) {
            typingEl.remove();
            const errMsg = `Diskusi gagal: ${err.message}`;
            addBotError(errMsg);
            history.appendMessage(currentThreadId, { role: 'bot', kind: 'error', content: errMsg });
        }

        renderHistoryList();
        scrollChatToBottom();
    }

    function renderRevisedResponse(query, revised) {
        const div = document.createElement('div');
        div.className = 'message bot';

        const keyMeta = revised.keyUsed;
        const keyBadge = keyMeta
            ? `<span class="key-badge${keyMeta.rotated ? ' rotated' : ''}">Key: ${escapeHtml(keyMeta.label)}${keyMeta.rotated ? ' (rotated)' : ''}</span>`
            : '';

        let html = '<div class="message-avatar">EB</div><div class="message-content">';
        html += `<p>Hasil revisi <span class="ai-badge">${escapeHtml(revised.modelUsed)}</span>${keyBadge}, <strong>${revised.picks.length}</strong> kandidat baru:</p>`;
        if (revised.reasoning) {
            html += `<div class="ai-reasoning">${escapeHtml(revised.reasoning)}</div>`;
        }
        html += renderResultCards(query, revised.picks);
        html += `<div class="discussion-footer">
            <p class="discussion-footer-hint">Cocok? Klik <strong>Benar, pakai ini</strong> di kandidat yang tepat. Masih salah? Ketik feedback lagi atau klik Batal.</p>
        </div>`;
        html += '</div>';

        div.innerHTML = html;
        els.chatMessages.appendChild(div);
        attachResultActions(div, query, revised.picks);
    }

    function saveRevisedCorrection(acceptedIdx) {
        if (!currentDiscussion) return;
        const accepted = data[acceptedIdx];
        const rejected = [
            currentDiscussion.wrongEntry,
            ...Array.from(currentDiscussion.allRejectedIdx)
                .filter(i => i !== acceptedIdx)
                .map(i => data[i])
                .filter(Boolean)
        ];

        corrections.recordCorrection({
            query: currentDiscussion.originalQuery,
            acceptedEntry: accepted,
            rejectedEntries: rejected,
            type: 'discussion'
        });

        refreshCorrectionStats();
        currentDiscussion = null;
        hideDiscussionBanner();
        els.userInput.placeholder = 'Deskripsikan kendala atau kebutuhan Anda...';
        showToast('Koreksi diskusi disimpan', 'success');
        addMessage('Tersimpan. Mode diskusi selesai. Anda bisa kirim query baru.', 'bot');
        scrollChatToBottom();
    }

    function renderHistoryList() {
        const threads = history.listThreads();
        if (!threads.length) {
            els.historyList.innerHTML = '<div class="history-empty">Belum ada riwayat. Kirim pesan pertama untuk memulai.</div>';
            refreshUnsavedBanner();
            return;
        }

        els.historyList.innerHTML = threads.map(t => {
            const isActive = t.id === currentThreadId;
            const userCount = (t.messages || []).filter(m => m.role === 'user').length;
            return `
                <div class="history-item${isActive ? ' active' : ''}" data-thread-id="${escapeHtml(t.id)}" title="${escapeHtml(t.title)}">
                    <div class="history-item-content">
                        <div class="history-item-title">${escapeHtml(t.title || 'Tanpa judul')}</div>
                        <div class="history-item-meta">
                            <span class="history-item-time">${formatRelativeTime(t.updatedAt)}</span>
                            <span class="history-item-count">${userCount} pesan</span>
                        </div>
                    </div>
                    <button class="history-item-delete" data-action="delete-thread" data-thread-id="${escapeHtml(t.id)}" title="Hapus thread">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"></path></svg>
                    </button>
                </div>
            `;
        }).join('');

        els.historyList.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('click', e => {
                if (e.target.closest('[data-action="delete-thread"]')) return;
                loadThread(el.dataset.threadId);
            });
        });

        els.historyList.querySelectorAll('[data-action="delete-thread"]').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                deleteThreadConfirm(btn.dataset.threadId);
            });
        });

        refreshUnsavedBanner();
    }

    function loadThread(threadId) {
        const thread = history.getThread(threadId);
        if (!thread) return;

        if (currentDiscussion) {
            currentDiscussion = null;
            hideDiscussionBanner();
            els.userInput.placeholder = 'Deskripsikan kendala atau kebutuhan Anda...';
        }

        currentThreadId = threadId;
        els.chatMessages.innerHTML = '';
        els.welcomeScreen.style.display = 'none';

        thread.messages.forEach(msg => {
            if (msg.role === 'user') {
                addMessage(msg.content, 'user');
                return;
            }
            if (msg.kind === 'error') {
                addBotError(msg.content);
                return;
            }
            const userQuery = findPrecedingUserQuery(thread, msg);
            if (msg.kind === 'ai') {
                renderAiResponse(userQuery, {
                    picks: msg.picks || [],
                    reasoning: msg.reasoning || '',
                    modelUsed: msg.modelUsed || '',
                    keyUsed: msg.keyUsed || null
                });
            } else if (msg.kind === 'ai-revised') {
                renderRevisedResponse(userQuery, {
                    picks: msg.picks || [],
                    reasoning: msg.reasoning || '',
                    modelUsed: msg.modelUsed || '',
                    keyUsed: msg.keyUsed || null
                });
            } else {
                renderLocalResults(userQuery, msg.picks || []);
            }
        });

        renderHistoryList();
        scrollChatToBottom();

        if (window.innerWidth <= 768) {
            els.sidebar.classList.remove('open');
        }
    }

    function findPrecedingUserQuery(thread, botMsg) {
        const idx = thread.messages.indexOf(botMsg);
        for (let i = idx - 1; i >= 0; i--) {
            if (thread.messages[i].role === 'user') return thread.messages[i].content;
        }
        return '';
    }

    function deleteThreadConfirm(threadId) {
        const thread = history.getThread(threadId);
        if (!thread) return;
        if (!confirm(`Hapus thread "${thread.title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
        history.deleteThread(threadId);
        if (currentThreadId === threadId) {
            currentThreadId = null;
            resetChat();
        } else {
            renderHistoryList();
        }
        showToast('Thread dihapus', 'success');
    }

    function exportHistory() {
        const stats = history.stats();
        if (!stats.totalThreads) {
            showToast('Belum ada riwayat untuk diekspor', 'error');
            return;
        }
        const json = history.exportJson();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `escbot-history-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setLastExport('history');
        refreshUnsavedBanner();
        showToast(`${stats.totalThreads} thread diunduh`, 'success');
    }

    function clearHistoryConfirm() {
        if (!confirm('Hapus SEMUA riwayat chat? Tindakan ini tidak bisa dibatalkan.')) return;
        history.clearAll();
        currentThreadId = null;
        resetChat();
        showToast('Riwayat dihapus', 'success');
    }

    function formatRelativeTime(iso) {
        if (!iso) return '';
        const then = new Date(iso).getTime();
        if (!Number.isFinite(then)) return '';
        const diff = Date.now() - then;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'baru saja';
        if (minutes < 60) return `${minutes}m lalu`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}j lalu`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}h lalu`;
        return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }

    function maybeShowGuide() {
        if (!els.guideModal) return;
        try {
            if (localStorage.getItem('escbot_guide_seen_v1') === '1') return;
        } catch (e) {}
        setTimeout(() => { els.guideModal.hidden = false; }, 250);
    }

    function openGuide() {
        if (!els.guideModal) return;
        if (els.guideDontShow) els.guideDontShow.checked = false;
        els.guideModal.hidden = false;
    }

    function closeGuide() {
        if (!els.guideModal) return;
        try {
            if (els.guideDontShow && els.guideDontShow.checked) {
                localStorage.setItem('escbot_guide_seen_v1', '1');
            }
        } catch (e) {}
        els.guideModal.hidden = true;
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
