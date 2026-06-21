"""Test peace-sign classifier on synthetic hand landmarks.

These tests use synthetic NormalizedLandmark lists (no webcam, no model
download required). The detector API takes a list of hand-landmark lists
and returns the count of hands in the peace pose.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from blur_guard.detector import classify_peace, count_peace_hands  # noqa: E402
from blur_guard.detector import FINGER_TIPS, FINGER_PIPS, FINGER_MCPS, WRIST  # noqa: E402


# --- helpers ---

def _lm(x: float, y: float, z: float = 0.0):
    """Build a minimal landmark-like object with .x .y .z attributes."""
    class L:
        pass
    l = L()
    l.x = x
    l.y = y
    l.z = z
    return l


def _straight_hand(thumb_extended: bool = False):
    """Hand with all 5 fingers pointing up (open palm), wrist at origin.

    Finger tips are at y=1.0; PIPs at y=0.6; MCPs at y=0.3. All extended.
    Thumb is folded by default (curled inward, x<0).
    """
    lm = [None] * 21
    lm[WRIST] = _lm(0.0, 0.0)
    # Index, middle, ring, pinky: straight up
    lm[5] = _lm(0.1, 0.3)   # index MCP
    lm[6] = _lm(0.1, 0.6)   # index PIP
    lm[7] = _lm(0.1, 0.85)  # index DIP
    lm[8] = _lm(0.1, 1.0)   # index TIP
    lm[9] = _lm(0.2, 0.3)   # middle MCP
    lm[10] = _lm(0.2, 0.6)
    lm[11] = _lm(0.2, 0.85)
    lm[12] = _lm(0.2, 1.0)  # middle TIP
    lm[13] = _lm(0.3, 0.3)  # ring MCP
    lm[14] = _lm(0.3, 0.6)
    lm[15] = _lm(0.3, 0.85)
    lm[16] = _lm(0.3, 1.0)  # ring TIP
    lm[17] = _lm(0.4, 0.3)  # pinky MCP
    lm[18] = _lm(0.4, 0.6)
    lm[19] = _lm(0.4, 0.85)
    lm[20] = _lm(0.4, 1.0)  # pinky TIP
    # Thumb: depends
    if thumb_extended:
        lm[1] = _lm(-0.3, 0.2)
        lm[2] = _lm(-0.5, 0.4)
        lm[3] = _lm(-0.6, 0.6)
        lm[4] = _lm(-0.7, 0.8)  # thumb TIP far from index MCP → extended
    else:
        # Tucked across palm, tip beside palm
        lm[1] = _lm(0.05, 0.2)
        lm[2] = _lm(0.02, 0.25)
        lm[3] = _lm(0.0, 0.3)
        lm[4] = _lm(-0.05, 0.3)  # thumb tip near index MCP → folded
    return lm


def _peace_hand(handedness_mirrored: bool = False):
    """Hand making the peace sign: index + middle extended, ring + pinky folded.

    Thumb tucked across the palm so its tip lies near the level of the
    index MCP and between the index and middle fingers. This matches the
    realistic MediaPipe output for a real peace sign and is what the
    detector's "folded thumb" branch expects.
    Front- vs back-of-hand is irrelevant: the geometry of TIP vs PIP
    relative to wrist is identical. We still synthesize both orientations
    by mirroring the X axis.
    """
    s = -1.0 if handedness_mirrored else 1.0
    lm = [None] * 21
    lm[WRIST] = _lm(0.0, 0.0)
    # Index: extended straight up
    lm[5] = _lm(s * 0.1, 0.3)
    lm[6] = _lm(s * 0.1, 0.6)
    lm[7] = _lm(s * 0.1, 0.85)
    lm[8] = _lm(s * 0.1, 1.0)  # index TIP
    # Middle: extended straight up
    lm[9] = _lm(s * 0.2, 0.3)
    lm[10] = _lm(s * 0.2, 0.6)
    lm[11] = _lm(s * 0.2, 0.85)
    lm[12] = _lm(s * 0.2, 1.0)  # middle TIP
    # Ring: folded (TIP tucked close to MCP, BELOW PIP)
    lm[13] = _lm(s * 0.3, 0.3)
    lm[14] = _lm(s * 0.31, 0.38)
    lm[15] = _lm(s * 0.32, 0.35)
    lm[16] = _lm(s * 0.32, 0.32)  # ring TIP slightly above MCP
    # Pinky: folded (TIP tucked close to MCP, BELOW PIP)
    lm[17] = _lm(s * 0.4, 0.3)
    lm[18] = _lm(s * 0.41, 0.38)
    lm[19] = _lm(s * 0.42, 0.35)
    lm[20] = _lm(s * 0.42, 0.32)  # pinky TIP slightly above MCP
    # Thumb: tucked across palm, tip near index-MCP level
    lm[1] = _lm(s * 0.05, 0.2)    # thumb MCP
    lm[2] = _lm(s * 0.02, 0.25)   # thumb CMC-ish
    lm[3] = _lm(s * 0.0, 0.3)     # thumb IP, near index MCP
    lm[4] = _lm(s * -0.05, 0.3)   # thumb tip, beside palm
    return lm


def _fist():
    """Closed fist: all fingers folded, thumb across knuckles."""
    lm = [None] * 21
    lm[WRIST] = _lm(0.0, 0.0)
    # All fingers curled: tip near MCP
    for tip, pip, mcp in zip(FINGER_TIPS, FINGER_PIPS, FINGER_MCPS):
        lm[mcp] = _lm(0.0, 0.3)
        lm[(mcp + pip) // 2 if pip > mcp else pip] = _lm(0.0, 0.32)
        lm[pip] = _lm(0.0, 0.35)
        lm[tip - 1] = _lm(0.0, 0.32)
        lm[tip] = _lm(0.0, 0.34)
    # Thumb tucked across knuckles, tip near index MCP
    lm[1] = _lm(0.05, 0.2)
    lm[2] = _lm(0.02, 0.25)
    lm[3] = _lm(0.0, 0.3)
    lm[4] = _lm(-0.05, 0.3)
    return lm


# --- classify_peace tests ---

def test_classify_peace_true_on_peace_hand():
    hand = _peace_hand()
    assert classify_peace(hand) is True


def test_classify_peace_true_on_mirrored_hand():
    """Back-of-hand (mirrored) must still classify as peace."""
    hand = _peace_hand(handedness_mirrored=True)
    assert classify_peace(hand) is True


def test_classify_peace_false_on_open_palm():
    """Open palm has ring & pinky extended → not a peace sign."""
    hand = _straight_hand()
    assert classify_peace(hand) is False


def test_classify_peace_false_on_fist():
    """Fist has all fingers folded → not a peace sign."""
    hand = _fist()
    assert classify_peace(hand) is False


def test_classify_peace_false_on_only_index_extended():
    """Pointing finger ≠ peace (middle not extended)."""
    lm = _peace_hand()
    # Curl the middle finger
    lm[12] = _lm(0.2, 0.34)  # middle TIP near MCP
    assert classify_peace(lm) is False


def test_classify_peace_false_on_only_middle_extended():
    """Middle alone ≠ peace (index not extended)."""
    lm = _peace_hand()
    lm[8] = _lm(0.1, 0.34)  # index TIP near MCP
    assert classify_peace(lm) is False


def test_classify_peace_false_on_ring_extended():
    """Three fingers up (index, middle, ring) ≠ peace (ring should be folded)."""
    lm = _peace_hand()
    lm[16] = _lm(0.34, 0.9)  # ring TIP extended
    assert classify_peace(lm) is False


# --- count_peace_hands tests ---

def test_count_peace_zero_on_empty():
    assert count_peace_hands([]) == 0


def test_count_peace_one_with_single_peace_hand():
    hands = [_peace_hand()]
    assert count_peace_hands(hands) == 1


def test_count_peace_two_with_two_peace_hands():
    hands = [_peace_hand(), _peace_hand(handedness_mirrored=True)]
    assert count_peace_hands(hands) == 2


def test_count_peace_mixed_gestures():
    hands = [_peace_hand(), _fist(), _straight_hand()]
    assert count_peace_hands(hands) == 1


def test_count_peace_none_when_no_gestures():
    hands = [_fist(), _straight_hand()]
    assert count_peace_hands(hands) == 0


# --- defensive tests ---

def test_classify_peace_handles_short_landmark_list():
    """Missing landmarks must NOT crash; return False."""
    short = [_lm(0, 0)] * 5
    assert classify_peace(short) is False


def test_classify_peace_handles_none_entries():
    """None entries in landmark list must NOT crash."""
    lm = [None] * 21
    lm[WRIST] = _lm(0, 0)
    assert classify_peace(lm) is False
