// Blur Guard — main loop.
// Owns: camera lifecycle, MediaPipe HandLandmarker, per-frame pipeline,
// state machine, style selection, blur opacity.

import { HandLandmarker, FilesetResolver } from "./vendor/vision_bundle.mjs";
import { classifyPeace, countPeaceHands, PrivacyTrigger, State, CONFIG } from "./detector.js";
import { STYLES } from "./styles.js";

const $ = (id) => document.getElementById(id);

const video = $("video");
const canvas = $("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const blurLayer = $("blurLayer");
const permissionEl = $("permission");
const startBtn = $("startBtn");
const styleSelect = $("styleSelect");

let landmarker = null;
let trigger = new PrivacyTrigger();
let currentStyle = "none";
let stream = null;
let running = false;

// --- Camera setup ---
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
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
  // iOS Safari quirk: must wait for loadedmetadata before requestVideoFrameCallback works.
  await new Promise((res) => {
    if (video.readyState >= 1) res();
    else video.addEventListener("loadedmetadata", res, { once: true });
  });
  await video.play().catch(() => {});
  // Match canvas to video intrinsic size (post-mirror is handled by CSS scaleX).
  const w = video.videoWidth;
  const h = video.videoHeight;
  canvas.width = w;
  canvas.height = h;
  return true;
}

// --- MediaPipe setup ---
async function loadLandmarker() {
  const fileset = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
  );
  landmarker = await HandLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: CONFIG.MODEL_URL,
      delegate: "GPU",
    },
    numHands: CONFIG.NUM_HANDS,
    minHandDetectionConfidence: CONFIG.MIN_HAND_DETECTION_CONFIDENCE,
    minHandPresenceConfidence: CONFIG.MIN_HAND_PRESENCE_CONFIDENCE,
    minTrackingConfidence: CONFIG.MIN_TRACKING_CONFIDENCE,
    runningMode: "VIDEO",
  });
}

function drawHandLandmarks(landmarks) {
  // Optional: draw skeleton for visual feedback. Subtle.
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.fillStyle = "rgba(255, 59, 107, 0.85)";
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [17, 18], [18, 19], [19, 20],
    [0, 17],
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
  const w = canvas.width;
  const h = canvas.height;
  const engaged =
    state === State.ON ||
    ((state === State.BLURRING || state === State.RECOVERING) && blurAmount > 0.5);
  if (engaged) s.engaged(ctx, w, h, blurAmount);
  else s.chrome(ctx, w, h);
}

// --- Per-frame loop ---
let lastVideoTime = -1;
function frameLoop() {
  if (!running) return;
  if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    let hands = [];
    try {
      const result = landmarker.detectForVideo(video, performance.now());
      hands = result.landmarks || [];
    } catch (e) {
      // Detection errors are non-fatal; just skip this frame.
    }
    const peaceCount = countPeaceHands(hands);
    trigger.update(peaceCount);

    // 1) Draw camera frame
    ctx.save();
    ctx.scale(-1, 1); // mirror to match video CSS transform
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // 2) Draw hand skeleton (subtle)
    if (hands.length > 0) drawHandLandmarks(hands);

    // 3) Draw style chrome / engaged overlay
    drawStyleOverlay(currentStyle, trigger.state, trigger.blurAmount);

    // 4) Apply blur to the live video element via opacity (CSS filter on .blur-layer)
    blurLayer.style.opacity = String(trigger.blurAmount);
    // Sync the static mirror layer with the current video frame.
    // We use a separate ImageData copy for performance.
    if (trigger.blurAmount > 0.02) {
      try {
        const tmp = document.createElement("canvas");
        tmp.width = canvas.width;
        tmp.height = canvas.height;
        const tctx = tmp.getContext("2d");
        tctx.save();
        tctx.scale(-1, 1);
        tctx.drawImage(video, -tmp.width, 0, tmp.width, tmp.height);
        tctx.restore();
        blurLayer.style.backgroundImage = `url(${tmp.toDataURL("image/jpeg", 0.6)})`;
      } catch (e) {
        // toDataURL can fail on tainted canvas if camera is cross-origin; we
        // requested user-facing camera so this should not happen, but ignore.
      }
    }
  }
  // requestVideoFrameCallback is the iOS-Safari-safe frame callback.
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
  if (!ok) {
    startBtn.disabled = false;
    return;
  }

  permissionEl.remove();
  running = true;
  if ("requestVideoFrameCallback" in video) {
    video.requestVideoFrameCallback(frameLoop);
  } else {
    requestAnimationFrame(frameLoop);
  }
}

styleSelect.addEventListener("change", (e) => {
  currentStyle = e.target.value;
});

startBtn.addEventListener("click", start);

// Allow direct testing in browser console.
window.__blurGuardApp = { trigger: () => trigger, state: () => trigger.state };
