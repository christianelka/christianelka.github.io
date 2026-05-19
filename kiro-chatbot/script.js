const STORAGE_KEYS = {
  config: "kiro-chat:config",
  conversations: "kiro-chat:conversations",
  activeId: "kiro-chat:active-id",
  theme: "kiro-chat:theme",
};

const DEFAULT_CONFIG = {
  endpoint: "http://localhost:20128/v1",
  apiKey: "",
  model: "kr/claude-opus-4.7",
  systemPrompt: "Anda adalah Kiro, asisten AI yang ramah, ringkas, dan akurat. Jawab dalam bahasa pengguna.",
  stream: true,
  temperature: 0.7,
};

const els = {
  sidebar: document.getElementById("sidebar"),
  conversationList: document.getElementById("conversation-list"),
  btnNewChat: document.getElementById("btn-new-chat"),
  btnToggleSidebar: document.getElementById("btn-toggle-sidebar"),
  btnSettings: document.getElementById("btn-settings"),
  btnTheme: document.getElementById("btn-theme"),
  iconTheme: document.getElementById("icon-theme"),
  modelBadge: document.getElementById("model-badge"),
  statusDot: document.getElementById("status-dot"),
  statusText: document.getElementById("status-text"),
  chat: document.getElementById("chat"),
  welcome: document.getElementById("welcome"),
  composerForm: document.getElementById("composer-form"),
  input: document.getElementById("input"),
  btnSend: document.getElementById("btn-send"),
  btnClear: document.getElementById("btn-clear"),
  iconSend: document.getElementById("icon-send"),
  iconStop: document.getElementById("icon-stop"),
  modal: document.getElementById("settings-modal"),
  btnCloseSettings: document.getElementById("btn-close-settings"),
  btnCancelSettings: document.getElementById("btn-cancel-settings"),
  btnSaveSettings: document.getElementById("btn-save-settings"),
  btnTestConnection: document.getElementById("btn-test-connection"),
  cfgEndpoint: document.getElementById("cfg-endpoint"),
  cfgApiKey: document.getElementById("cfg-api-key"),
  cfgModel: document.getElementById("cfg-model"),
  cfgSystem: document.getElementById("cfg-system"),
  cfgStream: document.getElementById("cfg-stream"),
  cfgTemperature: document.getElementById("cfg-temperature"),
};

const state = {
  config: loadConfig(),
  conversations: loadConversations(),
  activeId: localStorage.getItem(STORAGE_KEYS.activeId) || null,
  abortController: null,
};

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.config);
    if (!raw) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig() {
  localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(state.config));
  els.modelBadge.textContent = state.config.model;
}

function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.conversations);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveConversations() {
  localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(state.conversations));
}

