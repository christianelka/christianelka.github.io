/*! Copyright (c) 2026 Christian Anelka. All rights reserved. Proprietary - see LICENSE. */
(function (global) {
    'use strict';

    const STORAGE_KEY = 'escbot.history.v1';
    const MAX_THREADS = 100;
    const TITLE_MAX_LEN = 40;

    function loadState() {
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
        return { version: 1, threads: [], updatedAt: null };
    }

    function normalizeState(state) {
        if (!state || typeof state !== 'object') return emptyState();
        if (!Array.isArray(state.threads)) state.threads = [];
        return {
            version: state.version || 1,
            threads: state.threads.filter(t => t && t.id && Array.isArray(t.messages)),
            updatedAt: state.updatedAt || null
        };
    }

    function persist(state) {
        state.updatedAt = new Date().toISOString();
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('History persistence failed', e);
        }
    }

    function genThreadId() {
        return 't_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }

    function deriveTitle(text) {
        if (!text) return 'Tanpa judul';
        const clean = String(text).replace(/\s+/g, ' ').trim();
        if (!clean) return 'Tanpa judul';
        if (clean.length <= TITLE_MAX_LEN) return clean;
        return clean.slice(0, TITLE_MAX_LEN).trim() + '...';
    }

    function pruneThreads(state) {
        if (state.threads.length <= MAX_THREADS) return;
        state.threads.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        state.threads = state.threads.slice(0, MAX_THREADS);
    }

    function createHistoryManager() {
        let state = loadState();

        function createThread(firstUserMessage) {
            const now = new Date().toISOString();
            const thread = {
                id: genThreadId(),
                title: deriveTitle(firstUserMessage),
                createdAt: now,
                updatedAt: now,
                messages: []
            };
            state.threads.unshift(thread);
            pruneThreads(state);
            persist(state);
            return thread;
        }

        function appendMessage(threadId, message) {
            const thread = state.threads.find(t => t.id === threadId);
            if (!thread) return null;

            const entry = {
                role: message.role,
                content: message.content || '',
                timestamp: new Date().toISOString()
            };
            if (message.kind) entry.kind = message.kind;
            if (message.picks) entry.picks = message.picks;
            if (message.reasoning) entry.reasoning = message.reasoning;
            if (message.modelUsed) entry.modelUsed = message.modelUsed;
            if (message.keyUsed) entry.keyUsed = message.keyUsed;
            if (message.error) entry.error = message.error;

            thread.messages.push(entry);
            thread.updatedAt = entry.timestamp;

            if (thread.messages.length === 1 && message.role === 'user' && (!thread.title || thread.title === 'Tanpa judul')) {
                thread.title = deriveTitle(message.content);
            }

            persist(state);
            return entry;
        }

        function getThread(threadId) {
            return state.threads.find(t => t.id === threadId) || null;
        }

        function listThreads() {
            return state.threads
                .slice()
                .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        }

        function deleteThread(threadId) {
            const before = state.threads.length;
            state.threads = state.threads.filter(t => t.id !== threadId);
            if (state.threads.length !== before) persist(state);
            return state.threads.length !== before;
        }

        function clearAll() {
            state = emptyState();
            persist(state);
        }

        function renameThread(threadId, newTitle) {
            const thread = state.threads.find(t => t.id === threadId);
            if (!thread) return false;
            thread.title = deriveTitle(newTitle);
            persist(state);
            return true;
        }

        function stats() {
            return {
                totalThreads: state.threads.length,
                totalMessages: state.threads.reduce((s, t) => s + (t.messages?.length || 0), 0),
                updatedAt: state.updatedAt
            };
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
                const seenIds = new Set(state.threads.map(t => t.id));
                incoming.threads.forEach(t => {
                    if (!seenIds.has(t.id)) state.threads.push(t);
                });
                pruneThreads(state);
            }
            persist(state);
            return state.threads.length;
        }

        return {
            createThread,
            appendMessage,
            getThread,
            listThreads,
            deleteThread,
            clearAll,
            renameThread,
            stats,
            exportJson,
            importJson
        };
    }

    global.EscHistory = {
        createHistoryManager,
        deriveTitle,
        MAX_THREADS,
        TITLE_MAX_LEN
    };
})(typeof window !== 'undefined' ? window : globalThis);
