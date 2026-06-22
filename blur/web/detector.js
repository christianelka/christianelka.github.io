// Blur Guard — web port
// Peace-sign privacy blur. Front/back-agnostic gesture detection via
// MediaPipe HandLandmarker (WASM, runs entirely in the browser).
// Pure logic — no DOM, no MediaPipe imports. Unit-testable in isolation.

// --- Config (mirrors blur_guard/config.py) ---
export const CONFIG = {
  NUM_HANDS: 2,
  MIN_HAND_DETECTION_CONFIDENCE: 0.5,
  MIN_HAND_PRESENCE_CONFIDENCE: 0.5,
  MIN_TRACKING_CONFIDENCE: 0.5,

  // Peace-sign geometry: index + middle extended; thumb/ring/pinky folded.
  // 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
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

// --- Landmark indices (MediaPipe Hands 21-keypoint) ---
const WRIST = 0;
const THUMB_TIP = 4, INDEX_TIP = 8, MIDDLE_TIP = 12, RING_TIP = 16, PINKY_TIP = 20;
const THUMB_IP = 3, INDEX_PIP = 6, MIDDLE_PIP = 10, RING_PIP = 14, PINKY_PIP = 18;
const THUMB_MCP = 1, INDEX_MCP = 5, MIDDLE_MCP = 9, RING_MCP = 13, PINKY_MCP = 17;
const FINGER_TIPS = [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP];
const FINGER_PIPS = [THUMB_IP, INDEX_PIP, MIDDLE_PIP, RING_PIP, PINKY_PIP];
const FINGER_MCPS = [THUMB_MCP, INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP];

// --- Math helpers ---
const dist3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));

// --- Peace-sign classifier ---
// Front/back-agnostic. Returns true if index & middle extended and
// thumb/ring/pinky folded. Pure function — unit-testable.
function isFingerExtended(landmarks, fingerIdx) {
  if (!landmarks || landmarks.length < 21) return false;
  const wrist = landmarks[WRIST];
  const middleMcp = landmarks[MIDDLE_MCP];
  if (!wrist || !middleMcp) return false;
  const handSize = dist3(wrist, middleMcp);
  if (handSize < 1e-6) return false;

  if (fingerIdx === 0) {
    // Thumb: extended when its tip is far from index MCP (pointing away from palm).
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

export function classifyPeace(landmarks) {
  if (!landmarks || landmarks.length < 21 || !landmarks[WRIST]) return false;
  for (const f of CONFIG.PEACE_REQUIRED_EXTENDED) {
    if (!isFingerExtended(landmarks, f)) return false;
  }
  for (const f of CONFIG.PEACE_REQUIRED_FOLDED) {
    if (isFingerExtended(landmarks, f)) return false;
  }
  return true;
}

export function countPeaceHands(hands) {
  return hands.filter(classifyPeace).length;
}

// --- PrivacyTrigger state machine (mirrors trigger.py) ---
export const State = Object.freeze({
  OFF: "off",
  BLURRING: "blurring",
  ON: "on",
  RECOVERING: "recovering",
});

export class PrivacyTrigger {
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

// Expose pure logic for in-browser console testing.
window.__blurGuard = { classifyPeace, countPeaceHands, PrivacyTrigger, State, CONFIG };