function setActiveId(id) {
  state.activeId = id;
  if (id) localStorage.setItem(STORAGE_KEYS.activeId, id);
  else localStorage.removeItem(STORAGE_KEYS.activeId);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getActiveConversation() {
  if (!state.activeId) return null;
  return state.conversations[state.activeId] || null;
}

function createConversation() {
  const id = uid();
  state.conversations[id] = {
    id,
    title: "Chat baru",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  setActiveId(id);
  saveConversations();
  renderSidebar();
  renderChat();
  els.input.focus();
  return state.conversations[id];
}

function deleteConversation(id) {
  delete state.conversations[id];
  saveConversations();
  if (state.activeId === id) {
    const remaining = Object.keys(state.conversations);
    setActiveId(remaining[0] || null);
  }
  renderSidebar();
  renderChat();
}

function deriveTitle(text) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > 40 ? trimmed.slice(0, 40) + "…" : trimmed || "Chat baru";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  const isDark = theme === "dark";
  els.iconTheme.innerHTML = isDark
    ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
    : '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}

if (window.marked) {
  marked.setOptions({
    breaks: true,
    gfm: true,
    highlight(code, lang) {
      try {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
        }
        return hljs.highlightAuto(code).value;
      } catch {
        return code;
      }
    },
  });
}

function renderMarkdown(text) {
  const raw = marked.parse(text || "");
  return DOMPurify.sanitize(raw, {
    ADD_ATTR: ["target", "rel"],
  });
}

function renderSidebar() {
  els.conversationList.innerHTML = "";
  const items = Object.values(state.conversations).sort((a, b) => b.updatedAt - a.updatedAt);

  for (const conv of items) {
    const div = document.createElement("div");
    div.className = "conv-item" + (conv.id === state.activeId ? " active" : "");
    div.dataset.id = conv.id;

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = conv.title;
    div.appendChild(title);

    const del = document.createElement("button");
    del.className = "btn-delete";
    del.title = "Hapus";
    del.setAttribute("aria-label", "Hapus percakapan");
    del.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>';
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Hapus "${conv.title}"?`)) deleteConversation(conv.id);
    });
    div.appendChild(del);

    div.addEventListener("click", () => {
      setActiveId(conv.id);
      renderSidebar();
      renderChat();
      els.sidebar.classList.remove("open");
    });

    els.conversationList.appendChild(div);
  }
}

function renderChat() {
  const conv = getActiveConversation();
  els.chat.innerHTML = "";

  if (!conv || conv.messages.length === 0) {
    if (els.welcome) els.chat.appendChild(els.welcome);
    els.welcome.classList.remove("hidden");
    return;
  }

  els.welcome.classList.add("hidden");
  for (const msg of conv.messages) {
    appendMessage(msg);
  }
  scrollToBottom();
}

function appendMessage(msg) {
  const el = document.createElement("div");
  el.className = `message ${msg.role}`;
  el.dataset.id = msg.id;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = msg.role === "user" ? "U" : "✦";
  el.appendChild(avatar);

  const body = document.createElement("div");
  body.className = "message-body";

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = msg.role === "user" ? "Anda" : "Kiro";
  body.appendChild(meta);

  const content = document.createElement("div");
  content.className = "message-content";
  content.dataset.raw = msg.content;
  if (msg.role === "assistant") {
    content.innerHTML = renderMarkdown(msg.content);
    enhanceCodeBlocks(content);
  } else {
    content.textContent = msg.content;
  }
  body.appendChild(content);

  if (msg.error) {
    const err = document.createElement("div");
    err.className = "error-bubble";
    err.innerHTML = `<strong>Error:</strong> ${escapeHtml(msg.error)}`;
    body.appendChild(err);
  }

  if (msg.role === "assistant" && !msg.streaming) {
    body.appendChild(buildMessageActions(msg));
  }

  el.appendChild(body);
  els.chat.appendChild(el);
  return { el, content };
}

function buildMessageActions(msg) {
  const wrap = document.createElement("div");
  wrap.className = "message-actions";

  const copy = document.createElement("button");
  copy.className = "message-action";
  copy.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Salin';
  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(msg.content);
    copy.innerHTML = "✓ Tersalin";
    setTimeout(() => {
      copy.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Salin';
    }, 1500);
  });
  wrap.appendChild(copy);

  return wrap;
}

function enhanceCodeBlocks(container) {
  for (const pre of container.querySelectorAll("pre")) {
    if (pre.querySelector(".copy-btn")) continue;
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "Salin";
    btn.addEventListener("click", async () => {
      const code = pre.querySelector("code");
      if (!code) return;
      await navigator.clipboard.writeText(code.textContent);
      btn.textContent = "✓";
      setTimeout(() => (btn.textContent = "Salin"), 1500);
    });
    pre.appendChild(btn);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

function scrollToBottom() {
  els.chat.scrollTop = els.chat.scrollHeight;
}

function autoResizeTextarea() {
  els.input.style.height = "auto";
  els.input.style.height = Math.min(els.input.scrollHeight, 200) + "px";
}

function setStreamingUI(streaming) {
  els.btnSend.classList.toggle("streaming", streaming);
  els.iconSend.classList.toggle("hidden", streaming);
  els.iconStop.classList.toggle("hidden", !streaming);
  els.btnSend.title = streaming ? "Hentikan" : "Kirim";
  els.btnSend.setAttribute("aria-label", streaming ? "Hentikan respons" : "Kirim pesan");
}

function setStatus(kind, text) {
  els.statusDot.className = "status-dot " + (kind || "");
  els.statusText.textContent = text;
}

async function checkConnection() {
  setStatus("checking", "Mengecek koneksi…");
  try {
    const res = await fetch(`${state.config.endpoint.replace(/\/$/, "")}/models`, {
      headers: state.config.apiKey ? { Authorization: `Bearer ${state.config.apiKey}` } : {},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setStatus("ok", "9router terhubung");
  } catch (err) {
    setStatus("err", "9router tidak terjangkau");
  }
}

async function sendMessage(userText) {
  if (state.abortController) return;

  let conv = getActiveConversation();
  if (!conv) conv = createConversation();

  const userMsg = {
    id: uid(),
    role: "user",
    content: userText,
    createdAt: Date.now(),
  };
  conv.messages.push(userMsg);

  if (conv.messages.filter((m) => m.role === "user").length === 1) {
    conv.title = deriveTitle(userText);
  }
  conv.updatedAt = Date.now();
  saveConversations();
  renderSidebar();

  els.welcome.classList.add("hidden");
  appendMessage(userMsg);
  scrollToBottom();

  const assistantMsg = {
    id: uid(),
    role: "assistant",
    content: "",
    createdAt: Date.now(),
    streaming: true,
  };
  conv.messages.push(assistantMsg);
  const { el: assistantEl, content: assistantContent } = appendMessage(assistantMsg);

  const typing = document.createElement("div");
  typing.className = "typing-indicator";
  typing.innerHTML = "<span></span><span></span><span></span>";
  assistantContent.appendChild(typing);
  scrollToBottom();

  setStreamingUI(true);
  state.abortController = new AbortController();

  try {
    const messages = buildApiMessages(conv);
    if (state.config.stream) {
      await streamChat(messages, assistantMsg, assistantContent, typing);
    } else {
      await nonStreamChat(messages, assistantMsg, assistantContent, typing);
    }
  } catch (err) {
    if (err.name === "AbortError") {
      assistantMsg.content += "\n\n_(Dihentikan oleh pengguna)_";
    } else {
      assistantMsg.error = err.message || String(err);
    }
  } finally {
    assistantMsg.streaming = false;
    state.abortController = null;
    setStreamingUI(false);

    typing.remove();
    if (assistantMsg.content) {
      assistantContent.classList.remove("cursor-blink");
      assistantContent.innerHTML = renderMarkdown(assistantMsg.content);
      enhanceCodeBlocks(assistantContent);
    }
    if (assistantMsg.error && !assistantContent.querySelector(".error-bubble")) {
      const errEl = document.createElement("div");
      errEl.className = "error-bubble";
      errEl.innerHTML = `<strong>Error:</strong> ${escapeHtml(assistantMsg.error)}`;
      assistantContent.parentElement.appendChild(errEl);
    }
    const actions = buildMessageActions(assistantMsg);
    assistantContent.parentElement.appendChild(actions);

    conv.updatedAt = Date.now();
    saveConversations();
    scrollToBottom();
    els.input.focus();
  }
}

function buildApiMessages(conv) {
  const arr = [];
  if (state.config.systemPrompt && state.config.systemPrompt.trim()) {
    arr.push({ role: "system", content: state.config.systemPrompt.trim() });
  }
  for (const m of conv.messages) {
    if (m.role !== "user" && m.role !== "assistant") continue;
    if (m.streaming || !m.content) continue;
    arr.push({ role: m.role, content: m.content });
  }
  return arr;
}

async function streamChat(messages, assistantMsg, contentEl, typingEl) {
  const url = `${state.config.endpoint.replace(/\/$/, "")}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    signal: state.abortController.signal,
    headers: {
      "Content-Type": "application/json",
      ...(state.config.apiKey ? { Authorization: `Bearer ${state.config.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: state.config.model,
      messages,
      stream: true,
      temperature: Number(state.config.temperature),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}${errText ? ` — ${errText.slice(0, 200)}` : ""}`);
  }
  if (!res.body) throw new Error("Server tidak mengirim response stream.");

  typingEl.remove();
  contentEl.classList.add("cursor-blink");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let firstChunk = true;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let lineEnd;
    while ((lineEnd = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, lineEnd).trim();
      buffer = buffer.slice(lineEnd + 1);

      if (!line || !line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") break;

      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content || "";
        if (delta) {
          assistantMsg.content += delta;
          if (firstChunk) {
            contentEl.innerHTML = "";
            firstChunk = false;
          }
          contentEl.innerHTML = renderMarkdown(assistantMsg.content);
          contentEl.classList.add("cursor-blink");
          scrollToBottom();
        }
      } catch {
        continue;
      }
    }
  }
}

async function nonStreamChat(messages, assistantMsg, contentEl, typingEl) {
  const url = `${state.config.endpoint.replace(/\/$/, "")}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    signal: state.abortController.signal,
    headers: {
      "Content-Type": "application/json",
      ...(state.config.apiKey ? { Authorization: `Bearer ${state.config.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: state.config.model,
      messages,
      stream: false,
      temperature: Number(state.config.temperature),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}${errText ? ` — ${errText.slice(0, 200)}` : ""}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  assistantMsg.content = text;
  typingEl.remove();
  contentEl.innerHTML = renderMarkdown(text);
  enhanceCodeBlocks(contentEl);
}

function openSettings() {
  els.cfgEndpoint.value = state.config.endpoint;
  els.cfgApiKey.value = state.config.apiKey;
  els.cfgModel.value = state.config.model;
  els.cfgSystem.value = state.config.systemPrompt;
  els.cfgStream.checked = state.config.stream;
  els.cfgTemperature.value = state.config.temperature;
  els.modal.showModal();
}

function closeSettings() {
  els.modal.close();
}

function saveSettingsFromForm() {
  state.config.endpoint = els.cfgEndpoint.value.trim() || DEFAULT_CONFIG.endpoint;
  state.config.apiKey = els.cfgApiKey.value.trim();
  state.config.model = els.cfgModel.value.trim() || DEFAULT_CONFIG.model;
  state.config.systemPrompt = els.cfgSystem.value;
  state.config.stream = els.cfgStream.checked;
  state.config.temperature = Number(els.cfgTemperature.value) || 0.7;
  saveConfig();
  checkConnection();
  closeSettings();
}

async function testConnectionFromForm() {
  const endpoint = els.cfgEndpoint.value.trim() || DEFAULT_CONFIG.endpoint;
  const apiKey = els.cfgApiKey.value.trim();
  const existing = els.modal.querySelector(".test-result");
  if (existing) existing.remove();

  const result = document.createElement("div");
  result.className = "test-result show";
  result.textContent = "Menghubungi…";
  els.modal.querySelector(".modal-body").appendChild(result);

  try {
    const res = await fetch(`${endpoint.replace(/\/$/, "")}/models`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json().catch(() => ({}));
    const count = Array.isArray(data?.data) ? data.data.length : 0;
    result.classList.add("ok");
    result.textContent = `Terhubung. ${count > 0 ? `${count} model tersedia.` : "Endpoint merespons."}`;
  } catch (err) {
    result.classList.add("err");
    result.textContent = `Gagal: ${err.message}. Pastikan 9router berjalan di endpoint tersebut.`;
  }
}

function init() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || "dark";
  applyTheme(savedTheme);

  els.modelBadge.textContent = state.config.model;

  if (Object.keys(state.conversations).length === 0) {
    createConversation();
  } else {
    if (!state.conversations[state.activeId]) {
      const ids = Object.keys(state.conversations);
      setActiveId(ids[0]);
    }
    renderSidebar();
    renderChat();
  }

  checkConnection();

  els.btnNewChat.addEventListener("click", createConversation);
  els.btnSettings.addEventListener("click", openSettings);
  els.btnTheme.addEventListener("click", toggleTheme);
  els.btnToggleSidebar.addEventListener("click", () => els.sidebar.classList.toggle("open"));

  els.btnCloseSettings.addEventListener("click", closeSettings);
  els.btnCancelSettings.addEventListener("click", closeSettings);
  els.btnTestConnection.addEventListener("click", testConnectionFromForm);

  document.getElementById("settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveSettingsFromForm();
  });

  els.modal.addEventListener("click", (e) => {
    if (e.target === els.modal) closeSettings();
  });

  els.btnClear.addEventListener("click", () => {
    const conv = getActiveConversation();
    if (!conv || conv.messages.length === 0) return;
    if (!confirm("Hapus semua pesan di chat ini?")) return;
    conv.messages = [];
    conv.title = "Chat baru";
    conv.updatedAt = Date.now();
    saveConversations();
    renderSidebar();
    renderChat();
  });

  els.input.addEventListener("input", autoResizeTextarea);

  els.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      els.composerForm.requestSubmit();
    }
  });

  els.composerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (state.abortController) {
      state.abortController.abort();
      return;
    }
    const text = els.input.value.trim();
    if (!text) return;
    els.input.value = "";
    autoResizeTextarea();
    sendMessage(text);
  });

  document.querySelectorAll(".suggestion").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prompt = btn.dataset.prompt || btn.textContent;
      els.input.value = prompt;
      autoResizeTextarea();
      els.composerForm.requestSubmit();
    });
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      createConversation();
    }
    if (e.key === "Escape" && els.modal.open) closeSettings();
  });

  setInterval(checkConnection, 30000);
}

document.addEventListener("DOMContentLoaded", init);
