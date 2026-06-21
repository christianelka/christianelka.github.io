"""Centralized tunables for Blur Guard.

All magic numbers live here. No silent defaults anywhere else in the codebase.
"""

from pathlib import Path

# --- Model & inference ---
MODEL_PATH: Path = Path(__file__).resolve().parent.parent / ".venv" / "models" / "hand_landmarker.task"
MODEL_URL: str = (
    "https://storage.googleapis.com/mediapipe-models/"
    "hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
)

# --- Detection thresholds ---
NUM_HANDS: int = 2
MIN_HAND_DETECTION_CONFIDENCE: float = 0.5
MIN_HAND_PRESENCE_CONFIDENCE: float = 0.5
MIN_TRACKING_CONFIDENCE: float = 0.5

# --- Peace-sign classification ---
# A finger is "extended" if its tip is farther from the wrist than its PIP joint,
# by this fraction of the hand's reference length (wrist → middle MCP).
FINGER_EXTENDED_RATIO: float = 1.0
# Index & middle must be extended; thumb/ring/pinky must be folded.
# (Front- and back-of-hand share the same geometric test, so this works
# for "peace finger front or back" per the spec.)
PEACE_REQUIRED_EXTENDED: tuple[int, ...] = (1, 2)  # index, middle
PEACE_REQUIRED_FOLDED: tuple[int, ...] = (0, 3, 4)  # thumb, ring, pinky

# --- Trigger state machine ---
HOLD_FRAMES: int = 4            # consecutive frames with 2+ peace hands to engage
RELEASE_FRAMES: int = 10         # consecutive frames without peace hands to release
FADE_IN_FRAMES: int = 6          # frames spent fading blur in
FADE_OUT_FRAMES: int = 10        # frames spent fading blur out

# --- Blur ---
BLUR_KERNEL_SIZE: int = 51       # Gaussian kernel; must be odd
BLUR_PIXEL_SIZE: int = 20        # mosaic pixel size for fallback mode

# --- Camera ---
CAMERA_INDEX: int = 0
FRAME_WIDTH: int = 960
FRAME_HEIGHT: int = 540
TARGET_FPS: int = 30

# --- UI ---
INDICATOR_TEXT_ACTIVE: str = "PRIVACY ON"
INDICATOR_TEXT_TRANSITION: str = "ACTIVATING..."
INDICATOR_TEXT_RELEASE: str = "RELEASING..."
INDICATOR_COLOR_ACTIVE_BGR: tuple[int, int, int] = (60, 60, 255)   # red (BGR)
INDICATOR_COLOR_NEUTRAL_BGR: tuple[int, int, int] = (200, 200, 200)
