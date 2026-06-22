// Blur Guard — single-file inlined version.
// detector.js + styles.js + app.js merged, all `export` removed,
// runs as a single <script type="module"> in index.html.
// Only the MediaPipe vendor bundle is loaded as a separate module.
import { HandLandmarker, FilesetResolver } from "./vendor/vision_bundle.mjs";

// =====================================================================
// detector.js — pure logic, no DOM, no MediaPipe imports
// =====================================================================

const CONFIG = {
  NUM_HANDS: 2,
  MIN_HAND_DETECTION_CONFIDENCE: 0.5,
  MIN_HAND_PRESENCE_CONFIDENCE: 0.5,
  MIN_TRACKING_CONFIDENCE: 0.5,
  PEACE_REQUIRED_EXTENDED: [1, 2],
  PEACE_REQUIRED_FOLDED: [0, 3, 4],
  FINGER_EXTENDED_RATIO: 1.0,
  HOLD_FRAMES: 4,
  RELEASE_FRAMES: 10,
  FADE_IN_FRAMES: 6,
  FADE_OUT_FRAMES: 10,
  BLUR_MAX_PX: 28,
  MODEL_URL:
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
};

const WRIST = 0;
const THUMB_TIP = 4, INDEX_TIP = 8, MIDDLE_TIP = 12, RING_TIP = 16, PINKY_TIP = 20;
const THUMB_IP = 3, INDEX_PIP = 6, MIDDLE_PIP = 10, RING_PIP = 14, PINKY_PIP = 18;
const THUMB_MCP = 1, INDEX_MCP = 5, MIDDLE_MCP = 9, RING_MCP = 13, PINKY_MCP = 17;
const FINGER_TIPS = [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP];
const FINGER_PIPS = [THUMB_IP, INDEX_PIP, MIDDLE_PIP, RING_PIP, PINKY_PIP];
const FINGER_MCPS = [THUMB_MCP, INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP];

const dist3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));

function isFingerExtended(landmarks, fingerIdx) {
  if (!landmarks || landmarks.length < 21) return false;
  const wrist = landmarks[WRIST];
  const middleMcp = landmarks[MIDDLE_MCP];
  if (!wrist || !middleMcp) return false;
  const handSize = dist3(wrist, middleMcp);
  if (handSize < 1e-6) return false;
  if (fingerIdx === 0) {
    const thumbTip = landmarks[THUMB_TIP];
    const indexMcp = landmarks[INDEX_MCP];
    if (!thumbTip || !indexMcp) return false;
    return dist3(thumbTip, indexMcp) > CONFIG.FINGER_EXTENDED_RATIO * handSize;
  }
  const tip = landmarks[FINGER_TIPS[fingerIdx]];
  const pip = landmarks[FINGER_PIPS[fingerIdx]];
  if (!tip || !pip) return false;
  return dist3(wrist, tip) > CONFIG.FINGER_EXTENDED_RATIO * dist3(wrist, pip);
}

function classifyPeace(landmarks) {
  if (!landmarks || landmarks.length < 21 || !landmarks[WRIST]) return false;
  for (const f of CONFIG.PEACE_REQUIRED_EXTENDED) {
    if (!isFingerExtended(landmarks, f)) return false;
  }
  for (const f of CONFIG.PEACE_REQUIRED_FOLDED) {
    if (isFingerExtended(landmarks, f)) return false;
  }
  return true;
}

function countPeaceHands(hands) {
  return hands.filter(classifyPeace).length;
}

const State = Object.freeze({
  OFF: "off",
  BLURRING: "blurring",
  ON: "on",
  RECOVERING: "recovering",
});

