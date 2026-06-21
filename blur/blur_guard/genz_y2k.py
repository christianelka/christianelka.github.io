"""Y2K + chaos-core gen-z aesthetic.

Hot pink + cyan, RGB chromatic aberration, chunky sticker badges
slapped across the corners, glittery micro-noise. Permanent chrome
border. On blur engagement the whole frame takes over with a giant
"bestie cam OFF" sticker + scanlines.
"""
from __future__ import annotations

import cv2
import numpy as np

from . import _genz_base as base
from .trigger import TriggerState


_PINK = (186, 71, 217)        # BGR hot pink #D947BA
_CYAN = (227, 217, 26)        # BGR cyan #1AD9E3 (approx)
_BLACK = (0, 0, 0)
_WHITE = (255, 255, 255)
_FONT = cv2.FONT_HERSHEY_DUPLEX
_FONT_BOLD = cv2.FONT_HERSHEY_TRIPLEX


def _sticker_corner(img: np.ndarray, text: str, color_bgr: tuple[int, int, int], corner: str) -> None:
    h, w = img.shape[:2]
    (tw, th), _ = cv2.getTextSize(text, _FONT_BOLD, 0.8, 2)
    pad = 18
    box_w = tw + pad * 2
    box_h = th + pad * 2
    margin = 16
    if corner == "tl":
        x, y = margin, margin
    elif corner == "tr":
        x, y = w - box_w - margin, margin
    elif corner == "bl":
        x, y = margin, h - box_h - margin
    else:
        x, y = w - box_w - margin, h - box_h - margin
    base.sticker(img, x, y, box_w, box_h, color_bgr, _BLACK, radius=14, border_thickness=4)
    base.draw_stroked_text(
        img, text,
        (x + pad, y + pad + th),
        _FONT_BOLD, 0.8, _WHITE, _BLACK, thickness=2, stroke_thickness=5,
    )


def render(frame: np.ndarray, state: TriggerState, blur_amount: float) -> np.ndarray:
    out = frame.copy()

    engaged = state is TriggerState.ON or (
        state in (TriggerState.BLURRING, TriggerState.RECOVERING) and blur_amount > 0.5
    )

    if engaged:
        out = base.rgb_split(out, offset=10)
        out = base.scanlines(out, spacing=4, alpha=0.2)
        out = base.add_noise(out, amount=22)
    else:
        out = base.add_noise(out, amount=8)
        base.chunky_border(out, _PINK, thickness=10)
        _sticker_corner(out, "bestie cam", _PINK, "tl")
        _sticker_corner(out, "no cap", _CYAN, "tr")
        _sticker_corner(out, "slay", _CYAN, "bl")
        _sticker_corner(out, "its giving", _PINK, "br")

    return out
