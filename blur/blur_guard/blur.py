"""Frame-blending utilities.

`apply_blur` returns a weighted-blend between the original frame and
a fully-blurred copy. `amount` in [0.0, 1.0] is the output of the
PrivacyTrigger — the rendering layer doesn't decide any timing.

Strategy: pre-compute one strong Gaussian blur, then alpha-blend it
with the original. Cheaper than re-blurring per fade frame, and the
visual quality is identical because Gaussian blur is linear.
"""
from __future__ import annotations

import cv2
import numpy as np

from . import config


def apply_blur(frame: np.ndarray, amount: float) -> np.ndarray:
    if frame is None or frame.size == 0:
        return frame
    amount = float(amount)
    if amount <= 0.0:
        return frame.copy()
    if amount >= 1.0:
        amount = 1.0

    blurred = cv2.GaussianBlur(frame, (config.BLUR_KERNEL_SIZE, config.BLUR_KERNEL_SIZE), 0)
    return cv2.addWeighted(blurred, amount, frame, 1.0 - amount, 0)
