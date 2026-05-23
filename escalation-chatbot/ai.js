(function (global) {
    'use strict';

    const SETTINGS_KEY = 'escbot.ai.settings.v1';
    const COOLDOWN_MS = 60 * 1000;
    const TRANSIENT_COOLDOWN_MS = 15 * 1000;

    const PROVIDER_PRESETS = {
        '9router': {
            label: '9router',
            baseUrl: 'https://api.9router.io/v1',
            defaultModel: 'kr/claude-opus-4.7',
            authStyle: 'bearer'
        },
        'openai': {
            label: 'OpenAI',
            baseUrl: 'https://api.openai.com/v1',
            defaultModel: 'gpt-4o-mini',
            authStyle: 'bearer'
        },
        'gemini': {
            label: 'Google Gemini (OpenAI-compatible)',
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
            defaultModel: 'gemini-2.0-flash',
            authStyle: 'bearer'
        },
        'openrouter': {
            label: 'OpenRouter',
            baseUrl: 'https://openrouter.ai/api/v1',
            defaultModel: 'anthropic/claude-3.5-sonnet',
            authStyle: 'bearer'
        },
        'ollama': {
            label: 'Ollama (Local)',
            baseUrl: 'http://localhost:11434/v1',
            defaultModel: 'llama3.1',
            authStyle: 'none'
        },
        'custom': {
            label: 'Custom OpenAI-compatible',
            baseUrl: '',
            defaultModel: '',
            authStyle: 'bearer'
        }
    };

    const DEFAULT_SETTINGS = {
        enabled: false,
        provider: '9router',
        baseUrl: PROVIDER_PRESETS['9router'].baseUrl,
        model: PROVIDER_PRESETS['9router'].defaultModel,
        apiKeys: [],
        topK: 8,
        temperature: 0.1,
        timeoutMs: 60000,
        useProxy: false,
        proxyUrl: 'proxy.php'
    };

    const keyHealthByBaseUrl = new Map();

    function getHealthBucket(baseUrl) {
        if (!keyHealthByBaseUrl.has(baseUrl)) {
            keyHealthByBaseUrl.set(baseUrl, { pointer: 0, health: {} });
        }
        return keyHealthByBaseUrl.get(baseUrl);
    }

    function isKeyEligible(bucket, keyId, now) {
        const h = bucket.health[keyId];
        if (!h) return true;
        return !h.cooldownUntil || h.cooldownUntil <= now;
    }

    function cooldownDurationFor(status) {
        if (status === 429) return { ms: COOLDOWN_MS, reason: 'rate-limit' };
        if (status === 401 || status === 403) return { ms: COOLDOWN_MS, reason: 'auth' };
        return { ms: TRANSIENT_COOLDOWN_MS, reason: 'transient' };
    }

    function markKeyError(bucket, keyId, status) {
        const { ms, reason } = cooldownDurationFor(status);
        const h = bucket.health[keyId] || { errorCount: 0 };
        h.errorCount = (h.errorCount || 0) + 1;
        h.cooldownUntil = Date.now() + ms;
        h.lastReason = reason;
        h.lastStatus = status;
        bucket.health[keyId] = h;
    }

    function markKeySuccess(bucket, keyId) {
        if (bucket.health[keyId]) {
            bucket.health[keyId].errorCount = 0;
            bucket.health[keyId].cooldownUntil = 0;
        }
    }

    function pickNextEligibleKey(keys, baseUrl) {
        if (!keys || !keys.length) return null;
        const bucket = getHealthBucket(baseUrl);
        const now = Date.now();
        const n = keys.length;

        for (let i = 0; i < n; i++) {
            const idx = (bucket.pointer + i) % n;
            const k = keys[idx];
            if (k && k.key && isKeyEligible(bucket, k.id, now)) {
                bucket.pointer = (idx + 1) % n;
                return { keyEntry: k, index: idx };
            }
        }
        return null;
    }

    function getKeyStatus(keyId, baseUrl) {
        const bucket = getHealthBucket(baseUrl);
        const h = bucket.health[keyId];
        const now = Date.now();
        if (!h || !h.cooldownUntil || h.cooldownUntil <= now) {
            return { state: 'ready', secondsLeft: 0, reason: null };
        }
        return {
            state: 'cooldown',
            secondsLeft: Math.ceil((h.cooldownUntil - now) / 1000),
            reason: h.lastReason || 'error'
        };
    }

    function genKeyId() {
        return 'k_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }

    function normalizeApiKeys(input) {
        if (!Array.isArray(input)) return [];
        return input
            .map(k => {
                if (typeof k === 'string') {
                    return { id: genKeyId(), key: k.trim(), label: '' };
                }
                if (k && typeof k === 'object' && k.key) {
                    return {
                        id: k.id || genKeyId(),
                        key: String(k.key).trim(),
                        label: typeof k.label === 'string' ? k.label : ''
                    };
                }
                return null;
            })
            .filter(k => k && k.key);
    }

    function migrateLegacy(parsed) {
        if (parsed && typeof parsed.apiKey === 'string' && parsed.apiKey.trim() && !Array.isArray(parsed.apiKeys)) {
            parsed.apiKeys = [{ id: genKeyId(), key: parsed.apiKey.trim(), label: '' }];
        }
        delete parsed.apiKey;
        return parsed;
    }

    function loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (!raw) return { ...DEFAULT_SETTINGS, apiKeys: [] };
            const parsed = migrateLegacy(JSON.parse(raw));
            const merged = { ...DEFAULT_SETTINGS, ...parsed };
            merged.apiKeys = normalizeApiKeys(parsed.apiKeys);
            return merged;
        } catch (e) {
            return { ...DEFAULT_SETTINGS, apiKeys: [] };
        }
    }

    function saveSettings(settings) {
        const merged = { ...DEFAULT_SETTINGS, ...settings };
        merged.apiKeys = normalizeApiKeys(merged.apiKeys);
        delete merged.apiKey;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
        return merged;
    }

    function buildCandidatesPayload(data) {
        return data.map((d, i) => ({
            id: i,
            group: d.group,
            kip: d.kip,
            hashtag: d.hashtag
        }));
    }

    function buildSelectionPrompt({ query, data, corrections, topK }) {
        const candidates = buildCandidatesPayload(data);

        const correctionExamples = (corrections || []).slice(0, 12).map(c => ({
            query: c.queryRaw,
            chosenHashtag: c.acceptedHashtag,
            chosenGroup: c.acceptedGroup
        }));

        const routingRules = [
            'Add Offer / Open Restric / Add Offering -> group UFO Postpaid',
            'Aktivasi Paket Team / balance transfer / BLTF / pengecekan nomor -> group CUGCorporate',
            'Pengecekan ICCID / SN / serial number -> group Paradise',
            'VoLTE -> group UniprovPaceLayer',
            'ADD / PSB Stuck Order -> group MyEnterpriseAccess (MEA)',
            'Parent-Child / Parents Child / Registrasi -> group CRMBE',
            'Sisa Kuota / Inject Kuota / AOD / Remove Paket -> group UPCC',
            'Blacklist / Whitelist / Layanan Google -> group iCharming',
            'Cek order proses / Reaktivasi / Perubahan Billing Status -> group IoT CMP',
            'GPRS Lock / GPRS Block / Terminate GPRS / Nonaktif GPRS / Ubah order failed ke komplet -> group DSC'
        ];

        const system = [
            'You are an expert routing assistant for Telkomsel Enterprise IT escalations.',
            'Given a user complaint or request, pick the most appropriate escalation hashtag from the catalog.',
            'You MUST only return hashtags that exist in the provided CATALOG (match by id).',
            'Indonesian and English mixed input is normal. Be tolerant of typos and informal phrasing.',
            'Prefer matches where BOTH the assigned group AND the KIP category align with the user intent.',
            'CRITICAL: You MUST always return at least 2-3 best-effort candidates, even if no perfect match exists.',
            'For unknown brands or services (e.g. Prime Video, Netflix, Spotify), map to the closest LAYANAN DIGITAL / FITUR / EKSTRA KUOTA / B2B2C MEPRO category.',
            'For SMS / activation issues, also consider FITUR HLR and SIMCARD categories.',
            'When the query is ambiguous, return multiple candidates spanning different likely groups so the user can choose.',
            'Lower confidence (30-60) is acceptable for fuzzy matches - do NOT return empty picks.',
            'Output STRICT JSON only - no markdown fences, no prose, no comments.'
        ].join(' ');

        const responseSchema = {
            type: 'object',
            required: ['picks'],
            properties: {
                reasoning: { type: 'string', description: 'Brief 1-2 sentence rationale in Indonesian' },
                picks: {
                    type: 'array',
                    minItems: 2,
                    maxItems: Math.min(5, topK),
                    items: {
                        type: 'object',
                        required: ['id', 'confidence'],
                        properties: {
                            id: { type: 'integer', description: 'Catalog id of the chosen entry' },
                            confidence: { type: 'integer', minimum: 0, maximum: 100 },
                            why: { type: 'string', description: 'Why this entry fits, in Indonesian' }
                        }
                    }
                }
            }
        };

        const user = JSON.stringify({
            instruction: `Pilih MINIMUM 2 dan MAKSIMUM ${Math.min(5, topK)} hashtag eskalasi yang paling cocok. JANGAN return picks kosong.`,
            user_query: query,
            routing_rules: routingRules,
            user_taught_examples: correctionExamples,
            response_schema: responseSchema,
            catalog: candidates
        });

        return { system, user };
    }

    function buildFetchConfig(settings, apiKeyValue, body) {
        const url = settings.baseUrl.replace(/\/+$/, '') + '/chat/completions';
        const headers = { 'Content-Type': 'application/json' };
        if (apiKeyValue) headers['Authorization'] = `Bearer ${apiKeyValue}`;

        let fetchUrl = url;
        if (settings.useProxy && settings.proxyUrl) {
            fetchUrl = settings.proxyUrl;
            headers['X-Upstream-Url'] = url;
        }

        return {
            fetchUrl,
            headers,
            body: JSON.stringify(body)
        };
    }

    async function fetchWithKey(settings, apiKeyValue, body) {
        const cfg = buildFetchConfig(settings, apiKeyValue, body);
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), settings.timeoutMs || 60000);

        let resp;
        try {
            resp = await fetch(cfg.fetchUrl, {
                method: 'POST',
                headers: cfg.headers,
                body: cfg.body,
                signal: ctrl.signal
            });
        } catch (e) {
            clearTimeout(timer);
            const err = new Error(e.name === 'AbortError' ? 'AI request timeout' : 'AI network error: ' + e.message);
            err.status = 0;
            err.rotateable = true;
            throw err;
        }
        clearTimeout(timer);

        if (!resp.ok) {
            const errText = await resp.text().catch(() => '');
            const err = new Error(`HTTP ${resp.status}: ${errText.slice(0, 300)}`);
            err.status = resp.status;
            err.rotateable = resp.status === 429 || resp.status === 401 || resp.status === 403 || resp.status >= 500;
            throw err;
        }

        return resp.json();
    }

    function hasUsableKeys(settings) {
        if (settings.provider === 'ollama') return true;
        return Array.isArray(settings.apiKeys) && settings.apiKeys.some(k => k && k.key);
    }

    async function callAI(settings, query, data, corrections) {
        if (!settings.enabled) {
            const err = new Error('AI is not enabled in settings');
            err.code = 'AI_DISABLED';
            throw err;
        }
        if (!settings.baseUrl) throw new Error('Base URL kosong - cek pengaturan AI');
        if (!hasUsableKeys(settings)) {
            throw new Error('Belum ada API key. Tambahkan minimal 1 key di pengaturan AI.');
        }

        const { system, user } = buildSelectionPrompt({
            query,
            data,
            corrections,
            topK: settings.topK || 8
        });

        const body = {
            model: settings.model,
            temperature: settings.temperature ?? 0.1,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user }
            ],
            response_format: { type: 'json_object' }
        };

        const json = await sendWithRotation(settings, body);

        const content = json?.choices?.[0]?.message?.content;
        if (!content) throw new Error('AI returned empty content');

        const parsed = parseAiJson(content);
        if (!parsed || !Array.isArray(parsed.picks)) {
            throw new Error('AI returned invalid JSON shape');
        }

        const picks = parsed.picks
            .filter(p => Number.isInteger(p.id) && p.id >= 0 && p.id < data.length)
            .map(p => ({
                ...data[p.id],
                _idx: p.id,
                score: clampInt(p.confidence, 0, 100),
                _why: p.why || '',
                _aiPicked: true
            }));

        return {
            picks,
            reasoning: parsed.reasoning || '',
            modelUsed: json?.model || settings.model,
            keyUsed: json.__keyMeta || null
        };
    }

    function buildRevisionPrompt({ originalQuery, previousPicks, userFeedback, conversationHistory, data, topK }) {
        const candidates = buildCandidatesPayload(data);

        const previousPicksSummary = (previousPicks || []).map(p => ({
            id: p._idx,
            group: p.group,
            kip: p.kip,
            hashtag: p.hashtag,
            previousConfidence: p.score
        }));

        const turns = (conversationHistory || []).map(t => ({ role: t.role, message: t.content }));

        const system = [
            'You are an expert routing assistant for Telkomsel Enterprise IT escalations.',
            'The user previously got hashtag picks for their query but is NOT satisfied with the result.',
            'They are now giving you correction feedback in natural language (Indonesian/English mix).',
            'Your job: REVISE the picks based on their feedback. Pick DIFFERENT entries from the catalog that better match what they want.',
            'You MUST only return hashtags that exist in the provided CATALOG (match by id).',
            'Pay close attention to: corrected group names, corrected categories, brand names mentioned, or specific KIP keywords the user pointed out.',
            'If user says "bukan X, harusnya Y" - heavily prefer entries matching Y.',
            'If user names a specific group (e.g. "harusnya MEA"), filter strongly toward that group.',
            'If user describes a different intent than the original query, recognize it and pick accordingly.',
            'Output STRICT JSON only - no markdown fences, no prose, no comments.'
        ].join(' ');

        const responseSchema = {
            type: 'object',
            required: ['picks'],
            properties: {
                reasoning: { type: 'string', description: 'Brief 1-2 sentence rationale in Indonesian explaining what you changed and why' },
                picks: {
                    type: 'array',
                    minItems: 1,
                    maxItems: Math.min(5, topK),
                    items: {
                        type: 'object',
                        required: ['id', 'confidence'],
                        properties: {
                            id: { type: 'integer' },
                            confidence: { type: 'integer', minimum: 0, maximum: 100 },
                            why: { type: 'string', description: 'Why this entry fits AFTER user correction, in Indonesian' }
                        }
                    }
                }
            }
        };

        const user = JSON.stringify({
            instruction: `Berdasarkan feedback user, pilih ulang MAKSIMUM ${Math.min(5, topK)} hashtag yang lebih cocok. Hindari hashtag yang sebelumnya sudah ditolak user kecuali memang relevan dengan koreksi mereka.`,
            original_query: originalQuery,
            previous_picks_user_rejected: previousPicksSummary,
            user_feedback_latest: userFeedback,
            conversation_so_far: turns,
            response_schema: responseSchema,
            catalog: candidates
        });

        return { system, user };
    }

    async function reviseAI(settings, context) {
        if (!settings.enabled) {
            const err = new Error('AI is not enabled in settings');
            err.code = 'AI_DISABLED';
            throw err;
        }
        if (!settings.baseUrl) throw new Error('Base URL kosong - cek pengaturan AI');
        if (!hasUsableKeys(settings)) {
            throw new Error('Belum ada API key. Tambahkan minimal 1 key di pengaturan AI.');
        }

        const { originalQuery, previousPicks, userFeedback, conversationHistory, data } = context;

        const { system, user } = buildRevisionPrompt({
            originalQuery,
            previousPicks,
            userFeedback,
            conversationHistory,
            data,
            topK: settings.topK || 8
        });

        const body = {
            model: settings.model,
            temperature: Math.max(0.2, settings.temperature ?? 0.2),
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user }
            ],
            response_format: { type: 'json_object' }
        };

        const json = await sendWithRotation(settings, body);
        const content = json?.choices?.[0]?.message?.content;
        if (!content) throw new Error('AI returned empty content');

        const parsed = parseAiJson(content);
        if (!parsed || !Array.isArray(parsed.picks)) {
            throw new Error('AI returned invalid JSON shape');
        }

        const picks = parsed.picks
            .filter(p => Number.isInteger(p.id) && p.id >= 0 && p.id < data.length)
            .map(p => ({
                ...data[p.id],
                _idx: p.id,
                score: clampInt(p.confidence, 0, 100),
                _why: p.why || '',
                _aiPicked: true,
                _aiRevised: true
            }));

        return {
            picks,
            reasoning: parsed.reasoning || '',
            modelUsed: json?.model || settings.model,
            keyUsed: json.__keyMeta || null
        };
    }

    async function sendWithRotation(settings, body) {
        if (settings.provider === 'ollama' || !Array.isArray(settings.apiKeys) || !settings.apiKeys.length) {
            return fetchWithKey(settings, '', body);
        }

        const keys = settings.apiKeys.filter(k => k && k.key);
        const bucket = getHealthBucket(settings.baseUrl);
        const triedIds = new Set();
        let lastError = null;

        for (let attempt = 0; attempt < keys.length; attempt++) {
            const picked = pickNextEligibleKey(keys, settings.baseUrl);
            if (!picked) break;
            if (triedIds.has(picked.keyEntry.id)) continue;
            triedIds.add(picked.keyEntry.id);

            try {
                const json = await fetchWithKey(settings, picked.keyEntry.key, body);
                markKeySuccess(bucket, picked.keyEntry.id);
                json.__keyMeta = {
                    id: picked.keyEntry.id,
                    label: picked.keyEntry.label || maskKey(picked.keyEntry.key),
                    rotated: attempt > 0
                };
                return json;
            } catch (err) {
                lastError = err;
                if (err.rotateable) {
                    markKeyError(bucket, picked.keyEntry.id, err.status);
                    continue;
                }
                throw err;
            }
        }

        const reason = lastError ? lastError.message : 'no eligible key';
        const err = new Error(`Semua API key gagal / sedang cooldown. Terakhir: ${reason}`);
        err.code = 'ALL_KEYS_FAILED';
        throw err;
    }

    async function pingKey(settings, apiKeyValue) {
        const body = {
            model: settings.model,
            messages: [
                { role: 'system', content: 'Reply with only the word OK.' },
                { role: 'user', content: 'ping' }
            ],
            temperature: 0,
            max_tokens: 5
        };

        try {
            const json = await fetchWithKey(settings, apiKeyValue, body);
            const reply = json?.choices?.[0]?.message?.content || '(empty)';
            return { ok: true, message: reply };
        } catch (err) {
            return { ok: false, message: err.message, status: err.status || 0 };
        }
    }

    async function pingAll(settings) {
        if (!settings.baseUrl) {
            return [{ ok: false, message: 'Base URL kosong' }];
        }

        if (settings.provider === 'ollama') {
            const r = await pingKey(settings, '');
            return [{ ...r, label: 'Ollama (no key)', id: 'ollama' }];
        }

        const keys = (settings.apiKeys || []).filter(k => k && k.key);
        if (!keys.length) {
            return [{ ok: false, message: 'Belum ada API key. Tambahkan minimal 1 key.' }];
        }

        const bucket = getHealthBucket(settings.baseUrl);
        const results = await Promise.all(
            keys.map(async k => {
                const r = await pingKey(settings, k.key);
                if (r.ok) markKeySuccess(bucket, k.id);
                else if (r.status) markKeyError(bucket, k.id, r.status);
                return {
                    id: k.id,
                    label: k.label || maskKey(k.key),
                    ok: r.ok,
                    message: r.message,
                    status: r.status
                };
            })
        );
        return results;
    }

    function maskKey(key) {
        if (!key) return '';
        const s = String(key);
        if (s.length <= 10) return s.slice(0, 2) + '***';
        return s.slice(0, 4) + '...' + s.slice(-4);
    }

    function parseAiJson(content) {
        if (typeof content !== 'string') return null;
        const trimmed = content.trim()
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/```$/, '')
            .trim();
        try {
            return JSON.parse(trimmed);
        } catch (e) {
            const firstBrace = trimmed.indexOf('{');
            const lastBrace = trimmed.lastIndexOf('}');
            if (firstBrace >= 0 && lastBrace > firstBrace) {
                try { return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)); }
                catch (e2) { return null; }
            }
            return null;
        }
    }

    function clampInt(n, min, max) {
        const x = Math.round(Number(n));
        if (!Number.isFinite(x)) return min;
        return Math.max(min, Math.min(max, x));
    }

    global.EscAI = {
        loadSettings,
        saveSettings,
        callAI,
        reviseAI,
        pingAll,
        pingKey,
        getKeyStatus,
        maskKey,
        genKeyId,
        PROVIDER_PRESETS,
        DEFAULT_SETTINGS,
        COOLDOWN_MS
    };
})(typeof window !== 'undefined' ? window : globalThis);
