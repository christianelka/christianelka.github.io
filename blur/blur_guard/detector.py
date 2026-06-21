"""Hand detection and peace-sign classification.

`HandDetector` wraps MediaPipe's HandLandmarker for the webcam pipeline.
`classify_peace` and `count_peace_hands` operate on landmark lists and are
unit-testable without a webcam or model.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Protocol

import numpy as np

from . import config


# --- MediaPipe landmark indices ---
# https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
WRIST = 0
THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP = 4, 8, 12, 16, 20
THUMB_MCP, INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP = 1, 5, 9, 13, 17
THUMB_IP, INDEX_PIP, MIDDLE_PIP, RING_PIP, PINKY_PIP = 3, 6, 10, 14, 18

FINGER_TIPS = (THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP)
FINGER_PIPS = (THUMB_IP, INDEX_PIP, MIDDLE_PIP, RING_PIP, PINKY_PIP)
FINGER_MCPS = (THUMB_MCP, INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP)
# Finger index (matches PEACE_REQUIRED_* tuples in config): 0=thumb, 1=index, ...
FINGER_OF_TIP = {THUMB_TIP: 0, INDEX_TIP: 1, MIDDLE_TIP: 2, RING_TIP: 3, PINKY_TIP: 4}
FINGER_OF_PIP = {THUMB_IP: 0, INDEX_PIP: 1, MIDDLE_PIP: 2, RING_PIP: 3, PINKY_PIP: 4}
FINGER_OF_MCP = {THUMB_MCP: 0, INDEX_MCP: 1, MIDDLE_MCP: 2, RING_MCP: 3, PINKY_MCP: 4}


class _Landmark(Protocol):
    x: float
    y: float
    z: float


def _dist(a: _Landmark, b: _Landmark) -> float:
    return math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)


def _is_extended(landmarks: list, finger_idx: int) -> bool:
    """Front/back-agnostic finger extension test.

    A non-thumb finger is extended when its TIP is farther from the WRIST
    than its PIP. This geometric test is identical for palm-front and
    palm-back, so it works for "peace finger front or back" without
    an orientation branch.

    The thumb is treated specially because in a curled state it points
    *across* the palm (not away from the wrist), so wrist-distance can't
    distinguish extended vs folded reliably. Instead, the thumb is
    considered extended when its tip is meaningfully far from the
    index-finger MCP — i.e. pointing away from the palm.
    """
    if landmarks is None or len(landmarks) < 21:
        return False
    wrist = landmarks[WRIST]
    if wrist is None or landmarks[MIDDLE_MCP] is None:
        return False
    hand_size = _dist(wrist, landmarks[MIDDLE_MCP])
    if hand_size < 1e-6:
        return False

    if finger_idx == 0:
        thumb_tip = landmarks[THUMB_TIP]
        index_mcp = landmarks[INDEX_MCP]
        if thumb_tip is None or index_mcp is None:
            return False
        return _dist(thumb_tip, index_mcp) > config.FINGER_EXTENDED_RATIO * hand_size

    tip = landmarks[FINGER_TIPS[finger_idx]]
    pip = landmarks[FINGER_PIPS[finger_idx]]
    mcp = landmarks[FINGER_MCPS[finger_idx]]
    if tip is None or pip is None or mcp is None:
        return False
    return _dist(wrist, tip) > config.FINGER_EXTENDED_RATIO * _dist(wrist, pip)


def classify_peace(landmarks: list) -> bool:
    """True iff index & middle are extended AND thumb, ring, pinky are folded."""
    if not landmarks or len(landmarks) < 21 or landmarks[WRIST] is None:
        return False
    for f in config.PEACE_REQUIRED_EXTENDED:
        if not _is_extended(landmarks, f):
            return False
    for f in config.PEACE_REQUIRED_FOLDED:
        if _is_extended(landmarks, f):
            return False
    return True


def count_peace_hands(hands_landmarks: Iterable[list]) -> int:
    return sum(1 for h in hands_landmarks if classify_peace(h))


@dataclass
class HandDetector:
    """Lazy wrapper around MediaPipe HandLandmarker.

    The model is heavy (7.8MB) and takes a moment to load. Construct only
    when actually starting the webcam loop. Tests use `classify_peace`
    directly without instantiating this.
    """

    model_path: Path = config.MODEL_PATH
    num_hands: int = config.NUM_HANDS
    min_detection_confidence: float = config.MIN_HAND_DETECTION_CONFIDENCE
    min_presence_confidence: float = config.MIN_HAND_PRESENCE_CONFIDENCE
    min_tracking_confidence: float = config.MIN_TRACKING_CONFIDENCE

    def __post_init__(self):
        import mediapipe as mp

        self._mp = mp

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"HandLandmarker model not found at {self.model_path}. "
                f"Download from {config.MODEL_URL} and place it there."
            )

        from mediapipe.tasks import python as mp_python
        from mediapipe.tasks.python import vision as mp_vision

        base_options = mp_python.BaseOptions(model_asset_path=str(self.model_path))
        options = mp_vision.HandLandmarkerOptions(
            base_options=base_options,
            num_hands=self.num_hands,
            min_hand_detection_confidence=self.min_detection_confidence,
            min_hand_presence_confidence=self.min_presence_confidence,
            min_tracking_confidence=self.min_tracking_confidence,
            running_mode=mp_vision.RunningMode.IMAGE,
        )
        self._landmarker = mp_vision.HandLandmarker.create_from_options(options)

    def detect(self, frame_bgr: np.ndarray) -> list[list]:
        """Return a list of per-hand landmark lists for the given BGR frame.

        Each per-hand list has 21 NormalizedLandmark objects.
        """
        rgb = self._mp.Image(image_format=self._mp.ImageFormat.SRGB, data=cv2_to_rgb(frame_bgr))
        result = self._landmarker.detect(rgb)
        return [list(hand) for hand in result.hand_landmarks]

    def close(self):
        if hasattr(self, "_landmarker"):
            self._landmarker.close()


def cv2_to_rgb(frame_bgr: np.ndarray) -> np.ndarray:
    """Convert a contiguous BGR uint8 array to RGB (MediaPipe Image data)."""
    import cv2

    if not frame_bgr.flags["C_CONTIGUOUS"]:
        frame_bgr = np.ascontiguousarray(frame_bgr)
    return cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