class PrivacyTrigger {
  constructor() {
    this.state = State.OFF;
    this.blurAmount = 0;
    this._hold = 0;
    this._release = 0;
    this._fade = 0;
  }
  update(peaceCount) {
    const signal = peaceCount >= 2;
    switch (this.state) {
      case State.OFF: {
        if (signal) {
          this._hold += 1;
          if (this._hold >= CONFIG.HOLD_FRAMES) {
            this.state = State.BLURRING;
            this._hold = 0;
            this._fade = 0;
            this.blurAmount = 0;
          }
        } else {
          this._hold = 0;
        }
        break;
      }
      case State.BLURRING: {
        if (signal) {
          this._fade += 1;
          if (this._fade >= CONFIG.FADE_IN_FRAMES) {
            this.state = State.ON;
            this.blurAmount = 1;
          } else {
            this.blurAmount = this._fade / CONFIG.FADE_IN_FRAMES;
          }
        } else {
          this.state = State.OFF;
          this.blurAmount = 0;
          this._fade = 0;
        }
        break;
      }
      case State.ON: {
        if (signal) {
          this._release = 0;
        } else {
          this._release += 1;
          if (this._release >= CONFIG.RELEASE_FRAMES) {
            this.state = State.RECOVERING;
            this._release = 0;
            this._fade = 0;
          }
        }
        break;
      }
      case State.RECOVERING: {
        if (signal) {
          this.state = State.ON;
          this.blurAmount = 1;
          this._fade = 0;
        } else {
          this._fade += 1;
          if (this._fade >= CONFIG.FADE_OUT_FRAMES) {
            this.state = State.OFF;
            this.blurAmount = 0;
          } else {
            this.blurAmount = 1 - this._fade / CONFIG.FADE_OUT_FRAMES;
          }
        }
        break;
      }
    }
  }
}

window.__blurGuard = { classifyPeace, countPeaceHands, PrivacyTrigger, State, CONFIG };

// =====================================================================
// styles.js — visual overlays (y2k, soft, doomer, webcore, none)
// =====================================================================

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
const MONO_STACK =
  '"SF Mono", "JetBrains Mono", "Roboto Mono", "Courier New", monospace';

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
  engaged(ctx, w, h) {
    rgbSplit(ctx, w, h, 10);
    scanlines(ctx, w, h, 4, 0.2);
    addNoise(ctx, w, h, 22);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, w, h);
    drawStickerText(
      ctx, "bestie cam OFF",
      w * 0.08, h * 0.42,
      "#fff", "#d947ba",
      Math.min(72, w * 0.07), 900
    );
  },
};

