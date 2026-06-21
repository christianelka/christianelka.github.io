"""On-frame indicator overlay for the active privacy state.

Draws a top-bar pill with the current status text. Pure rendering —
no detection, no state machine. `draw_indicator(frame, state, blur_amount)`
mutates a copy of `frame` and returns it.
"""
from __future__ import annotations

import cv2
import numpy as np

from . import config
from .trigger import TriggerState


_FONT = cv2.FONT_HERSHEY_SIMPLEX
_FONT_SCALE = 0.7
_FONT_THICKNESS = 2
_PADDING = 14


def draw_indicator(frame: np.ndarray, state: TriggerState, blur_amount: float) -> np.ndarray:
    out = frame
    if state is TriggerState.OFF or blur_amount <= 0.0:
        return out

    if state is TriggerState.ON:
        text = config.INDICATOR_TEXT_ACTIVE
        color = config.INDICATOR_COLOR_ACTIVE_BGR
    elif state is TriggerState.BLURRING:
        text = config.INDICATOR_TEXT_TRANSITION
        color = config.INDICATOR_COLOR_NEUTRAL_BGR
    else:
        text = config.INDICATOR_TEXT_RELEASE
        color = config.INDICATOR_COLOR_NEUTRAL_BGR

    (text_w, text_h), baseline = cv2.getTextSize(text, _FONT, _FONT_SCALE, _FONT_THICKNESS)
    bar_w = text_w + _PADDING * 2
    bar_h = text_h + baseline + _PADDING * 2
    h, w = out.shape[:2]
    x0 = (w - bar_w) // 2
    y0 = 20

    overlay = out.copy()
    cv2.rectangle(overlay, (x0, y0), (x0 + bar_w, y0 + bar_h), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.55, out, 0.45, 0, out)

    text_x = x0 + _PADDING
    text_y = y0 + _PADDING + text_h
    cv2.putText(out, text, (text_x, text_y), _FONT, _FONT_SCALE, color, _FONT_THICKNESS, cv2.LINE_AA)
    return out
