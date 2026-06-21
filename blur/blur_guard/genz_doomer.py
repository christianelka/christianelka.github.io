"""Doomer / terminally-online gen-z aesthetic.

Permanent jagged corner brackets + red "REC" indicator + "touch grass"
caption. On blur engagement: full red-tint wash + heavy scanlines +
noise — no text, just atmosphere.
"""
from __future__ import annotations

import cv2
import numpy as np

from . import _genz_base as base
from .trigger import TriggerState


_RED = (40, 40, 240)          # BGR red
_BLOOD = (0, 0, 140)          # BGR blood red
_BLACK = (0, 0, 0)
_WHITE = (255, 255, 255)
_GRAY = (140, 140, 140)
_FONT = cv2.FONT_HERSHEY_DUPLEX


def _corner_brackets(img: np.ndarray, size: int = 32, thickness: int = 4, color_bgr: tuple[int, int, int] = (255, 255, 255)) -> None:
    h, w = img.shape[:2]
    s = size
    t = thickness
    cv2.line(img, (0, 0), (s, 0), color_bgr, t)
    cv2.line(img, (0, 0), (0, s), color_bgr, t)
    cv2.line(img, (w - s, 0), (w - 1, 0), color_bgr, t)
    cv2.line(img, (w - 1, 0), (w - 1, s), color_bgr, t)
    cv2.line(img, (0, h - 1), (s, h - 1), color_bgr, t)
    cv2.line(img, (0, h - s - 1), (0, h - 1), color_bgr, t)
    cv2.line(img, (w - s - 1, h - 1), (w - 1, h - 1), color_bgr, t)
    cv2.line(img, (w - 1, h - s - 1), (w - 1, h - 1), color_bgr, t)


def _rec_indicator(img: np.ndarray) -> None:
    h, w = img.shape[:2]
    cv2.circle(img, (28, 28), 9, _RED, -1)
    cv2.putText(img, "REC", (46, 36), _FONT, 0.55, _WHITE, 2, cv2.LINE_AA)
    cv2.putText(img, "lol gl", (46, 60), _FONT, 0.45, _GRAY, 1, cv2.LINE_AA)


def _red_wash(img: np.ndarray, alpha: float) -> None:
    overlay = np.full_like(img, _BLOOD, dtype=np.uint8)
    cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0, img)


def render(frame: np.ndarray, state: TriggerState, blur_amount: float) -> np.ndarray:
    out = frame.copy()

    engaged = state is TriggerState.ON or (
        state in (TriggerState.BLURRING, TriggerState.RECOVERING) and blur_amount > 0.5
    )

    if engaged:
        _red_wash(out, 0.45)
        out = base.scanlines(out, spacing=2, alpha=0.35)
        out = base.add_noise(out, amount=30)
    else:
        _red_wash(out, 0.08)
        _corner_brackets(out, color_bgr=_WHITE)
        _rec_indicator(out)
        cv2.putText(
            out, "touch grass", (frame.shape[1] - 130, 40),
            _FONT, 0.5, _GRAY, 1, cv2.LINE_AA,
        )

    return out
