/*! Copyright (c) 2026 Christian Anelka. All rights reserved. Proprietary - see LICENSE. */
(function (global) {
    'use strict';

    const STORAGE_KEY = 'escbot.corrections.v1';

    function loadFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return emptyState();
            const parsed = JSON.parse(raw);
            return normalizeState(parsed);
        } catch (e) {
            return emptyState();
        }
    }

    function emptyState() {
        return { version: 1, entries: [], updatedAt: null };
    }

    function normalizeState(state) {
        if (!state || typeof state !== 'object') return emptyState();
        if (!Array.isArray(state.entries)) state.entries = [];
        return {
            version: state.version || 1,
            entries: state.entries.filter(e => e && e.queryTokens && (e.acceptedHashtag || e.acceptedGroup)),
            updatedAt: state.updatedAt || null
        };
    }

    function persist(state) {
        state.updatedAt = new Date().toISOString();
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Corrections persistence failed', e);
        }
    }

    function tokenSetFromQuery(query) {
        if (!global.EscSearch) return [];
        return [...new Set(global.EscSearch.tokenize(query))];
    }

    function jaccard(a, b) {
        if (!a.length || !b.length) return 0;
        const setA = new Set(a);
        const setB = new Set(b);
        let intersection = 0;
        setA.forEach(t => { if (setB.has(t)) intersection += 1; });
        const union = setA.size + setB.size - intersection;
        return union === 0 ? 0 : intersection / union;
    }

    function createCorrectionsManager(data) {
        let state = loadFromStorage();

        function recordCorrection({ query, acceptedEntry, rejectedEntries, type }) {
            if (!query || !acceptedEntry) return;
            const tokens = tokenSetFromQuery(query);
            if (!tokens.length) return;

            state.entries.push({
                id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
                queryRaw: query,
                queryTokens: tokens,
                acceptedHashtag: acceptedEntry.hashtag,
                acceptedGroup: acceptedEntry.group,
                acceptedKip: acceptedEntry.kip,
                rejectedHashtags: (rejectedEntries || []).map(r => r.hashtag),
                type: type || 'pick',
                timestamp: new Date().toISOString()
            });

            persist(state);
        }

        function boostFor(query, entryIdx) {
            const entry = data[entryIdx];
            if (!entry) return 0;
            const tokens = tokenSetFromQuery(query);
            if (!tokens.length) return 0;

            let boost = 0;
            for (const correction of state.entries) {
                const sim = jaccard(tokens, correction.queryTokens);
                if (sim < 0.3) continue;

                if (correction.acceptedHashtag === entry.hashtag) {
                    boost += 80 * sim;
                } else if (correction.rejectedHashtags && correction.rejectedHashtags.includes(entry.hashtag)) {
                    boost -= 40 * sim;
                }
            }
            return boost;
        }

        function exportJson() {
            return JSON.stringify(state, null, 2);
        }

        function importJson(jsonText, mode) {
            const parsed = JSON.parse(jsonText);
            const incoming = normalizeState(parsed);
            if (mode === 'replace') {
                state = incoming;
            } else {
                const seenIds = new Set(state.entries.map(e => e.id));
                incoming.entries.forEach(e => {
                    if (!seenIds.has(e.id)) state.entries.push(e);
                });
            }
            persist(state);
            return state.entries.length;
        }

        function clearAll() {
            state = emptyState();
            persist(state);
        }

        function listAll() {
            return state.entries.slice().sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        }

        function stats() {
            return {
                total: state.entries.length,
                updatedAt: state.updatedAt
            };
        }

        return {
            recordCorrection,
            boostFor,
            exportJson,
            importJson,
            clearAll,
            listAll,
            stats
        };
    }

    global.EscCorrections = { createCorrectionsManager };
})(typeof window !== 'undefined' ? window : globalThis);
