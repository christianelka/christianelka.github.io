"""Test frame-blending with progressive blur strength.

Uses synthetic numpy arrays (no webcam, no MediaPipe).
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from blur_guard.blur import apply_blur  # noqa: E402


def _frame(h: int = 60, w: int = 80, seed: int = 0) -> np.ndarray:
    rng = np.random.default_rng(seed)
    return rng.integers(0, 256, size=(h, w, 3), dtype=np.uint8)


# --- core contract ---

def test_apply_blur_returns_same_shape():
    frame = _frame()
    out = apply_blur(frame, amount=1.0)
    assert out.shape == frame.shape
    assert out.dtype == frame.dtype


def test_apply_blur_zero_amount_is_identity():
    frame = _frame()
    out = apply_blur(frame, amount=0.0)
    assert np.array_equal(out, frame)


def test_apply_blur_full_amount_changes_pixels():
    frame = _frame(seed=42)
    out = apply_blur(frame, amount=1.0)
    assert not np.array_equal(out, frame)


def test_apply_blur_amount_clamped_to_zero_one():
    frame = _frame()
    a = apply_blur(frame, amount=-0.5)
    b = apply_blur(frame, amount=0.0)
    assert np.array_equal(a, b)

    c = apply_blur(frame, amount=2.5)
    d = apply_blur(frame, amount=1.0)
    assert np.array_equal(c, d)


# --- monotonicity ---

def test_blur_intensity_increases_monotonically_with_amount():
    frame = _frame(seed=7)
    base = frame.astype(np.int32)
    diffs = []
    for amt in (0.0, 0.25, 0.5, 0.75, 1.0):
        out = apply_blur(frame, amount=amt)
        diff = float(np.abs(out.astype(np.int32) - base).mean())
        diffs.append(diff)
    for prev, nxt in zip(diffs, diffs[1:]):
        assert nxt >= prev, f"non-monotonic at {nxt} after {prev}"


def test_partial_blur_between_original_and_full():
    frame = _frame(seed=11)
    original = apply_blur(frame, amount=0.0)
    full = apply_blur(frame, amount=1.0)
    half = apply_blur(frame, amount=0.5)

    d_orig_half = float(np.abs(half.astype(np.int32) - original.astype(np.int32)).mean())
    d_orig_full = float(np.abs(full.astype(np.int32) - original.astype(np.int32)).mean())
    d_half_full = float(np.abs(full.astype(np.int32) - half.astype(np.int32)).mean())

    assert d_orig_half > 0
    assert d_orig_full > d_orig_half
    assert d_half_full > 0


# --- defensive ---

def test_apply_blur_does_not_mutate_input():
    frame = _frame(seed=99)
    snapshot = frame.copy()
    _ = apply_blur(frame, amount=0.7)
    assert np.array_equal(frame, snapshot)


def test_apply_blur_handles_small_frame():
    tiny = _frame(h=10, w=10, seed=3)
    out = apply_blur(tiny, amount=1.0)
    assert out.shape == tiny.shape
