"""Weirdcore / webcore gen-z aesthetic.

Old-web revival. Permanent lime border, animated rainbow marquee,
blinking <hr>, "under construction!!" caption, rotating "bestie cam"
badge. On blur engagement: noise grain only — no text, just
texture, so the user gets a clean visual signal that privacy mode
took over without chrome fighting the blurred feed.
"""
from __future__ import annotations

import time

import cv2
import numpy as np

from . import _genz_base as base
from .trigger import TriggerState


_LIME = (0, 255, 0)            # BGR lime
_MAGENTA = (255, 0, 255)       # BGR magenta
_YELLOW = (0, 255, 255)        # BGR yellow
_BLACK = (0, 0, 0)
_WHITE = (255, 255, 255)
_FONT_PIXEL = cv2.FONT_HERSHEY_PLAIN


def _draw_marquee(img: np.ndarray, text: str, y: int, t: float) -> None:
    h, w = img.shape[:2]
    (tw, th), _ = cv2.getTextSize(text, _FONT_PIXEL, 1.4, 2)
    spacing = tw + 60
    offset = int((t * 80) % spacing) - spacing
    x = offset
    while x < w:
        cv2.putText(img, text, (x, y), _FONT_PIXEL, 1.4, _LIME, 2, cv2.LINE_AA)
        x += spacing


def _blinking_hr(img: np.ndarray, y: int, t: float) -> None:
    h, w = img.shape[:2]
    on = int(t * 2) % 2 == 0
    if on:
        cv2.line(img, (10, y), (w - 10, y), _WHITE, 2)


def _rotate_text(img: np.ndarray, text: str, center: tuple[int, int], t: float, color_bgr: tuple[int, int, int]) -> None:
    angle = (t * 30) % 360
    font = cv2.FONT_HERSHEY_SIMPLEX
    (tw, th), _ = cv2.getTextSize(text, font, 0.8, 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    tmp = np.zeros_like(img)
    cv2.putText(tmp, text, (center[0] - tw // 2, center[1] + th // 2), font, 0.8, color_bgr, 2, cv2.LINE_AA)
    rotated = cv2.warpAffine(tmp, M, (img.shape[1], img.shape[0]))
    mask = rotated > 0
    img[mask] = rotated[mask]


def render(frame: np.ndarray, state: TriggerState, blur_amount: float) -> np.ndarray:
    out = frame.copy()
    h, w = out.shape[:2]
    t = time.time()

    engaged = state is TriggerState.ON or (
        state in (TriggerState.BLURRING, TriggerState.RECOVERING) and blur_amount > 0.5
    )

    if engaged:
        base.add_noise(out, amount=10)
    else:
        base.add_noise(out, amount=4)
        cv2.rectangle(out, (0, 0), (w - 1, h - 1), _LIME, 3)
        _draw_marquee(out, "~ welcome to my cam ~ uwu ~", 36, t)
        _blinking_hr(out, 60, t)
        cv2.putText(out, "under construction!!", (20, h - 60), _FONT_PIXEL, 1.6, _YELLOW, 2, cv2.LINE_AA)
        cv2.putText(out, "xoxo ~ blur guard", (20, h - 30), _FONT_PIXEL, 1.0, _WHITE, 1, cv2.LINE_AA)
        _rotate_text(out, "bestie cam", (w - 90, h - 90), t, _MAGENTA)

    return out
