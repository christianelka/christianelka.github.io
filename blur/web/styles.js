// Style overlays for Blur Guard.
// Each style exposes:
//   palette   — { primary, accent, bg, ink, muted }
//   chrome    — (ctx, w, h) => void  ; permanent decoration when OFF
//   engaged   — (ctx, w, h, blurAmount) => void  ; takeover when ON or fade > 0.5
// Pure draw calls. No detection, no state machine.

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
const MONO_STACK =
  '"SF Mono", "JetBrains Mono", "Roboto Mono", "Courier New", monospace';

// --- helpers ---
const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const sticker = (ctx, x, y, w, h, fill, stroke) => {
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  if (stroke) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
};

const drawStickerText = (ctx, text, x, y, color, stroke, size = 22, weight = 900) => {
  ctx.font = `${weight} ${size}px ${FONT_STACK}`;
  ctx.textBaseline = "top";
  ctx.lineJoin = "round";
  ctx.lineWidth = 6;
  ctx.strokeStyle = stroke;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
};

const cornerSticker = (ctx, w, h, text, fill, stroke, corner) => {
  ctx.font = `900 22px ${FONT_STACK}`;
  const tw = ctx.measureText(text).width;
  const pad = 18;
  const boxW = tw + pad * 2;
  const boxH = 22 + pad * 2;
  const m = 16;
  let x, y;
  if (corner === "tl") { x = m; y = m; }
  else if (corner === "tr") { x = w - boxW - m; y = m; }
  else if (corner === "bl") { x = m; y = h - boxH - m; }
  else { x = w - boxW - m; y = h - boxH - m; }
  sticker(ctx, x, y, boxW, boxH, fill, stroke);
  drawStickerText(ctx, text, x + pad, y + pad, "#fff", stroke || "#000", 22, 900);
};

const chunkyBorder = (ctx, w, h, color, thickness = 10) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, thickness);
  ctx.fillRect(0, h - thickness, w, thickness);
  ctx.fillRect(0, 0, thickness, h);
  ctx.fillRect(w - thickness, 0, thickness, h);
};

const cornerBrackets = (ctx, w, h, size = 32, thickness = 4, color = "#fff") => {
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = "square";
  const s = size;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(s, 0); ctx.moveTo(0, 0); ctx.lineTo(0, s);
  ctx.moveTo(w - s, 0); ctx.lineTo(w, 0); ctx.moveTo(w, 0); ctx.lineTo(w, s);
  ctx.moveTo(0, h); ctx.lineTo(s, h); ctx.moveTo(0, h - s); ctx.lineTo(0, h);
  ctx.moveTo(w - s, h); ctx.lineTo(w, h); ctx.moveTo(w, h - s); ctx.lineTo(w, h);
  ctx.stroke();
};

const addNoise = (ctx, w, h, amount) => {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
};

const scanlines = (ctx, w, h, spacing = 4, alpha = 0.2) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#000";
  for (let y = 0; y < h; y += spacing) ctx.fillRect(0, y, w, 1);
  ctx.restore();
};

const rgbSplit = (ctx, w, h, offset) => {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const copy = new Uint8ClampedArray(d);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      const r = (y * w + Math.min(w - 1, x + offset)) * 4;
      const b = (y * w + Math.max(0, x - offset)) * 4;
      d[i] = copy[r];
      d[i + 2] = copy[b];
    }
  }
  ctx.putImageData(img, 0, 0);
};

const colorWash = (ctx, w, h, color, alpha) => {
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = prev;
};

// --- Y2K ---
const y2k = {
  palette: { primary: "#d947ba", accent: "#1ad9e3", ink: "#fff", bg: "#0a0014" },
  chrome(ctx, w, h) {
    addNoise(ctx, w, h, 8);
    chunkyBorder(ctx, w, h, "#d947ba", 10);
    cornerSticker(ctx, w, h, "bestie cam", "#d947ba", "#000", "tl");
    cornerSticker(ctx, w, h, "no cap", "#1ad9e3", "#000", "tr");
    cornerSticker(ctx, w, h, "slay", "#1ad9e3", "#000", "bl");
    cornerSticker(ctx, w, h, "its giving", "#d947ba", "#000", "br");
  },
  engaged(ctx, w, h, amt) {
    rgbSplit(ctx, w, h, 10);
    scanlines(ctx, w, h, 4, 0.2);
    addNoise(ctx, w, h, 22);
    // Centerpiece: massive "bestie cam OFF" takeover
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, w, h);
    drawStickerText(
      ctx,
      "bestie cam OFF",
      w * 0.08,
      h * 0.42,
      "#fff",
      "#d947ba",
      Math.min(72, w * 0.07),
      900
    );
  },
};

