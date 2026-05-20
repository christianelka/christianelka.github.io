(function (global) {
    'use strict';

    const SETTINGS_KEY = 'escbot.ai.settings.v1';

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
        apiKey: '',
        topK: 8,
        temperature: 0.1,
        timeoutMs: 60000,
        useProxy: false,
        proxyUrl: 'proxy.php'
    };

    function loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (!raw) return { ...DEFAULT_SETTINGS };
            const parsed = JSON.parse(raw);
            return { ...DEFAULT_SETTINGS, ...parsed };
        } catch (e) {
            return { ...DEFAULT_SETTINGS };
        }
    }

    function saveSettings(settings) {
        const merged = { ...DEFAULT_SETTINGS, ...settings };
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

    async function callAI(settings, query, data, corrections) {
        if (!settings.enabled) {
            const err = new Error('AI is not enabled in settings');
            err.code = 'AI_DISABLED';
            throw err;
        }
        if (!settings.baseUrl) throw new Error('Base URL kosong - cek pengaturan AI');
        if (settings.provider !== 'ollama' && !settings.apiKey) {
            throw new Error('API Key kosong - cek pengaturan AI');
        }

        const { system, user } = buildSelectionPrompt({
            query,
            data,
            corrections,
            topK: settings.topK || 8
        });

        const url = settings.baseUrl.replace(/\/+$/, '') + '/chat/completions';
        const headers = { 'Content-Type': 'application/json' };
        if (settings.apiKey) headers['Authorization'] = `Bearer ${settings.apiKey}`;

        const fetchUrl = settings.useProxy && settings.proxyUrl ? settings.proxyUrl : url;
        if (settings.useProxy && settings.proxyUrl) {
            headers['X-Upstream-Url'] = url;
        }

        const body = {
            model: settings.model,
            temperature: settings.temperature ?? 0.1,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user }
            ],
            response_format: { type: 'json_object' }
        };

        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), settings.timeoutMs || 60000);

        let resp;
        try {
            resp = await fetch(fetchUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
                signal: ctrl.signal
            });
        } catch (e) {
            clearTimeout(timer);
            if (e.name === 'AbortError') throw new Error('AI request timeout');
            throw new Error('AI network error: ' + e.message);
        }
        clearTimeout(timer);

        if (!resp.ok) {
            const errText = await resp.text().catch(() => '');
            throw new Error(`AI HTTP ${resp.status}: ${errText.slice(0, 300)}`);
        }

        const json = await resp.json();
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
            modelUsed: json?.model || settings.model
        };
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

    async function pingAI(settings) {
        const url = settings.baseUrl.replace(/\/+$/, '') + '/chat/completions';
        const headers = { 'Content-Type': 'application/json' };
        if (settings.apiKey) headers['Authorization'] = `Bearer ${settings.apiKey}`;

        const fetchUrl = settings.useProxy && settings.proxyUrl ? settings.proxyUrl : url;
        if (settings.useProxy && settings.proxyUrl) {
            headers['X-Upstream-Url'] = url;
        }

        const resp = await fetch(fetchUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: settings.model,
                messages: [
                    { role: 'system', content: 'Reply with only the word OK.' },
                    { role: 'user', content: 'ping' }
                ],
                temperature: 0,
                max_tokens: 5
            })
        });
        if (!resp.ok) {
            const t = await resp.text().catch(() => '');
            throw new Error(`HTTP ${resp.status}: ${t.slice(0, 200)}`);
        }
        const data = await resp.json();
        return data?.choices?.[0]?.message?.content || '(empty)';
    }

    global.EscAI = {
        loadSettings,
        saveSettings,
        callAI,
        pingAI,
        PROVIDER_PRESETS,
        DEFAULT_SETTINGS
    };
})(typeof window !== 'undefined' ? window : globalThis);
