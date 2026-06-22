/* ====================================================================
 * PAUD Narasi Rapor Otomatis - Engine utama
 * --------------------------------------------------------------------
 * Pure vanilla JS, no framework. Namespace PAUD.
 *
 * Pipeline:
 *   rawText --normalize--> cleanJson --parse--> students
 *   students --generateReportForStudent--> { nilaiAgama, jatiDiri, literasiSteam }
 *   reports --buildPlainText--> clipboard-ready text
 * ================================================================== */

(function () {
  'use strict';

  const GUIDES = {
    nilaiAgama: window.PAUD_STYLE_GUIDE.nilaiAgama,
    jatiDiri: window.PAUD_STYLE_GUIDE.jatiDiri,
    literasiSteam: window.PAUD_STYLE_GUIDE.literasiSteam,
  };
  const TEMPLATES = window.PAUD_TEMPLATES;
  const VALUE_LABELS = window.PAUD_VALUE_LABELS;
  const LIST_JOINER = ' · ';

  /* ================================================================
   * STATE — rotation counter (deterministic, bukan Math.random)
   * Reset setiap page load (consistent across same session).
   * ============================================================ */
  const rotationCounters = {
    phrases: {
      nilaiAgama: { BSB: 0, BSH: 0, MB: 0, BB: 0 },
      jatiDiri: { BSB: 0, BSH: 0, MB: 0, BB: 0 },
      literasiSteam: { BSB: 0, BSH: 0, MB: 0, BB: 0 },
    },
    closings: { nilaiAgama: 0, jatiDiri: 0, literasiSteam: 0 },
  };

  function resetRotation() {
    Object.keys(rotationCounters.phrases).forEach((area) => {
      Object.keys(rotationCounters.phrases[area]).forEach((v) => {
        rotationCounters.phrases[area][v] = 0;
      });
    });
    Object.keys(rotationCounters.closings).forEach((a) => {
      rotationCounters.closings[a] = 0;
    });
  }

  function nextPhrase(area, value) {
    const pool = GUIDES[area].phrases[value];
    const idx = rotationCounters.phrases[area][value]++ % pool.length;
    return pool[idx];
  }

  function nextClosing(area) {
    const pool = GUIDES[area].closings;
    const idx = rotationCounters.closings[area]++ % pool.length;
    return pool[idx].replace('{name}', '{name}');
  }

  /* ================================================================
   * NORMALIZER — toleransi input kotor (BOM, smart-quote, trailing)
   * ============================================================ */
  function normalizeJsonInput(raw) {
    if (typeof raw !== 'string') return '';
    return raw
      .replace(/^\uFEFF/, '')
      .replace(/[“”„‟]/g, '"')
      .replace(/[‘’‚‛]/g, "'")
      .replace(/,(\s*[}\]])/g, '$1')
      .trim();
  }

  /* ================================================================
   * PARSER — return { ok, students, error }
   * ============================================================ */
  function parseStudentData(rawJson) {
    const clean = normalizeJsonInput(rawJson);
    if (!clean) {
      return { ok: false, error: 'Data kosong. Tempel JSON atau unggah file.' };
    }
    let data;
    try {
      data = JSON.parse(clean);
    } catch (e) {
      return {
        ok: false,
        error: 'Format JSON tidak valid: ' + e.message + '. Periksa koma, tanda kutip, atau kurung.',
      };
    }
    if (!Array.isArray(data)) {
      return { ok: false, error: 'Data harus berupa array objek siswa.' };
    }
    if (data.length === 0) {
      return { ok: false, error: 'Array siswa kosong.' };
    }
    for (let i = 0; i < data.length; i++) {
      const s = data[i];
      if (!s || typeof s !== 'object') {
        return { ok: false, error: 'Siswa ke-' + (i + 1) + ' bukan objek.' };
      }
      if (typeof s.name !== 'string' || !s.name.trim()) {
        return { ok: false, error: 'Siswa ke-' + (i + 1) + ' tidak memiliki nama.' };
      }
      if (!s.achievements || typeof s.achievements !== 'object') {
        return { ok: false, error: 'Siswa "' + s.name + '" tidak memiliki field achievements.' };
      }
      for (const area of ['nilaiAgama', 'jatiDiri', 'literasiSteam']) {
        const arr = s.achievements[area];
        if (!Array.isArray(arr)) {
          return { ok: false, error: 'Siswa "' + s.name + '" field achievements.' + area + ' bukan array.' };
        }
        for (let j = 0; j < arr.length; j++) {
          const ind = arr[j];
          if (!ind || typeof ind.indicator !== 'string' || typeof ind.value !== 'string') {
            return { ok: false, error: 'Siswa "' + s.name + '" indikator ke-' + (j + 1) + ' di area ' + area + ' tidak valid.' };
          }
          if (!['BSB', 'BSH', 'MB', 'BB'].includes(ind.value)) {
            return { ok: false, error: 'Siswa "' + s.name + '" nilai indikator "' + ind.indicator + '" (' + ind.value + ') tidak valid. Harus BSB/BSH/MB/BB.' };
          }
        }
      }
    }
    return { ok: true, students: data };
  }

  /* ================================================================
   * AGGREGATOR — kelompokkan indikator per value dalam 1 area
   * ============================================================ */
  function groupByValue(indicators) {
    const groups = { BSB: [], BSH: [], MB: [], BB: [] };
    indicators.forEach((ind) => {
      groups[ind.value].push(ind.indicator);
    });
    return groups;
  }

  function joinList(items, joiner) {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + ' dan ' + items[1];
    return items.slice(0, -1).join(joiner) + ' dan ' + items[items.length - 1];
  }

  /* ================================================================
   * DETECT MANDARIN — override path untuk Literasi & STEAM
   * ============================================================ */
  function isMandarinIndicator(indicator) {
    return /mandarin|mandarin/i.test(indicator);
  }

  function findMandarinGroup(indicators) {
    const mandarinItems = indicators.filter((i) => isMandarinIndicator(i.indicator));
    if (mandarinItems.length === 0) return null;
    const dominant = ['BSB', 'BSH', 'MB', 'BB'].find((v) =>
      mandarinItems.some((i) => i.value === v)
    );
    return { value: dominant, items: mandarinItems.map((i) => i.indicator) };
  }

  /* ================================================================
   * VALUE LABEL — pilih label VALUE untuk paragraf pembuka
   * Jika ada BSB/BSH dominan, pakai itu. Jika semua MB/BB, pakai MB.
   * ============================================================ */
  function dominantValue(indicators) {
    const counts = { BSB: 0, BSH: 0, MB: 0, BB: 0 };
    indicators.forEach((i) => counts[i.value]++);
    if (counts.BSB > 0) return 'BSB';
    if (counts.BSH > 0) return 'BSH';
    if (counts.MB > 0) return 'MB';
    return 'BB';
  }
  /* ================================================================
   * CORE — generateReportForStudent (v2: ringkas, tanpa list indikator)
   * Output per area mengikuti gaya natural guru TK (~3-5 kalimat):
   *  - 1 kalimat opening (nama + area + value)
   *  - 1 kalimat achievement (frasa umum, tanpa list)
   *  - 0-1 kalimat gap (jika ada MB/BB, generic — bukan nama indikator)
   *  - 0-1 kalimat Mandarin (khusus Literasi & STEAM, jika ada)
   *  - 1 kalimat closing鼓励
   * Repetisi nama diminimalkan: setelah opening pakai "Ia".
   * ============================================================ */
  function generateReportForStudent(student) {
    const name = student.name.trim();
    const reports = {};

    ['nilaiAgama', 'jatiDiri', 'literasiSteam'].forEach((area) => {
      const indicators = student.achievements[area] || [];
      const tpl = TEMPLATES[area];
      const label = GUIDES[area].meta.label;
      const pronouns = ['Ia'];

      if (indicators.length === 0) {
        const open = tpl.open
          .replace('{label}', label)
          .replace('{name}', name)
          .replace('{value}', 'perkembangan yang bervariasi');
        const fallbackClosing = 'Terus semangat belajar, ' + name + '!';
        reports[area] = (open + tpl.closing.replace('{closing}', fallbackClosing)).trim();
        return;
      }

      const nonMandarin = area === 'literasiSteam'
        ? indicators.filter((i) => !isMandarinIndicator(i.indicator))
        : indicators;
      const groups = groupByValue(nonMandarin);
      const value = dominantValue(indicators);
      const valueLabel = VALUE_LABELS[value];

      const positiveValues = ['BSB', 'BSH'];
      const hasPositive = positiveValues.some((v) => groups[v].length > 0);
      const hasNegative = groups.MB.length > 0 || groups.BB.length > 0;

      let body = '';
      const pronoun = pronouns[0];

      if (hasPositive) {
        const topPositive = positiveValues.find((v) => groups[v].length > 0);
        const phrase = nextPhrase(area, topPositive);
        body += tpl.achv
          .replace('{pronoun}', pronoun)
          .replace('{achv}', phrase);
      } else if (hasNegative) {
        const negativeValue = groups.MB.length > 0 ? 'MB' : 'BB';
        const phrase = nextPhrase(area, negativeValue);
        body += tpl.achv
          .replace('{pronoun}', pronoun)
          .replace('{achv}', phrase);
      }

      if (area === 'literasiSteam') {
        const mandarin = findMandarinGroup(indicators);
        if (mandarin) {
          const overridePhrase = GUIDES.literasiSteam.overrides.mandarin[mandarin.value];
          body += tpl.mandarin.replace('{mandarinAchv}', overridePhrase);
        }
      }

      if (hasNegative) {
        const gapValue = groups.MB.length > 0 ? 'MB' : 'BB';
        const gapText = window.PAUD_GAP_GENERIC[area][gapValue];
        body += tpl.gap
          .replace('{pronoun}', pronoun)
          .replace('{gapText}', gapText);
      }

      const closingRaw = nextClosing(area);
      const closing = closingRaw.replace('{name}', name);

      const open = tpl.open
        .replace('{label}', label)
        .replace('{name}', name)
        .replace('{value}', valueLabel);

      reports[area] = (open + body + tpl.closing.replace('{closing}', closing)).trim();
    });

    return { name, reports };
  }

  function generateAll(students) {
    return students.map(generateReportForStudent);
  }

  /* ================================================================
   * PLAIN TEXT — format untuk clipboard
   * Blank line BETWEEN students. NO blank line between areas.
   * ============================================================ */
  function buildPlainText(generated) {
    return generated
      .map((entry) => {
        const blocks = ['nilaiAgama', 'jatiDiri', 'literasiSteam'].map((a) => {
          const areaLabel = GUIDES[a].meta.label;
          const text = getText(entry, a);
          return areaLabel.toUpperCase() + '\nDeskripsi / Description:\n' + text;
        });
        return '### ' + toTitleCase(entry.name) + '\n\n' + blocks.join('\n\n');
      })
      .join('\n\n');
  }

  /* ================================================================
   * CLIPBOARD — modern API + execCommand fallback
   * ============================================================ */
  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        /* fall through */
      }
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  /* ================================================================
   * STATE
   * lastGenerated[idx].reports[area] = { local: '...', ai: '...' | null }
   * activeVersion[area] = 'local' | 'ai'  (which one is shown by default)
   * ============================================================ */
  const lastGenerated = [];
  let xlsxParsed = null;
  const activeVersion = {};
  let compareMode = false;
  const settings = {
    model: 'gemini-2.5-flash',
    maxOutputTokens: 1500,
    temperature: 0.6,
    perKeyCooldownSec: 8
  };

  function getText(entry, area) {
    if (!entry) return '';
    const v = entry.reports[area];
    if (!v) return '';
    const prefer = activeVersion[area] || 'local';
    return v[prefer] || v.local || v.ai || '';
  }
  function getLocal(entry, area) { return entry?.reports?.[area]?.local || ''; }
  function getAI(entry, area) { return entry?.reports?.[area]?.ai || null; }

  /* ================================================================
   * RENDER — v3: dual text (local + AI), compare toggle, theme
   * ============================================================ */
  function renderReports(generated) {
    const container = document.querySelector('[data-region="output-list"]');
    const counter = document.querySelector('[data-region="output-count"]');
    container.innerHTML = '';
    if (generated.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'output-empty';
      empty.innerHTML = '<p>Belum ada narasi.</p><p class="muted">Tempel data atau unggah xlsx, lalu klik "Generate Laporan".</p>';
      container.appendChild(empty);
      if (counter) counter.textContent = '0 siswa';
      return;
    }
    if (counter) counter.textContent = generated.length + ' siswa';
    generated.forEach((entry, idx) => {
      const article = document.createElement('article');
      article.className = 'student-report';
      article.dataset.studentIndex = String(idx);

      const h3 = document.createElement('h3');
      const nameText = document.createElement('span');
      nameText.className = 'name-text';
      nameText.textContent = '### ' + toTitleCase(entry.name);
      h3.appendChild(nameText);

      const aiAllBtn = document.createElement('button');
      aiAllBtn.type = 'button';
      aiAllBtn.className = 'btn-mini btn-mini--ai';
      aiAllBtn.textContent = 'AI Semua';
      aiAllBtn.title = 'Regenerate semua area via Gemini';
      aiAllBtn.dataset.action = 'ai-student';
      aiAllBtn.dataset.studentIndex = String(idx);
      h3.appendChild(aiAllBtn);
      article.appendChild(h3);

      ['nilaiAgama', 'jatiDiri', 'literasiSteam'].forEach((a) => {
        const block = document.createElement('div');
        block.className = 'area-block';
        block.dataset.area = a;

        const labelRow = document.createElement('div');
        labelRow.className = 'area-label';
        const areaText = document.createElement('span');
        areaText.textContent = GUIDES[a].meta.label;
        labelRow.appendChild(areaText);

        const labelRight = document.createElement('div');
        labelRight.className = 'btn-mini-row';
        const source = document.createElement('span');
        source.className = 'area-source area-source--local';
        source.textContent = 'LOKAL';
        source.dataset.role = 'source';
        labelRight.appendChild(source);

        const regenBtn = document.createElement('button');
        regenBtn.type = 'button';
        regenBtn.className = 'btn-mini';
        regenBtn.textContent = 'AI';
        regenBtn.title = 'Regenerate area ini via Gemini';
        regenBtn.dataset.action = 'ai-area';
        regenBtn.dataset.studentIndex = String(idx);
        regenBtn.dataset.area = a;
        labelRight.appendChild(regenBtn);
        labelRow.appendChild(labelRight);
        block.appendChild(labelRow);

        const p = document.createElement('p');
        p.className = 'area-text';
        p.dataset.role = 'text';
        p.textContent = getText(entry, a);
        block.appendChild(p);

        const compare = document.createElement('div');
        compare.className = 'area-compare';
        compare.dataset.role = 'compare';
        const compareLabel = document.createElement('strong');
        compareLabel.textContent = 'Versi LOKAL (original)';
        compare.appendChild(compareLabel);
        const compareText = document.createElement('div');
        compareText.dataset.role = 'compare-text';
        compareText.textContent = getLocal(entry, a);
        compare.appendChild(compareText);
        block.appendChild(compare);

        article.appendChild(block);
      });
      container.appendChild(article);
    });
    applyCompareMode();
  }

  function applyCompareMode() {
    document.querySelectorAll('.student-report').forEach((article) => {
      article.classList.toggle('show-compare', compareMode);
      article.querySelectorAll('.area-block').forEach((block) => {
        const idx = parseInt(article.dataset.studentIndex, 10);
        const area = block.dataset.area;
        const entry = lastGenerated[idx];
        const hasAI = !!getAI(entry, area);
        block.classList.toggle('area-block--compared', compareMode && hasAI);
        const ai = getAI(entry, area);
        const compareEl = block.querySelector('[data-role="compare"]');
        const compareText = block.querySelector('[data-role="compare-text"]');
        if (compareMode && ai) {
          compareText.textContent = ai;
        } else if (compareMode && !ai) {
          compareText.textContent = '(Belum ada versi AI. Klik "AI" untuk generate.)';
        } else {
          compareText.textContent = getLocal(entry, area);
        }
      });
    });
  }

  function toTitleCase(s) {
    if (!s) return '';
    return s
      .toLowerCase()
      .split(/(\s+|-)/)
      .map((w) => {
        if (/^\s+$/.test(w) || w === '-') return w;
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join('')
      .replace(/\bMc([a-z])/g, (_, c) => 'Mc' + c.toUpperCase())
      .replace(/\bMac([a-z])/g, (_, c) => 'Mac' + c.toUpperCase());
  }

  /* ================================================================
   * ERROR UX
   * ============================================================ */
  function showError(msg) {
    const region = document.querySelector('[data-region="error"]');
    const msgEl = region.querySelector('[data-error-message]');
    msgEl.textContent = msg;
    region.hidden = false;
  }
  function clearError() {
    const region = document.querySelector('[data-region="error"]');
    region.hidden = true;
    region.querySelector('[data-error-message]').textContent = '';
  }

  function showToast(msg) {
    const t = document.querySelector('[data-region="toast"]');
    t.textContent = msg;
    t.classList.add('toast--show');
    setTimeout(() => t.classList.remove('toast--show'), 2400);
  }

  function refreshNoKeyBanner() {
    const banner = document.querySelector('[data-region="no-key-banner"]');
    if (!banner) return;
    const hasKey = window.PAUD_AI && window.PAUD_AI.API_KEYS.length > 0;
    banner.hidden = hasKey;
  }

  /* ================================================================
   * PROGRESS WIDGET — Google Drive-style floating cards
   * Lifecycle: pending → running → success | fail → stay 4s → dismiss
   * ============================================================ */
  const progressStack = () => document.querySelector('[data-region="progress-stack"]');
  const AREA_LABEL_SHORT = {
    nilaiAgama: 'Nilai Agama',
    jatiDiri: 'Jati Diri',
    literasiSteam: 'Literasi & STEAM'
  };

  function createProgressCard({ id, title, steps }) {
    const stack = progressStack();
    const old = document.getElementById(id);
    if (old) old.remove();
    const card = document.createElement('div');
    card.className = 'progress-card progress-card--running';
    card.id = id;
    card.dataset.title = title;
    card.innerHTML =
      '<div class="progress-card__header">' +
        '<div class="progress-card__icon" data-role="icon">…</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="progress-card__title" data-role="title">' + escapeHtml(title) + '</div>' +
          '<div class="progress-card__sub" data-role="sub">Memulai…</div>' +
        '</div>' +
        '<button type="button" class="progress-card__close" data-action="dismiss" aria-label="Dismiss">×</button>' +
      '</div>' +
      '<div class="progress-card__bar"><div class="progress-card__bar-fill" data-role="fill"></div></div>' +
      '<div class="progress-card__steps" data-role="steps"></div>';
    const stepsEl = card.querySelector('[data-role="steps"]');
    steps.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'progress-step';
      row.dataset.stepIndex = String(i);
      row.innerHTML =
        '<span class="progress-step__dot" data-role="dot">' + (i + 1) + '</span>' +
        '<span data-role="step-label">' + escapeHtml(s) + '</span>';
      stepsEl.appendChild(row);
    });
    card.querySelector('[data-action="dismiss"]').addEventListener('click', () => dismissProgress(id));
    stack.appendChild(card);
    return {
      el: card,
      setRunning(idx) { updateStep(card, idx, 'running'); card.querySelector('[data-role="sub"]').textContent = 'Memproses ' + AREA_LABEL_SHORT[steps[idx]] + '…'; },
      setSuccess(idx) { updateStep(card, idx, 'success'); },
      setFail(idx, msg) { updateStep(card, idx, 'fail', msg); },
      setBar(pct) { card.querySelector('[data-role="fill"]').style.width = pct + '%'; },
      setSub(text) { card.querySelector('[data-role="sub"]').textContent = text; },
      setIcon(state, label) {
        const icon = card.querySelector('[data-role="icon"]');
        icon.textContent = state === 'success' ? '✓' : (state === 'fail' ? '✕' : (label || '…'));
        if (state === 'success') card.classList.remove('progress-card--running'), card.classList.add('progress-card--success');
        else if (state === 'fail') card.classList.remove('progress-card--running'), card.classList.add('progress-card--fail');
      },
      finish(success, summary) {
        if (success) {
          card.classList.remove('progress-card--running');
          card.classList.add('progress-card--success');
          card.querySelector('[data-role="icon"]').textContent = '✓';
        } else {
          card.classList.remove('progress-card--running');
          card.classList.add('progress-card--fail');
          card.querySelector('[data-role="icon"]').textContent = '!';
        }
        card.querySelector('[data-role="sub"]').textContent = summary;
        autoDismiss(id);
      }
    };
  }

  function updateStep(card, idx, state, msg) {
    const step = card.querySelectorAll('.progress-step')[idx];
    if (!step) return;
    step.classList.remove('progress-step--running', 'progress-step--success', 'progress-step--fail');
    step.classList.add('progress-step--' + state);
    if (msg) {
      const label = step.querySelector('[data-role="step-label"]');
      label.textContent = AREA_LABEL_SHORT[Object.keys(AREA_LABEL_SHORT)[idx]] + ' — ' + msg;
    }
  }

  function autoDismiss(id) {
    setTimeout(() => dismissProgress(id), 4000);
  }

  function dismissProgress(id) {
    const card = document.getElementById(id);
    if (!card) return;
    card.classList.add('progress-card--leaving');
    setTimeout(() => card.remove(), 320);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function switchTab(target) {
    document.querySelectorAll('[role="tab"]').forEach((t) => {
      const active = t.dataset.tab === target;
      t.classList.toggle('tab--active', active);
      t.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('[data-tab-panel]').forEach((p) => {
      p.hidden = p.dataset.tabPanel !== target;
    });
  }

  /* ================================================================
   * THEME
   * ============================================================ */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('paud-theme', theme); } catch (e) {}
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(cur === 'light' ? 'dark' : 'light');
  }
  function initTheme() {
    let saved = 'light';
    try { saved = localStorage.getItem('paud-theme') || 'light'; } catch (e) {}
    applyTheme(saved);
  }

  /* ================================================================
   * SETTINGS PANEL
   * ============================================================ */
  function openSettings() {
    populateSettingsForm();
    document.querySelector('[data-region="settings"]').hidden = false;
  }
  function closeSettings() {
    document.querySelector('[data-region="settings"]').hidden = true;
  }
  function populateSettingsForm() {
    document.querySelector('[data-setting="model"]').value = settings.model;
    document.querySelector('[data-setting="maxOutputTokens"]').value = settings.maxOutputTokens;
    document.querySelector('[data-setting="temperature"]').value = settings.temperature;
    document.querySelector('[data-setting="perKeyCooldownSec"]').value = settings.perKeyCooldownSec;
    renderKeyList();
  }
  function renderKeyList() {
    const list = document.querySelector('[data-region="key-list"]');
    list.innerHTML = '';
    const keys = window.PAUD_AI.API_KEYS;
    const st = window.PAUD_AI.getStatus().keyState;
    const now = Date.now();
    keys.forEach((key, i) => {
      const s = st[i] || { lastUsed: 0, disabledUntil: 0, consecutiveFail: 0, invalid: false, invalidReason: '' };
      let cls = 'key-status--ready', label = 'READY';
      if (s.invalid) { cls = 'key-status--invalid'; label = 'INVALID'; }
      else if (s.disabledUntil > now) { cls = 'key-status--disabled'; label = 'DISABLED'; }
      else if (now - s.lastUsed < settings.perKeyCooldownSec * 1000) { cls = 'key-status--cooldown'; label = 'COOLDOWN'; }
      const item = document.createElement('div');
      item.className = 'key-item';
      const reason = s.invalidReason ? ' title="' + escapeHtml(s.invalidReason) + '"' : '';
      item.innerHTML =
        '<span class="key-tail" data-action="clear-invalid" data-key-index="' + i + '" style="cursor:pointer;" title="Klik untuk reset status INVALID">' +
        'Key #' + (i + 1) + ': …' + key.slice(-6) + '</span>' +
        '<span class="key-status ' + cls + '"' + reason + '>' + label + '</span>';
      list.appendChild(item);
    });
  }

  function loadKeysFromStorage() {
    try {
      const stored = localStorage.getItem('paud-api-keys');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          window.PAUD_AI.API_KEYS.length = 0;
          parsed.forEach((k) => window.PAUD_AI.API_KEYS.push(k));
          window.PAUD_AI.API_KEYS.forEach((_, i) => {
            const st = window.PAUD_AI.getStatus().keyState[i];
            if (st) { st.lastUsed = 0; st.disabledUntil = 0; st.consecutiveFail = 0; }
          });
        }
      }
    } catch (e) {}
    refreshNoKeyBanner();
  }
  function saveKeysToStorage() {
    try { localStorage.setItem('paud-api-keys', JSON.stringify(window.PAUD_AI.API_KEYS.slice())); } catch (e) {}
  }
  function setKeyActionStatus(msg) {
    const el = document.querySelector('[data-region="key-action-status"]');
    if (el) el.textContent = msg;
  }
  function addKey() {
    const input = document.querySelector('[data-input="new-key"]');
    if (!input) return;
    const k = (input.value || '').trim();
    if (!k) { setKeyActionStatus('API key kosong.'); return; }
    if (!/^(AIza[0-9A-Za-z_\-]{20,}|AQ\.[A-Za-z0-9_\-]{20,})$/.test(k)) {
      setKeyActionStatus('Format tidak valid. Key Gemini biasanya mulai dengan "AIza" atau "AQ.". Periksa kembali key di aistudio.google.com/apikey.');
      return;
    }
    window.PAUD_AI.API_KEYS.push(k);
    if (window.PAUD_AI.ensureKeyStateLength) window.PAUD_AI.ensureKeyStateLength();
    saveKeysToStorage();
    input.value = '';
    setKeyActionStatus('Key #' + window.PAUD_AI.API_KEYS.length + ' ditambahkan. Total: ' + window.PAUD_AI.API_KEYS.length + ' key.');
    renderKeyList();
    refreshNoKeyBanner();
  }
  function replaceAllKeys() {
    const input = document.querySelector('[data-input="new-key"]');
    if (!input) return;
    const k = (input.value || '').trim();
    if (!k) { setKeyActionStatus('Masukkan key baru dulu sebelum replace.'); return; }
    if (!/^(AIza[0-9A-Za-z_\-]{20,}|AQ\.[A-Za-z0-9_\-]{20,})$/.test(k)) {
      setKeyActionStatus('Format tidak valid. Key Gemini biasanya mulai dengan "AIza" atau "AQ.".');
      return;
    }
    if (!confirm('Ganti semua ' + window.PAUD_AI.API_KEYS.length + ' key dengan key baru ini? Cooldown akan di-reset.')) return;
    window.PAUD_AI.API_KEYS.length = 0;
    window.PAUD_AI.API_KEYS.push(k);
    if (window.PAUD_AI.ensureKeyStateLength) window.PAUD_AI.ensureKeyStateLength();
    window.PAUD_AI.CONFIG.maxConcurrentKeys = 1;
    saveKeysToStorage();
    input.value = '';
    setKeyActionStatus('Semua key diganti. Total: 1 key.');
    renderKeyList();
    refreshNoKeyBanner();
  }
  function readSettingsForm() {
    settings.model = document.querySelector('[data-setting="model"]').value || 'gemini-2.5-flash';
    settings.maxOutputTokens = parseInt(document.querySelector('[data-setting="maxOutputTokens"]').value, 10) || 1500;
    settings.temperature = parseFloat(document.querySelector('[data-setting="temperature"]').value) || 0.6;
    settings.perKeyCooldownSec = parseInt(document.querySelector('[data-setting="perKeyCooldownSec"]').value, 10) || 8;
    if (window.PAUD_AI) {
      window.PAUD_AI.CONFIG.model = settings.model;
      window.PAUD_AI.CONFIG.maxOutputTokens = settings.maxOutputTokens;
      window.PAUD_AI.CONFIG.temperature = settings.temperature;
      window.PAUD_AI.CONFIG.perKeyCooldownMs = settings.perKeyCooldownSec * 1000;
    }
  }
  function resetCooldowns() {
    if (window.PAUD_AI) {
      window.PAUD_AI.API_KEYS.forEach((_, i) => {
        const st = window.PAUD_AI.getStatus().keyState[i];
        st.lastUsed = 0; st.disabledUntil = 0; st.consecutiveFail = 0;
      });
    }
    renderKeyList();
    showToast('Cooldowns direset.');
  }

  async function validateKeys() {
    if (!window.PAUD_AI || !window.PAUD_AI.validateAllKeys) return;
    const statusEl = document.querySelector('[data-region="validate-status"]');
    if (statusEl) statusEl.textContent = 'Memvalidasi ' + window.PAUD_AI.API_KEYS.length + ' key…';
    try {
      const results = await window.PAUD_AI.validateAllKeys();
      const ok = results.filter((r) => r.ok).length;
      const bad = results.filter((r) => !r.ok);
      if (statusEl) {
        statusEl.textContent = 'Hasil: ' + ok + '/' + results.length + ' key valid. ' +
          (bad.length > 0 ? 'Gagal: ' + bad.map((b) => '#' + (b.index + 1) + ' ' + b.error).join('; ') : '');
      }
      renderKeyList();
    } catch (e) {
      if (statusEl) statusEl.textContent = 'Error: ' + e.message;
    }
  }

  async function testConnection() {
    if (!window.PAUD_AI || !window.PAUD_AI.testConnection) return;
    const btn = document.querySelector('[data-action="test-connection"]');
    const out = document.querySelector('[data-region="test-result"]');
    if (!out) return;
    if (btn) btn.disabled = true;
    const oldLabel = btn ? btn.textContent : '';
    if (btn) btn.textContent = 'Testing…';
    out.hidden = false;
    out.className = 'test-result test-result--running';
    out.innerHTML = '<div class="test-result__head">Menghubungi Gemini API…</div>';

    try {
      const results = await window.PAUD_AI.testConnection();
      const okCount = results.filter((r) => r.ok).length;
      const lines = results.map((r) => {
        const tag = 'Key #' + (r.keyIndex + 1);
        if (r.ok) {
          const sample = r.sampleText ? ' <span class="test-sample">"' + escapeHtml(r.sampleText) + '"</span>' : '';
          return '<div class="test-row test-row--ok">' +
            '<span class="test-tag">' + tag + '</span>' +
            '<span class="test-status">✓ HTTP ' + r.status + ' · ' + r.latencyMs + 'ms</span>' +
            sample +
            '</div>';
        }
        return '<div class="test-row test-row--fail">' +
          '<span class="test-tag">' + tag + '</span>' +
          '<span class="test-status">✕ ' + escapeHtml(r.error) + ' · ' + r.latencyMs + 'ms</span>' +
          '</div>';
      }).join('');
      const summary = okCount + '/' + results.length + ' key berhasil · model: ' + results[0].model;
      out.className = 'test-result ' + (okCount > 0 ? 'test-result--ok' : 'test-result--fail');
      out.innerHTML =
        '<div class="test-result__head">' + summary + '</div>' +
        lines;
      renderKeyList();
    } catch (e) {
      out.className = 'test-result test-result--fail';
      out.innerHTML = '<div class="test-result__head">Error: ' + escapeHtml(e.message) + '</div>';
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = oldLabel; }
    }
  }

  /* ================================================================
   * EVENT WIRING
   * ============================================================ */
  function init() {
    const $ = (sel) => document.querySelector(sel);
    if (!$) return;
    const textarea = $('[data-input="json"]');
    if (!textarea) return;

    initTheme();
    if (window.PAUD_AI) {
      loadKeysFromStorage();
      refreshNoKeyBanner();
      if (window.PAUD_AI.API_KEYS.length > 0) {
        window.PAUD_AI.validateAllKeys()
          .then((results) => {
            const bad = results.filter((r) => !r.ok);
            if (bad.length > 0 && bad.length === results.length) {
              showError('Semua ' + results.length + ' API key tidak valid (HTTP ' + (bad[0].status || '?') + '). Regenerate AI tidak akan berfungsi. Buka Settings → Validasi Key untuk detail.');
            } else if (bad.length > 0) {
              showError(bad.length + ' dari ' + results.length + ' API key tidak valid. Regenerate AI hanya pakai key yang valid.');
            }
          })
          .catch(() => {});
      }
    }

    const xlsxFileInput = $('[data-input="xlsx-file"]');
    const btnSample = $('[data-action="load-sample"]');
    const btnGenerate = $('[data-action="generate"]');
    const btnCopy = $('[data-action="copy-all"]');
    const btnXlsxLoad = $('[data-action="xlsx-load"]');
    const btnXlsxClear = $('[data-action="xlsx-clear"]');
    if (!btnSample || !btnGenerate || !btnCopy) return;

    document.querySelectorAll('[role="tab"]').forEach((t) => {
      t.addEventListener('click', () => switchTab(t.dataset.tab));
    });

    btnSample.addEventListener('click', () => {
      textarea.value = JSON.stringify(window.PAUD_SAMPLE_STUDENTS, null, 2);
      clearError();
      switchTab('json');
    });

    if (xlsxFileInput) {
      xlsxFileInput.addEventListener('change', async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        clearError();
        const preview = document.querySelector('[data-xlsx-preview]');
        const summary = document.querySelector('[data-xlsx-summary]');
        const stat = document.querySelector('[data-xlsx-stat]');
        if (summary) summary.textContent = 'Membaca ' + f.name + '…';
        if (stat) stat.textContent = '';
        if (preview) preview.hidden = false;
        try {
          const result = await window.PAUD_XLSX.parseRekapFile(f);
          if (!result.ok) {
            showError(result.error);
            xlsxParsed = null;
            if (preview) preview.hidden = true;
            return;
          }
          xlsxParsed = result;
          const total = result.students.length;
          const ind = result.students.reduce((sum, s) =>
            sum + s.achievements.nilaiAgama.length + s.achievements.jatiDiri.length + s.achievements.literasiSteam.length, 0);
          if (summary) summary.textContent = 'Sheet "' + result.sheetName + '" berhasil di-parse: ' + total + ' siswa, ' + ind + ' indikator.';
          if (stat) stat.textContent = 'Rows dipindai: ' + result.stats.totalRows + ' · Row kategori: ' + result.stats.categoryRows + ' · Indikator terpetakan: ' + result.stats.mappedIndicators + (result.stats.skipped ? ' · Dilewati: ' + result.stats.skipped : '');
        } catch (err) {
          showError('Gagal parse xlsx: ' + (err.message || err));
          xlsxParsed = null;
          if (preview) preview.hidden = true;
        }
      });
    }

    if (btnXlsxLoad) {
      btnXlsxLoad.addEventListener('click', () => {
        if (!xlsxParsed) return;
        textarea.value = JSON.stringify(xlsxParsed.students, null, 2);
        clearError();
        switchTab('json');
        showToast(xlsxParsed.students.length + ' siswa dimuat ke editor JSON.');
      });
    }
    if (btnXlsxClear) {
      btnXlsxClear.addEventListener('click', () => {
        xlsxParsed = null;
        const preview = document.querySelector('[data-xlsx-preview]');
        if (preview) preview.hidden = true;
        if (xlsxFileInput) xlsxFileInput.value = '';
        clearError();
      });
    }

    btnGenerate.addEventListener('click', () => {
      clearError();
      resetRotation();
      const result = parseStudentData(textarea.value);
      if (!result.ok) {
        showError(result.error);
        lastGenerated.length = 0;
        renderReports([]);
        btnCopy.disabled = true;
        return;
      }
      const raw = generateAll(result.students);
      lastGenerated.length = 0;
      raw.forEach((r) => lastGenerated.push({
        name: r.name,
        reports: {
          nilaiAgama: { local: r.reports.nilaiAgama, ai: null },
          jatiDiri: { local: r.reports.jatiDiri, ai: null },
          literasiSteam: { local: r.reports.literasiSteam, ai: null }
        }
      }));
      renderReports(lastGenerated);
      btnCopy.disabled = lastGenerated.length === 0;
    });

    /* Theme toggle */
    document.querySelectorAll('[data-action="toggle-theme"]').forEach((b) => {
      b.addEventListener('click', toggleTheme);
    });
    /* Settings */
    document.querySelectorAll('[data-action="open-settings"]').forEach((b) => {
      b.addEventListener('click', openSettings);
    });
    document.querySelectorAll('[data-action="open-settings-from-banner"]').forEach((b) => {
      b.addEventListener('click', openSettings);
    });
    document.querySelectorAll('[data-action="close-settings"]').forEach((b) => {
      b.addEventListener('click', closeSettings);
    });
    const saveBtn = document.querySelector('[data-action="save-settings"]');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      readSettingsForm();
      closeSettings();
      showToast('Settings disimpan.');
    });
    const resetBtn = document.querySelector('[data-action="reset-cooldowns"]');
    if (resetBtn) resetBtn.addEventListener('click', resetCooldowns);
    const validateBtn = document.querySelector('[data-action="validate-keys"]');
    if (validateBtn) validateBtn.addEventListener('click', validateKeys);
    const testConnBtn = document.querySelector('[data-action="test-connection"]');
    if (testConnBtn) testConnBtn.addEventListener('click', testConnection);
    const keyList = document.querySelector('[data-region="key-list"]');
    if (keyList) keyList.addEventListener('click', (e) => {
      const tail = e.target.closest('[data-action="clear-invalid"]');
      if (!tail) return;
      const idx = parseInt(tail.dataset.keyIndex, 10);
      if (!isNaN(idx) && window.PAUD_AI && window.PAUD_AI.clearInvalid) {
        window.PAUD_AI.clearInvalid(idx);
        renderKeyList();
        showToast('Key #' + (idx + 1) + ' direset ke READY.');
      }
    });
    const addKeyBtn = document.querySelector('[data-action="add-key"]');
    if (addKeyBtn) addKeyBtn.addEventListener('click', addKey);
    const replaceKeysBtn = document.querySelector('[data-action="replace-all-keys"]');
    if (replaceKeysBtn) replaceKeysBtn.addEventListener('click', replaceAllKeys);
    /* Refresh key status every 2s while settings is open */
    setInterval(() => {
      const panel = document.querySelector('[data-region="settings"]');
      if (panel && !panel.hidden) renderKeyList();
    }, 2000);

    /* Toggle compare */
    const compareToggle = document.querySelector('[data-action="toggle-compare"]');
    if (compareToggle) {
      compareToggle.addEventListener('change', (e) => {
        compareMode = e.target.checked;
        applyCompareMode();
      });
    }

    /* Delegated handler for AI buttons */
    const outputList = document.querySelector('[data-region="output-list"]');
    outputList.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action="ai-area"], [data-action="ai-student"]');
      if (!btn) return;
      const idx = parseInt(btn.dataset.studentIndex, 10);
      const student = lastGenerated[idx];
      if (!student) return;
      if (btn.dataset.action === 'ai-area') {
        await regenerateOneArea(idx, btn.dataset.area, btn);
      } else {
        await regenerateAllAreas(idx, btn);
      }
    });

    function areaIndex(area) {
      return ['nilaiAgama', 'jatiDiri', 'literasiSteam'].indexOf(area);
    }

    async function regenerateOneArea(studentIdx, area, btn) {
      const entry = lastGenerated[studentIdx];
      const article = document.querySelector('[data-student-index="' + studentIdx + '"]');
      const block = article.querySelector('.area-block[data-area="' + area + '"]');
      const textEl = block.querySelector('[data-role="text"]');
      const sourceEl = block.querySelector('[data-role="source"]');
      const indicators = getIndicatorsForStudentArea(studentIdx, area);

      btn.disabled = true;
      const oldLabel = btn.textContent;
      btn.textContent = '...';
      sourceEl.textContent = 'AI…';
      sourceEl.className = 'area-source area-source--ai';

      const cardId = 'prog-' + studentIdx + '-' + area;
      const card = createProgressCard({
        id: cardId,
        title: toTitleCase(entry.name) + ' — ' + GUIDES[area].meta.label,
        steps: ['nilaiAgama', 'jatiDiri', 'literasiSteam']
      });
      card.setRunning(areaIndex(area));
      card.setBar(15);

      try {
        const res = await window.PAUD_AI.regenerateArea(
          toTitleCase(entry.name),
          area,
          window.PAUD_STYLE_GUIDE[area].meta.label,
          indicators
        );
        if (res.ok) {
          if (!looksComplete(res.text)) {
            throw new Error('Output AI terpotong — gunakan lokal.');
          }
          entry.reports[area].ai = res.text;
          activeVersion[area] = 'ai';
          textEl.textContent = res.text;
          sourceEl.textContent = 'AI';
          card.setSuccess(areaIndex(area));
          card.setBar(100);
          card.finish(true, 'Berhasil diregenerasi via AI.');
        } else {
          sourceEl.textContent = 'LOKAL';
          sourceEl.className = 'area-source area-source--local';
          showError('AI gagal: ' + (res.error || 'unknown') + ' — tetap pakai lokal.');
          card.setFail(areaIndex(area), res.error || 'unknown');
          card.finish(false, 'Gagal — tetap pakai lokal.');
        }
      } catch (err) {
        sourceEl.textContent = 'LOKAL';
        sourceEl.className = 'area-source area-source--local';
        showError('AI: ' + err.message);
        card.setFail(areaIndex(area), err.message);
        card.finish(false, 'Gagal — tetap pakai lokal.');
      } finally {
        btn.disabled = false;
        btn.textContent = oldLabel;
        applyCompareMode();
      }
    }

    async function regenerateAllAreas(studentIdx, btn) {
      const areas = ['nilaiAgama', 'jatiDiri', 'literasiSteam'];
      btn.disabled = true;
      const oldLabel = btn.textContent;
      btn.textContent = 'AI...';
      const entry = lastGenerated[studentIdx];
      const cardId = 'prog-all-' + studentIdx;
      const card = createProgressCard({
        id: cardId,
        title: toTitleCase(entry.name) + ' — semua area',
        steps: areas
      });
      let successCount = 0;
      for (let i = 0; i < areas.length; i++) {
        const area = areas[i];
        card.setRunning(i);
        card.setSub('Memproses ' + AREA_LABEL_SHORT[area] + ' (' + (i + 1) + '/' + areas.length + ')…');
        card.setBar(((i) / areas.length) * 100 + 5);
        const block = document.querySelector('[data-student-index="' + studentIdx + '"]').querySelector('.area-block[data-area="' + area + '"]');
        const textEl = block.querySelector('[data-role="text"]');
        const sourceEl = block.querySelector('[data-role="source"]');
        sourceEl.textContent = 'AI…';
        sourceEl.className = 'area-source area-source--ai';
        const indicators = getIndicatorsForStudentArea(studentIdx, area);
        try {
          const res = await window.PAUD_AI.regenerateArea(
            toTitleCase(entry.name), area,
            window.PAUD_STYLE_GUIDE[area].meta.label, indicators
          );
          if (res.ok && looksComplete(res.text)) {
            entry.reports[area].ai = res.text;
            textEl.textContent = res.text;
            sourceEl.textContent = 'AI';
            activeVersion[area] = 'ai';
            card.setSuccess(i);
            successCount++;
          } else {
            sourceEl.textContent = 'LOKAL';
            sourceEl.className = 'area-source area-source--local';
            card.setFail(i, res.ok ? 'terpotong' : (res.error || 'unknown'));
          }
        } catch (err) {
          sourceEl.textContent = 'LOKAL';
          sourceEl.className = 'area-source area-source--local';
          card.setFail(i, err.message);
        }
        card.setBar(((i + 1) / areas.length) * 100);
      }
      card.finish(successCount === areas.length, successCount + '/' + areas.length + ' area berhasil diregenerasi.');
      btn.textContent = successCount === areas.length ? 'AI Semua ✓' : oldLabel;
      btn.disabled = false;
      applyCompareMode();
    }

    function getIndicatorsForStudentArea(studentIdx, area) {
      const entry = lastGenerated[studentIdx];
      if (!entry) return [];
      const allStudents = window.PAUD_SAMPLE_STUDENTS || [];
      const orig = allStudents.find((s) => (s.name || '').trim().toLowerCase() === (entry.name || '').trim().toLowerCase());
      if (orig && orig.achievements && orig.achievements[area]) return orig.achievements[area];
      return [];
    }

    function looksComplete(text) {
      if (!text) return false;
      const trimmed = text.trim();
      if (trimmed.length < 80) return false;
      const lastChar = trimmed.charAt(trimmed.length - 1);
      if (lastChar !== '.' && lastChar !== '!' && lastChar !== '"' && lastChar !== ')') return false;
      const sentenceCount = (trimmed.match(/[.!?](?=\s|$)/g) || []).length;
      return sentenceCount >= 2;
    }

    btnCopy.addEventListener('click', async () => {
      if (lastGenerated.length === 0) return;
      const text = buildPlainText(lastGenerated);
      const ok = await copyToClipboard(text);
      showToast(ok ? 'Tersalin (' + lastGenerated.length + ' siswa)' : 'Gagal menyalin.');
    });
  }

  /* ================================================================
   * EXPORT
   * ============================================================ */
  window.PAUD = {
    init,
    parseStudentData,
    generateReportForStudent,
    generateAll,
    buildPlainText,
    normalizeJsonInput,
    copyToClipboard,
    renderReports,
    resetRotation,
    _state: () => ({ lastGenerated, xlsxParsed, rotationCounters }),
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
