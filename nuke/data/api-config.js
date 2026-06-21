/* ====================================================================
 * API Config - Gemini API keys + round-robin strategy
 * ------------------------------------------------------------------------
 * Key rotation strategy:
 *  - Round-robin index, skip keys in cooldown
 *  - Concurrent execution: 1 call per key at a time (max parallel = 5)
 *  - Per-key cooldown: 8 seconds between successful calls
 *  - Failure handling: 429 (rate limit) or 5xx → exponential backoff per-key
 *  - Total failure fallback: return null → caller uses local engine
 * ====================================================================== */

(function () {
  'use strict';

  const API_KEYS = [
    'AIzaSyA24pubv_TNApiaT_xjR9DacQurQ6j6d_k',
    'AIzaSyDXavq2Rb65hBYTMFnSnushD8xS9Gy-kaE',
    'AIzaSyCFr4s8iWv5SikOB8mVi9I3H5OJopTZt5I',
    'AIzaSyC7W96LJjm4EBRTkVYZZyDkQNm1cqJHzeo',
    'AIzaSyC3RMpJ65vcknXWtzs5tWFjTclrdJSWEpQ'
  ];

  const CONFIG = {
    model: 'gemini-2.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    perKeyCooldownMs: 8000,
    maxRetriesPerKey: 2,
    requestTimeoutMs: 25000,
    maxConcurrentKeys: API_KEYS.length
  };

  /* Per-key state: cooldown timer, fail counter, disabled flag */
  const keyState = API_KEYS.map(() => ({
    lastUsed: 0,
    consecutiveFail: 0,
    disabledUntil: 0
  }));

  let nextKeyIndex = 0;

  function pickKey() {
    const now = Date.now();
    const n = API_KEYS.length;
    for (let i = 0; i < n; i++) {
      const idx = (nextKeyIndex + i) % n;
      const s = keyState[idx];
      if (s.disabledUntil > now) continue;
      if (now - s.lastUsed < CONFIG.perKeyCooldownMs) continue;
      if (s.consecutiveFail >= CONFIG.maxRetriesPerKey) {
        s.disabledUntil = now + 60000;
        s.consecutiveFail = 0;
        continue;
      }
      nextKeyIndex = (idx + 1) % n;
      return { key: API_KEYS[idx], index: idx };
    }
    return null;
  }

  function reportSuccess(idx) {
    keyState[idx].lastUsed = Date.now();
    keyState[idx].consecutiveFail = 0;
  }

  function reportFailure(idx) {
    keyState[idx].consecutiveFail++;
    keyState[idx].lastUsed = Date.now();
  }

  /* Build the prompt for one area */
  function buildPrompt(name, areaLabel, indicators) {
    const valueCounts = { BSB: 0, BSH: 0, MB: 0, BB: 0 };
    indicators.forEach((i) => { valueCounts[i.value]++; });
    let dominant = 'BB';
    for (const v of ['BSB', 'BSH', 'MB', 'BB']) {
      if (valueCounts[v] > 0) { dominant = v; break; }
    }
    const hasGap = valueCounts.MB > 0 || valueCounts.BB > 0;
    const valueFull = {
      BSB: 'Berkembang Sangat Baik (BSB)',
      BSH: 'Berkembang Sesuai Harapan (BSH)',
      MB: 'Mulai Berkembang (MB)',
      BB: 'Belum Berkembang (BB)'
    }[dominant];

    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
      `TUGAS: Tulis 1 paragraf narasi rapor PAUD (anak usia 4-5 tahun) untuk area "${cap(areaLabel)}" atas nama ${name}.\n\n` +
      `NADA & GAYA:\n` +
      `- Hangat, natural, seperti ditulis guru TK berpengalaman, BUKAN terdengar seperti AI.\n` +
      `- Bahasa Indonesia baku, humanis, tidak kaku.\n` +
      `- Variasikan diksi, jangan repetitif ("sangat X" max 2x per paragraf).\n\n` +
      `PANJANG & STRUKTUR (PATUH, JANGAN LEWATI KALIMAT APAPUN):\n` +
      `1. Kalimat pembuka (TULIS PERSIS): "Pada elemen Capaian Pembelajaran ${cap(areaLabel)} di Semester II ini, ${name} menunjukkan kemampuan ${valueFull}."\n` +
      `2. Kalimat isi (1-2 kalimat): JANGAN list nama indikator spesifik. Cukup jelaskan kemampuan generik berdasarkan value dominan "${dominant}".\n` +
      (hasGap
        ? `3. Kalimat gap (WAJIB ADA karena ada MB/BB): "Beberapa hal yang masih perlu ditingkatkan adalah ${gapHint(dominant)}."\n`
        : '') +
      `${hasGap ? '4' : '3'}. Kalimat penutup鼓励 (WAJIB ADA, TIDAK BOLEH terpotong): buat 1 kalimat motivasi HANGAT yang menyebut nama ${name} di akhir, diakhiri dengan tanda seru (!) atau titik.\n\n` +
      `ATURAN KRITIS:\n` +
      `- SELESAIKAN seluruh paragraf. JANGAN berhenti di tengah kalimat. Kalimat terakhir HARUS diakhiri "!" atau ".".\n` +
      `- Pakai kata ganti "Ia" (bukan nama ulang) di kalimat 2.\n` +
      `- JANGAN list nama indikator/alat spesifik (mis. "Spindle Box", "Knobless cylinder").\n` +
      `- JANGAN pakai markdown, bullet, atau label. Output PARAGRAF POLOS saja.\n` +
      `- JANGAN tambah label area atau heading.\n\n` +
      `CONTOH OUTPUT YANG BENAR (4 kalimat):\n` +
      `"Pada elemen Capaian Pembelajaran Nilai Agama dan Budi Pekerti di Semester II ini, Aaron menunjukkan kemampuan Berkembang Sangat Baik (BSB). Ia sangat aktif dan mandiri dalam kegiatan ibadah dan pembiasaan rohani di sekolah. Beberapa hal yang masih perlu dikembangkan adalah kemampuan menjalankan ibadah secara mandiri dengan lebih konsisten. Terus bersinar dalam kebaikan, Aaron!"\n\n` +
      `Sekarang tulis untuk ${name} (${dominant} dominan), value penuh "${valueFull}":`
    );
  }

  function gapHint(value) {
    if (value === 'MB') return 'mengembangkan kemampuan secara bertahap dengan bimbingan';
    if (value === 'BB') return 'memperkenalkan kegiatan secara perlahan dan stimulasi rutin';
    return '';
  }

  /* Make one API call with a specific key */
  async function callOnce(key, prompt) {
    const url = `${CONFIG.endpoint}/${CONFIG.model}:generateContent?key=${key}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.requestTimeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1500,
            topP: 0.9
          }
        })
      });
      clearTimeout(timer);
      if (!res.ok) {
        return { ok: false, status: res.status, error: 'HTTP ' + res.status };
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return { ok: false, status: 200, error: 'Empty response' };
      return { ok: true, text: text.trim() };
    } catch (e) {
      clearTimeout(timer);
      return { ok: false, status: 0, error: e.name === 'AbortError' ? 'Timeout' : e.message };
    }
  }

  /* Public: regenerate one area with round-robin key selection */
  async function regenerateArea(name, areaKey, areaLabel, indicators) {
    if (!indicators || indicators.length === 0) {
      return { ok: false, text: '', source: 'local', error: 'No indicators' };
    }
    const prompt = buildPrompt(name, areaLabel, indicators);
    const maxAttempts = API_KEYS.length * CONFIG.maxRetriesPerKey;
    let lastError = null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const picked = pickKey();
      if (!picked) {
        await new Promise((r) => setTimeout(r, CONFIG.perKeyCooldownMs));
        continue;
      }
      const result = await callOnce(picked.key, prompt);
      if (result.ok) {
        reportSuccess(picked.index);
        return { ok: true, text: cleanOutput(result.text), source: 'ai' };
      }
      lastError = result.error;
      reportFailure(picked.index);
      if (result.status === 429 || result.status >= 500) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
    return { ok: false, text: '', source: 'ai', error: lastError || 'All keys failed' };
  }

  /* Strip any leading label/preamble the model may add */
  function cleanOutput(text) {
    if (!text) return '';
    let out = text;
    out = out.replace(/^```[\s\S]*?\n/, '').replace(/```$/, '').trim();
    out = out.replace(/^(Narasi|Deskripsi|Output|Hasil|Jawaban)\s*:\s*/i, '');
    return out.trim();
  }

  function getStatus() {
    return {
      totalKeys: API_KEYS.length,
      keyState: keyState.map((s, i) => ({
        index: i,
        keyTail: API_KEYS[i].slice(-6),
        lastUsed: s.lastUsed,
        consecutiveFail: s.consecutiveFail,
        disabledUntil: s.disabledUntil
      }))
    };
  }

  window.PAUD_AI = {
    CONFIG, API_KEYS,
    regenerateArea, getStatus,
    buildPrompt
  };
})();