const soft = {
  palette: { primary: "#f4b6c2", accent: "#b6d7f4", ink: "#5a4a4a", bg: "#fff5f7" },
  chrome(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = "#f4b6c2";
    ctx.lineWidth = 14;
    roundRect(ctx, 7, 7, w - 14, h - 14, 28);
    ctx.stroke();
    ctx.restore();
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
  engaged(ctx, w, h) {
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 400);
    colorWash(ctx, w, h, "#f4b6c2", 0.25 + 0.1 * pulse);
    ctx.font = `700 ${Math.min(56, w * 0.06)}px ${FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(90, 74, 74, 0.85)";
    ctx.fillText("taking a breath", w / 2, h / 2);
    ctx.textAlign = "start";
  },
};

const doomer = {
  palette: { primary: "#dc2626", accent: "#7f1d1d", ink: "#fff", bg: "#0a0a0a" },
  chrome(ctx, w, h) {
    colorWash(ctx, w, h, "#7f1d1d", 0.08);
    cornerBrackets(ctx, w, h, 32, 4, "#fff");
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
    ctx.font = `500 16px ${FONT_STACK}`;
    ctx.fillStyle = "#9ca3af";
    const t = "touch grass";
    const tw = ctx.measureText(t).width;
    ctx.fillText(t, w - tw - 24, 32);
  },
  engaged(ctx, w, h) {
    colorWash(ctx, w, h, "#7f1d1d", 0.45);
    scanlines(ctx, w, h, 2, 0.35);
    addNoise(ctx, w, h, 30);
  },
};

const webcore = {
  palette: { primary: "#22d3ee", accent: "#a78bfa", ink: "#e0e7ff", bg: "#0c0a1f" },
  chrome(ctx, w, h) {
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, w - 4, h - 4);
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
    ctx.font = `500 12px ${MONO_STACK}`;
    ctx.fillStyle = "#a78bfa";
    const meta = "// secure.cam v1.0";
    const mw = ctx.measureText(meta).width;
    ctx.fillText(meta, w - mw - 20, h - 28);
  },
  engaged(ctx, w, h) {
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

const none = {
  palette: { primary: "#fff", accent: "#888", ink: "#fff", bg: "#000" },
  chrome() {},
  engaged() {},
};

const STYLES = { none, y2k, soft, doomer, webcore };

// =====================================================================
// app.js — camera lifecycle, MediaPipe wiring, per-frame pipeline
// =====================================================================

const $ = (id) => document.getElementById(id);
const video = $("video");
const canvas = $("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const permissionEl = $("permission");
const startBtn = $("startBtn");
const styleSelect = $("styleSelect");

let landmarker = null;
const trigger = new PrivacyTrigger();
let currentStyle = "none";
let stream = null;
let running = false;

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
  } catch (e) {
    permissionEl.classList.add("error");
    permissionEl.querySelector("h2").textContent = "Camera blocked";
    permissionEl.querySelector("p").textContent =
      e.name === "NotAllowedError"
        ? "Permission denied. Open site settings and allow camera, then reload."
        : `Cannot access camera: ${e.message}`;
    startBtn.textContent = "Retry";
    return false;
  }
  video.srcObject = stream;
  await new Promise((res) => {
    if (video.readyState >= 1) res();
    else video.addEventListener("loadedmetadata", res, { once: true });
  });
  await video.play().catch(() => {});
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  return true;
}

async function loadLandmarker() {
  const fileset = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
  );
  landmarker = await HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: CONFIG.MODEL_URL, delegate: "GPU" },
    numHands: CONFIG.NUM_HANDS,
    minHandDetectionConfidence: CONFIG.MIN_HAND_DETECTION_CONFIDENCE,
    minHandPresenceConfidence: CONFIG.MIN_HAND_PRESENCE_CONFIDENCE,
    minTrackingConfidence: CONFIG.MIN_TRACKING_CONFIDENCE,
    runningMode: "VIDEO",
  });
}

function drawHandLandmarks(landmarks) {
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.fillStyle = "rgba(255, 59, 107, 0.85)";
  const connections = [
    [0,1],[1,2],[2,3],[3,4],
    [0,5],[5,6],[6,7],[7,8],
    [5,9],[9,10],[10,11],[11,12],
    [9,13],[13,14],[14,15],[15,16],
    [13,17],[17,18],[18,19],[19,20],
    [0,17],
  ];
  for (const hand of landmarks) {
    for (const [a, b] of connections) {
      ctx.beginPath();
      ctx.moveTo(hand[a].x * canvas.width, hand[a].y * canvas.height);
      ctx.lineTo(hand[b].x * canvas.width, hand[b].y * canvas.height);
      ctx.stroke();
    }
    for (const lm of hand) {
      ctx.beginPath();
      ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawStyleOverlay(style, state, blurAmount) {
  const s = STYLES[style] || STYLES.none;
  const w = canvas.width, h = canvas.height;
  const engaged =
    state === State.ON ||
    ((state === State.BLURRING || state === State.RECOVERING) && blurAmount > 0.5);
  if (engaged) s.engaged(ctx, w, h);
  else s.chrome(ctx, w, h);
}

let lastVideoTime = -1;
function frameLoop() {
  if (!running) return;
  if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    let hands = [];
    try {
      const result = landmarker.detectForVideo(video, performance.now());
      hands = result.landmarks || [];
    } catch (e) { /* non-fatal */ }
    trigger.update(countPeaceHands(hands));

    const blurPx = CONFIG.BLUR_MAX_PX * trigger.blurAmount;
    ctx.save();
    ctx.filter = blurPx > 0.5 ? `blur(${blurPx.toFixed(1)}px)` : "none";
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    if (hands.length > 0) drawHandLandmarks(hands);
    drawStyleOverlay(currentStyle, trigger.state, trigger.blurAmount);
  }
  if ("requestVideoFrameCallback" in video) {
    video.requestVideoFrameCallback(frameLoop);
  } else {
    requestAnimationFrame(frameLoop);
  }
}

async function start() {
  startBtn.disabled = true;
  startBtn.textContent = "Loading model...";
  try {
    await loadLandmarker();
  } catch (e) {
    permissionEl.classList.add("error");
    permissionEl.querySelector("h2").textContent = "Model load failed";
    permissionEl.querySelector("p").textContent = `Could not load HandLandmarker: ${e.message}`;
    startBtn.disabled = false;
    startBtn.textContent = "Retry";
    return;
  }
  startBtn.textContent = "Starting camera...";
  const ok = await startCamera();
  if (!ok) { startBtn.disabled = false; return; }
  permissionEl.remove();
  running = true;
  if ("requestVideoFrameCallback" in video) {
    video.requestVideoFrameCallback(frameLoop);
  } else {
    requestAnimationFrame(frameLoop);
  }
}

styleSelect.addEventListener("change", (e) => { currentStyle = e.target.value; });
startBtn.addEventListener("click", start);
window.__blurGuardApp = { trigger: () => trigger, state: () => trigger.state };
