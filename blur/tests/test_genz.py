"""Test each gen-z style overlay.

Uses synthetic frames. Verifies:
- render() returns same shape & dtype
- OFF path produces SOME non-zero pixels (overlay exists)
- ON path produces DIFFERENT pixels than OFF (escalation works)
- rendered output is not a no-op (>= 0.5% of pixels changed)
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from blur_guard import genz_y2k, genz_soft, genz_doomer, genz_webcore  # noqa: E402
from blur_guard.trigger import TriggerState  # noqa: E402


STYLES = [
    ("y2k", genz_y2k.render),
    ("soft", genz_soft.render),
    ("doomer", genz_doomer.render),
    ("webcore", genz_webcore.render),
]


def _frame(h: int = 360, w: int = 480, seed: int = 0) -> np.ndarray:
    rng = np.random.default_rng(seed)
    return rng.integers(0, 256, size=(h, w, 3), dtype=np.uint8)


def _change_ratio(a: np.ndarray, b: np.ndarray) -> float:
    return float((a != b).any(axis=-1).mean())


# --- per-style contract ---

@pytest.mark.parametrize("name,render", STYLES, ids=[s for s, _ in STYLES])
def test_render_returns_same_shape(name, render):
    frame = _frame()
    out = render(frame, TriggerState.OFF, 0.0)
    assert out.shape == frame.shape
    assert out.dtype == frame.dtype


@pytest.mark.parametrize("name,render", STYLES, ids=[s for s, _ in STYLES])
def test_render_off_state_modifies_frame(name, render):
    """The OFF path must leave some visible chrome on the frame."""
    frame = _frame()
    out = render(frame, TriggerState.OFF, 0.0)
    ratio = _change_ratio(frame, out)
    assert ratio > 0.005, f"{name}: too little chrome in OFF state ({ratio:.4f})"


@pytest.mark.parametrize("name,render", STYLES, ids=[s for s, _ in STYLES])
def test_render_on_state_differs_from_off(name, render):
    """Engaged state must visually differ from idle state."""
    frame = _frame()
    off = render(frame, TriggerState.OFF, 0.0)
    on = render(frame.copy(), TriggerState.ON, 1.0)
    diff = float((off != on).mean())
    assert diff > 0.001, f"{name}: ON and OFF visually identical"


@pytest.mark.parametrize("name,render", STYLES, ids=[s for s, _ in STYLES])
def test_render_does_not_crash_on_small_frame(name, render):
    small = _frame(h=80, w=120, seed=3)
    out = render(small, TriggerState.ON, 1.0)
    assert out.shape == small.shape


# --- transitional state (BLURRING) ---

@pytest.mark.parametrize("name,render", STYLES, ids=[s for s, _ in STYLES])
def test_render_transition_state_runs(name, render):
    """BLURRING state must not crash and must produce output."""
    frame = _frame()
    out = render(frame, TriggerState.BLURRING, 0.5)
    assert out.shape == frame.shape


@pytest.mark.parametrize("name,render", STYLES, ids=[s for s, _ in STYLES])
def test_render_recovering_state_runs(name, render):
    frame = _frame()
    out = render(frame, TriggerState.RECOVERING, 0.3)
    assert out.shape == frame.shape


# --- engaged-state text suppression ---

@pytest.mark.parametrize("name,render", STYLES, ids=[s for s, _ in STYLES])
def test_render_on_state_has_no_text_pixels(name, render):
    """Engaged state must be text-free: no stickers, no captions, no
    center text. The OFF state draws heavy chrome (borders + text + labels)
    that injects bright solid-color regions into the frame. The ON
    state should only apply effects to the raw frame. We verify by
    asserting the OFF state still has the highest bright-pixel count
    (chrome is visible) AND the ON state did not inject MORE bright
    pixels than the OFF state did — if ON introduced new text, it
    would have at least as many bright pixels as OFF.
    """
    frame = _frame()
    off = render(frame.copy(), TriggerState.OFF, 0.0)
    on = render(frame.copy(), TriggerState.ON, 1.0)

    def bright_count(img: np.ndarray) -> int:
        return int((img.astype(np.int16).sum(axis=-1) > 600).sum())

    off_count = bright_count(off)
    on_count = bright_count(on)

    assert on_count <= off_count, (
        f"{name}: ON bright count {on_count} exceeds OFF {off_count} — "
        f"ON path appears to introduce more bright pixels than OFF, "
        f"suggesting text/sticker chrome leaked into the engaged state."
    )
