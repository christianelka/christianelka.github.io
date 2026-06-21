"""Cottagecore / soft-girl gen-z aesthetic.

Pastel pink + lavender + cream. Dreamy, soft, hyper-feminine. Permanent
dainty border + cursive-feel "it girl" text. On blur engagement: a
big "living for this" sticker + soft pink overlay wash.
"""
from __future__ import annotations

import cv2
import numpy as np

from . import _genz_base as base
from .trigger import TriggerState


_PINK = (214, 183, 222)       # BGR pastel pink #DEB7D6 (BGR approx)
_LAVENDER = (192, 162, 220)   # BGR lavender
_DEEP = (140, 100, 170)       # BGR deep lavender (text)
_FONT = cv2.FONT_HERSHEY_SCRIPT_SIMPLEX


def _cursive_corner(img: np.ndarray, text: str, color_bgr: tuple[int, int, int], corner: str) -> None:
    h, w = img.shape[:2]
    (tw, th), _ = cv2.getTextSize(text, _FONT, 1.1, 2)
    margin = 28
    if corner == "tl":
        x, y = margin, margin + th
    elif corner == "tr":
        x, y = w - tw - margin, margin + th
    elif corner == "bl":
        x, y = margin, h - margin
    else:
        x, y = w - tw - margin, h - margin
    cv2.putText(img, text, (x, y), _FONT, 1.1, color_bgr, 2, cv2.LINE_AA)


def _soft_overlay(img: np.ndarray, color_bgr: tuple[int, int, int], alpha: float) -> None:
    overlay = np.full_like(img, color_bgr, dtype=np.uint8)
    cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)


def render(frame: np.ndarray, state: TriggerState, blur_amount: float) -> np.ndarray:
    out = frame.copy()
    h, w = out.shape[:2]

    engaged = state is TriggerState.ON or (
        state in (TriggerState.BLURRING, TriggerState.RECOVERING) and blur_amount > 0.5
    )

    if engaged:
        _soft_overlay(out, _PINK, 0.35)
    else:
        _soft_overlay(out, _LAVENDER, 0.08)
        base.chunky_border(out, _PINK, thickness=4)
        _cursive_corner(out, "bestie cam", _DEEP, "tl")
        _cursive_corner(out, "so fetch ~", _DEEP, "tr")
        _cursive_corner(out, "it girl", _DEEP, "bl")
        _cursive_corner(out, "stay cute", _DEEP, "br")
        cv2.line(out, (60, h - 70), (w - 60, h - 70), _DEEP, 1, cv2.LINE_AA)
        cv2.putText(
            out, "xoxo, blur guard", (w // 2 - 80, h - 40),
            _FONT, 0.6, _DEEP, 1, cv2.LINE_AA,
        )

    return out
