"""Shared rendering primitives for the gen-z style overlays.

Kept small on purpose: a sticker-style text block, a chunky border,
and helpers for adding scanlines / RGB-split channels. Each style
file imports from here so visual primitives stay consistent.
"""
from __future__ import annotations

import math
import random

import cv2
import numpy as np


# --- text helpers ---

def draw_stroked_text(
    img: np.ndarray,
    text: str,
    pos: tuple[int, int],
    font: int,
    scale: float,
    color_bgr: tuple[int, int, int],
    stroke_bgr: tuple[int, int, int] = (0, 0, 0),
    thickness: int = 2,
    stroke_thickness: int = 4,
) -> None:
    cv2.putText(img, text, pos, font, scale, stroke_bgr, stroke_thickness, cv2.LINE_AA)
    cv2.putText(img, text, pos, font, scale, color_bgr, thickness, cv2.LINE_AA)


def text_size(text: str, font: int, scale: float, thickness: int) -> tuple[int, int]:
    (w, h), _ = cv2.getTextSize(text, font, scale, thickness)
    return w, h


# --- borders ---

def chunky_border(
    img: np.ndarray,
    color_bgr: tuple[int, int, int],
    thickness: int = 8,
) -> None:
    h, w = img.shape[:2]
    cv2.rectangle(img, (0, 0), (w - 1, h - 1), color_bgr, thickness)


# --- RGB channel split (chromatic aberration look) ---

def rgb_split(
    img: np.ndarray,
    offset: int = 6,
) -> np.ndarray:
    """Shift the R and B channels by ±offset on the X axis.

    Cheap "glitch" effect. Larger offset = more chaotic.
    """
    h, w = img.shape[:2]
    out = img.copy()
    b, g, r = cv2.split(out)
    M = np.float32([[1, 0, offset], [0, 1, 0]])
    M2 = np.float32([[1, 0, -offset], [0, 1, 0]])
    r_shift = cv2.warpAffine(r, M, (w, h), borderMode=cv2.BORDER_REPLICATE)
    b_shift = cv2.warpAffine(b, M2, (w, h), borderMode=cv2.BORDER_REPLICATE)
    out = cv2.merge([b_shift, g, r_shift])
    return out


# --- scanlines ---

def scanlines(img: np.ndarray, spacing: int = 3, alpha: float = 0.25) -> np.ndarray:
    h, w = img.shape[:2]
    out = img.copy()
    for y in range(0, h, spacing):
        out[y] = (out[y].astype(np.float32) * (1 - alpha)).astype(np.uint8)
    return out


# --- CRT / VHS noise ---

def add_noise(img: np.ndarray, amount: int = 18, seed: int | None = None) -> np.ndarray:
    rng = np.random.default_rng(seed)
    noise = rng.integers(-amount, amount + 1, size=img.shape, dtype=np.int16)
    out = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    return out


# --- solid sticker (rounded rect filled) ---

def sticker(
    img: np.ndarray,
    x: int,
    y: int,
    w: int,
    h: int,
    fill_bgr: tuple[int, int, int],
    border_bgr: tuple[int, int, int] = (0, 0, 0),
    radius: int = 12,
    border_thickness: int = 3,
) -> None:
    overlay = img.copy()
    cv2.rectangle(overlay, (x, y), (x + w, y + h), fill_bgr, -1)
    cv2.addWeighted(overlay, 1.0, img, 0.0, 0, img)
    cv2.rectangle(img, (x, y), (x + w, y + h), border_bgr, border_thickness)