// --- Soft ---
const soft = {
  palette: { primary: "#f4b6c2", accent: "#b6d7f4", ink: "#5a4a4a", bg: "#fff5f7" },
  chrome(ctx, w, h) {
    // Pastel rounded border
    ctx.save();
    ctx.strokeStyle = "#f4b6c2";
    ctx.lineWidth = 14;
    roundRect(ctx, 7, 7, w - 14, h - 14, 28);
    ctx.stroke();
    ctx.restore();
    // Two pill captions
    const drawPill = (text, x, y) => {
      ctx.font = `600 20px ${FONT_STACK}`;
      const tw = ctx.measureText(text).width;
      const pw = tw + 28, ph = 36;
      sticker(ctx, x, y, pw, ph, "#fff", "#f4b6c2");
      ctx.fillStyle = "#5a4a4a";
      ctx.font = `600 18px ${FONT_STACK}`;
      ctx.textBaseline = "middle";
      ctx.fillText(text, x + 14, y + ph / 2);
    };
    drawPill("u ok?", 28, 28);
    const w2 = ctx.measureText("softer era").width + 28;
    drawPill("softer era", w - w2 - 28, h - 64);
  },
  engaged(ctx, w, h, amt) {
    // Pulse + soft wash
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 400);
    colorWash(ctx, w, h, "#f4b6c2", 0.25 + 0.1 * pulse);
    // Centered soft text
    ctx.font = `700 ${Math.min(56, w * 0.06)}px ${FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(90, 74, 74, 0.85)";
    ctx.fillText("taking a breath", w / 2, h / 2);
    ctx.textAlign = "start";
  },
};

// --- Doomer ---
const doomer = {
  palette: { primary: "#dc2626", accent: "#7f1d1d", ink: "#fff", bg: "#0a0a0a" },
  chrome(ctx, w, h) {
    colorWash(ctx, w, h, "#7f1d1d", 0.08);
    cornerBrackets(ctx, w, h, 32, 4, "#fff");
    // REC dot
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.arc(40, 40, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `700 18px ${FONT_STACK}`;
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "top";
    ctx.fillText("REC", 60, 26);
    ctx.font = `500 14px ${FONT_STACK}`;
    ctx.fillStyle = "#888";
    ctx.fillText("lol gl", 60, 50);
    // Top-right "touch grass"
    ctx.font = `500 16px ${FONT_STACK}`;
    ctx.fillStyle = "#9ca3af";
    const t = "touch grass";
    const tw = ctx.measureText(t).width;
    ctx.fillText(t, w - tw - 24, 32);
  },
  engaged(ctx, w, h, amt) {
    colorWash(ctx, w, h, "#7f1d1d", 0.45);
    scanlines(ctx, w, h, 2, 0.35);
    addNoise(ctx, w, h, 30);
    // No text — atmosphere only
  },
};

// --- Webcore ---
const webcore = {
  palette: { primary: "#22d3ee", accent: "#a78bfa", ink: "#e0e7ff", bg: "#0c0a1f" },
  chrome(ctx, w, h) {
    // Thin cyan border
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, w - 4, h - 4);
    // Top-left badge
    const text = "webcore ✦";
    ctx.font = `600 16px ${MONO_STACK}`;
    const tw = ctx.measureText(text).width;
    const pad = 12, bh = 28;
    ctx.fillStyle = "#0c0a1f";
    roundRect(ctx, 18, 18, tw + pad * 2, bh, 4);
    ctx.fill();
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#22d3ee";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 18 + pad, 18 + bh / 2);
    // Bottom-right monospace meta
    ctx.font = `500 12px ${MONO_STACK}`;
    ctx.fillStyle = "#a78bfa";
    const meta = "// secure.cam v1.0";
    const mw = ctx.measureText(meta).width;
    ctx.fillText(meta, w - mw - 20, h - 28);
  },
  engaged(ctx, w, h, amt) {
    // Gridlines
    ctx.save();
    ctx.strokeStyle = "rgba(167, 139, 250, 0.25)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();
    // Centered monospace stamp
    ctx.font = `700 ${Math.min(48, w * 0.05)}px ${MONO_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(167, 139, 250, 0.9)";
    ctx.fillText("> ENGAGED_", w / 2, h / 2);
    ctx.font = `500 14px ${MONO_STACK}`;
    ctx.fillStyle = "rgba(167, 139, 250, 0.6)";
    ctx.fillText("// privacy_blur.active = true", w / 2, h / 2 + 32);
    ctx.textAlign = "start";
  },
};

// --- None ---
const none = {
  palette: { primary: "#fff", accent: "#888", ink: "#fff", bg: "#000" },
  chrome() {},
  engaged() {},
};

export const STYLES = { none, y2k, soft, doomer, webcore };
