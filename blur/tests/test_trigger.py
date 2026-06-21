"""Test the PrivacyTrigger state machine.

Pure logic — no webcam, no OpenCV, no MediaPipe.
"""
from __future__ import annotations

import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from blur_guard.trigger import PrivacyTrigger, TriggerState  # noqa: E402
from blur_guard import config  # noqa: E402


def make_trigger(
    hold: int | None = None,
    release: int | None = None,
    fade_in: int | None = None,
    fade_out: int | None = None,
) -> PrivacyTrigger:
    return PrivacyTrigger(
        hold_frames=hold if hold is not None else config.HOLD_FRAMES,
        release_frames=release if release is not None else config.RELEASE_FRAMES,
        fade_in_frames=fade_in if fade_in is not None else config.FADE_IN_FRAMES,
        fade_out_frames=fade_out if fade_out is not None else config.FADE_OUT_FRAMES,
    )


# --- initial state ---

def test_initial_state_is_off():
    t = make_trigger()
    assert t.state is TriggerState.OFF
    assert t.blur_amount == 0.0


# --- OFF → BLURRING transition ---

def test_single_peace_frame_does_not_engage():
    t = make_trigger(hold=4)
    for _ in range(3):
        t.update(peace_count=2)
    assert t.state is TriggerState.OFF
    assert t.blur_amount == 0.0


def test_hold_frames_engages_blurring_state():
    t = make_trigger(hold=4)
    for _ in range(4):
        t.update(peace_count=2)
    assert t.state is TriggerState.BLURRING


def test_intermittent_signal_resets_hold_counter():
    """A peace→no-peace→peace sequence must not fast-trigger."""
    t = make_trigger(hold=4)
    t.update(peace_count=2)  # 1
    t.update(peace_count=2)  # 2
    t.update(peace_count=0)  # reset
    t.update(peace_count=2)  # 1
    t.update(peace_count=2)  # 2
    t.update(peace_count=2)  # 3
    assert t.state is TriggerState.OFF


# --- BLURRING → ON transition ---

def test_blurring_advances_fade_counter():
    t = make_trigger(hold=2, fade_in=3)
    t.update(peace_count=2)  # hold=1
    t.update(peace_count=2)  # hold=2 → BLURRING
    t.update(peace_count=2)  # fade=1
    assert t.state is TriggerState.BLURRING
    t.update(peace_count=2)  # fade=2
    t.update(peace_count=2)  # fade=3 → ON
    assert t.state is TriggerState.ON
    assert t.blur_amount == 1.0


def test_blur_amount_grows_during_fade_in():
    t = make_trigger(hold=1, fade_in=4)
    t.update(peace_count=2)  # → BLURRING (blur=0)
    t.update(peace_count=2)  # fade=1, blur=0.25
    a1 = t.blur_amount
    t.update(peace_count=2)  # fade=2, blur=0.5
    a2 = t.blur_amount
    t.update(peace_count=2)  # fade=3, blur=0.75
    a3 = t.blur_amount
    assert 0.0 < a1 < a2 < a3 <= 1.0


# --- ON state ---

def test_on_state_persists_while_peace_remains():
    t = make_trigger(hold=1, fade_in=2)
    for _ in range(5):
        t.update(peace_count=2)
    assert t.state is TriggerState.ON
    assert t.blur_amount == 1.0
    t.update(peace_count=2)
    assert t.state is TriggerState.ON
    assert t.blur_amount == 1.0


def test_on_state_with_only_one_peace_hand_still_on():
    """Once engaged, only 1 peace hand should NOT release — needs 0."""
    t = make_trigger(hold=1, fade_in=1, release=10)
    t.update(peace_count=2)  # engage
    t.update(peace_count=2)  # ON
    t.update(peace_count=1)  # still considered "signal present" → ON
    assert t.state is TriggerState.ON


# --- ON → RECOVERING ---

def test_no_peace_triggers_release_counter():
    t = make_trigger(hold=1, fade_in=1, release=3, fade_out=3)
    t.update(peace_count=2)
    t.update(peace_count=2)  # ON
    assert t.state is TriggerState.ON
    t.update(peace_count=0)
    assert t.state is TriggerState.ON  # release=1, not yet
    t.update(peace_count=0)
    t.update(peace_count=0)
    assert t.state is TriggerState.RECOVERING


def test_release_counter_resets_on_peace_resume():
    t = make_trigger(hold=1, fade_in=1, release=5, fade_out=3)
    t.update(peace_count=2)
    t.update(peace_count=2)  # ON
    t.update(peace_count=0)
    t.update(peace_count=0)  # release=2
    t.update(peace_count=2)  # peace resumes → release resets
    t.update(peace_count=0)
    t.update(peace_count=0)
    t.update(peace_count=0)
    t.update(peace_count=0)
    assert t.state is TriggerState.ON  # never reached 5 consecutive 0s


# --- RECOVERING → OFF ---

def test_recovering_returns_to_off_after_fade_out():
    t = make_trigger(hold=1, fade_in=1, release=1, fade_out=3)
    t.update(peace_count=2)
    t.update(peace_count=2)  # ON
    t.update(peace_count=0)  # release=1 → RECOVERING
    t.update(peace_count=0)  # fade=1
    t.update(peace_count=0)  # fade=2
    t.update(peace_count=0)  # fade=3 → OFF
    assert t.state is TriggerState.OFF
    assert t.blur_amount == 0.0


def test_recovering_interrupted_by_peace_returns_to_on():
    t = make_trigger(hold=1, fade_in=1, release=1, fade_out=5)
    t.update(peace_count=2)
    t.update(peace_count=2)  # ON
    t.update(peace_count=0)  # RECOVERING, fade=1
    t.update(peace_count=0)  # fade=2
    t.update(peace_count=2)  # peace again → back to ON
    assert t.state is TriggerState.ON
    assert t.blur_amount == 1.0


def test_blur_amount_decreases_during_recovering():
    t = make_trigger(hold=1, fade_in=1, release=1, fade_out=4)
    t.update(peace_count=2)
    t.update(peace_count=2)  # ON, blur=1
    t.update(peace_count=0)  # RECOVERING, fade=1
    a1 = t.blur_amount
    t.update(peace_count=0)  # fade=2
    a2 = t.blur_amount
    t.update(peace_count=0)  # fade=3
    a3 = t.blur_amount
    assert 1.0 >= a1 > a2 > a3 >= 0.0


# --- defensive ---

def test_update_with_negative_count_treated_as_zero():
    t = make_trigger(hold=1)
    t.update(peace_count=-1)
    assert t.state is TriggerState.OFF
